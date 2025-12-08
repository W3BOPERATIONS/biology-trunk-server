import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

console.log("🔧 Environment Variables Check:")
console.log("  RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "✓ SET" : "✗ NOT SET")
console.log("  RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✓ SET" : "✗ NOT SET")
console.log("  EMAIL_USER:", process.env.EMAIL_USER ? "✓ SET" : "✗ NOT SET")
console.log("  EMAIL_APP_PASSWORD:", process.env.EMAIL_APP_PASSWORD ? "✓ SET" : "✗ NOT SET")
console.log("  FRONTEND_URL:", process.env.FRONTEND_URL || "http://localhost:5173")

const app = express()

// **Frontend URLs for CORS**
const allowedOrigins = [
  "https://biologytrunk.in",
  "https://www.biologytrunk.in",
  "https://biology-trunk-client.vercel.app", // Your deployed frontend
  "http://localhost:3000", // Local development
  "http://localhost:5173", // Vite dev server
  "https://biology-trunk.vercel.app", // Alternative domain
]

// **Enhanced CORS Configuration**
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (
      allowedOrigins.some((allowedOrigin) => {
        if (allowedOrigin.includes("*")) {
          // Handle wildcard subdomains
          const regex = new RegExp(allowedOrigin.replace("*", ".*"))
          return regex.test(origin)
        }
        return allowedOrigin === origin
      })
    ) {
      callback(null, true)
    } else {
      console.log(`🚫 CORS blocked: ${origin}`)
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true, // Allow cookies/sessions
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Content-Length", "Authorization"],
  maxAge: 86400, // 24 hours
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// **Add CORS headers for preflight requests**
app.options("*", cors(corsOptions))

// **Log environment variables (safely)**
console.log("🔧 Environment Configuration:")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("PORT:", process.env.PORT)
console.log("Frontend URL:", "https://biology-trunk-client.vercel.app")
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI
    ? process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, "$1***:***@")
    : "Not set",
)

// **MongoDB Connection Handler**
let isConnecting = false
let connectionRetries = 0
const MAX_RETRIES = 3

const connectToDatabase = async () => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    console.log("✅ Already connected to MongoDB")
    return true
  }

  // If already connecting, wait
  if (isConnecting) {
    console.log("⏳ Already connecting to MongoDB, waiting...")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return mongoose.connection.readyState === 1
  }

  isConnecting = true
  connectionRetries++

  try {
    // Check if URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set")
    }

    console.log(`🔄 Connecting to MongoDB (Attempt ${connectionRetries})...`)

    // **Your specific connection options**
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: "majority",
      ssl: true,
      tls: true,
      // Your specific appName parameter
      appName: "Cluster0",
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, connectionOptions)

    console.log("✅ MongoDB Connected Successfully!")
    console.log(`📊 Database: ${mongoose.connection.name}`)
    console.log(`🔗 Host: ${mongoose.connection.host}`)
    console.log(`👤 User: ${mongoose.connection.user || "N/A"}`)

    // Set up connection event handlers
    mongoose.connection.on("connected", () => {
      console.log("✅ Mongoose connected to DB")
      isConnecting = false
    })

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err.message)
      isConnecting = false
    })

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected")
      isConnecting = false
    })

    mongoose.connection.on("reconnected", () => {
      console.log("🔁 Mongoose reconnected")
      isConnecting = false
    })

    return true
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message)

    // Specific error handling
    if (error.name === "MongoNetworkError") {
      console.log("🔧 Fix: Check MongoDB Atlas Network Access - Add IP 0.0.0.0/0")
    } else if (error.message.includes("auth failed")) {
      console.log("🔧 Fix: Check database username/password in connection string")
    } else if (error.message.includes("ENOTFOUND")) {
      console.log("🔧 Fix: Check MongoDB Atlas cluster name in connection string")
    }

    isConnecting = false

    // Retry logic
    if (connectionRetries < MAX_RETRIES) {
      console.log(`🔄 Retrying connection in 3 seconds... (${MAX_RETRIES - connectionRetries} attempts left)`)
      await new Promise((resolve) => setTimeout(resolve, 3000))
      return await connectToDatabase()
    }

    return false
  }
}

// **Initialize Database Connection**
const initializeDatabase = async () => {
  console.log("🚀 Initializing Database Connection...")
  const connected = await connectToDatabase()

  if (connected) {
    console.log("🎉 Database initialization complete!")
  } else {
    console.log("❌ Database initialization failed after maximum retries")
  }
}

// Start connection based on environment
if (process.env.NODE_ENV !== "test") {
  initializeDatabase().catch(console.error)
}

// **Database Middleware**
app.use(async (req, res, next) => {
  // Skip DB check for health endpoints
  if (req.path.startsWith("/api/health") || req.path.startsWith("/api/test") || req.path === "/api/debug") {
    return next()
  }

  // If DB is not connected, try to reconnect
  if (mongoose.connection.readyState !== 1) {
    console.log(`⚠️ DB not connected for ${req.path}, attempting quick reconnect...`)
    try {
      await connectToDatabase()
    } catch (error) {
      console.error("Quick reconnect failed:", error.message)
    }
  }
  next()
})

// Import routes
import userRoutes from "./routes/userRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import enrollmentRoutes from "./routes/enrollmentRoutes.js"
import contentRoutes from "./routes/contentRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import progressRoutes from "./routes/progressRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"

// Routes
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/enrollments", enrollmentRoutes)
app.use("/api/content", contentRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/progress", progressRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/contact", contactRoutes)

// **Enhanced Health Check Endpoint**
app.get("/api/health", async (req, res) => {
  const dbState = mongoose.connection.readyState
  const stateMap = {
    0: "❌ DISCONNECTED",
    1: "✅ CONNECTED",
    2: "🔄 CONNECTING",
    3: "⏳ DISCONNECTING",
  }

  // Database information
  const dbInfo = {
    status: stateMap[dbState] || "❓ UNKNOWN",
    readyState: dbState,
    isConnected: dbState === 1,
    host: mongoose.connection.host || "N/A",
    database: mongoose.connection.name || "N/A",
    collections: [],
    ping: "N/A",
  }

  // If connected, get more details
  if (dbState === 1 && mongoose.connection.db) {
    try {
      // Ping database
      const pingStart = Date.now()
      await mongoose.connection.db.admin().ping()
      const pingEnd = Date.now()
      dbInfo.ping = `${pingEnd - pingStart}ms`

      // Get collections
      const collections = await mongoose.connection.db.listCollections().toArray()
      dbInfo.collections = collections.map((c) => c.name)
    } catch (error) {
      dbInfo.ping = `Error: ${error.message}`
    }
  }

  res.json({
    status: "API Server is Running",
    environment: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    serverTime: new Date().toString(),

    database: dbInfo,

    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      },
    },

    connectionStats: {
      retries: connectionRetries,
      isConnecting: isConnecting,
      appName: "Cluster0",
    },
  })
})

// **Simple Connection Test Endpoint**
app.get("/api/test-connection", async (req, res) => {
  try {
    console.log("🧪 Testing MongoDB Connection...")

    const startTime = Date.now()

    // Ensure connection
    if (mongoose.connection.readyState !== 1) {
      console.log("Not connected, attempting connection...")
      const connected = await connectToDatabase()
      if (!connected) {
        throw new Error("Could not establish database connection")
      }
    }

    // Test with simple query
    const pingResult = await mongoose.connection.db.admin().ping()
    const collections = await mongoose.connection.db.listCollections().toArray()
    const endTime = Date.now()

    res.json({
      success: true,
      message: "🎉 MongoDB Connection Successful!",
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
      responseTime: `${endTime - startTime}ms`,
      details: {
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        cluster: "Cluster0",
        collectionsCount: collections.length,
        sampleCollections: collections.slice(0, 5).map((c) => c.name),
      },
      connection: {
        state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState],
        retryAttempts: connectionRetries,
      },
    })
  } catch (error) {
    console.error("Connection test failed:", error)

    res.status(500).json({
      success: false,
      error: error.name || "ConnectionError",
      message: error.message,
      currentState: mongoose.connection.readyState,
      environment: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
      suggestions: [
        "1. Verify MONGODB_URI in Vercel environment variables",
        "2. Check MongoDB Atlas → Network Access → Add IP 0.0.0.0/0",
        "3. Verify database user credentials",
        "4. Check if cluster is running in MongoDB Atlas",
      ],
    })
  }
})

// **Quick Status Endpoint**
app.get("/api/status", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1

  res.json({
    service: "EduTech Backend API",
    status: "operational",
    database: isDbConnected ? "connected" : "disconnected",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    timestamp: new Date().toISOString(),
    quickActions: {
      health: "/api/health",
      testConnection: "/api/test-connection",
      reconnect: "/api/reconnect-db",
      frontend: process.env.FRONTEND_URL || "http://localhost:5173",
    },
  })
})

// **Manual Reconnect Endpoint**
app.get("/api/reconnect-db", async (req, res) => {
  try {
    console.log("Manual reconnect requested...")

    // Reset connection retries
    connectionRetries = 0

    // Disconnect if already connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
      console.log("Disconnected from MongoDB")
    }

    // Connect again
    const connected = await connectToDatabase()

    if (connected) {
      res.json({
        success: true,
        message: "✅ Successfully reconnected to MongoDB",
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
        connectionState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        database: mongoose.connection.name,
      })
    } else {
      res.status(500).json({
        success: false,
        message: "❌ Failed to reconnect to MongoDB",
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
        connectionState: mongoose.connection.readyState,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
      connectionState: mongoose.connection.readyState,
    })
  }
})

// **Frontend Connection Test Endpoint**
app.get("/api/check-frontend", (req, res) => {
  res.json({
    success: true,
    message: "Frontend is properly configured",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    corsStatus: "enabled",
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    timestamp: new Date().toISOString(),
  })
})

// **Root Endpoint**
app.get("/", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1

  res.json({
    message: "🚀 EduTech Backend API",
    version: "1.0.0",
    status: {
      api: "running",
      database: isDbConnected ? "✅ connected" : "❌ disconnected",
      frontend: "✅ https://biology-trunk-client.vercel.app",
      environment: process.env.NODE_ENV || "development",
    },
    endpoints: {
      root: "/",
      health: "/api/health",
      testConnection: "/api/test-connection",
      status: "/api/status",
      checkFrontend: "/api/check-frontend",
    },
    quickCheck: `Database is ${isDbConnected ? "CONNECTED" : "DISCONNECTED"}`,
    frontendLink: process.env.FRONTEND_URL || "http://localhost:5173",
    timestamp: new Date().toISOString(),
  })
})

// **Error Handling Middleware**
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err.stack)

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    databaseStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    timestamp: new Date().toISOString(),
  })
})

// **404 Handler**
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    availableEndpoints: {
      root: "/",
      health: "/api/health",
      testConnection: "/api/test-connection",
      status: "/api/status",
      checkFrontend: "/api/check-frontend",
    },
  })
})

// **Export for Vercel**
export default app

// **Local Development Server**
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000

  app.listen(PORT, () => {
    console.log(`\n🎯 Server Information:`)
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`)
    console.log(`   Server URL: http://localhost:${PORT}`)
    console.log(`   Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
    console.log(`   Health Check: http://localhost:${PORT}/api/health`)
    console.log(`   Test Connection: http://localhost:${PORT}/api/test-connection`)
    console.log(`\n📊 Waiting for database connection...`)
  })
}
