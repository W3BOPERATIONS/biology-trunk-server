import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// **DEBUG: Log environment variables (password hidden)**
console.log("Environment check:")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI)
if (process.env.MONGODB_URI) {
  const safeUri = process.env.MONGODB_URI.replace(
    /(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/,
    '$1***:***@'
  )
  console.log("MONGODB_URI (safe):", safeUri)
}

// **FIXED: MongoDB Connection with better error handling**
let isDbConnected = false
let connectionAttempts = 0

const connectDB = async () => {
  if (isDbConnected) {
    console.log("✅ Already connected to MongoDB")
    return true
  }

  // Check if MONGODB_URI exists
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is missing!")
    console.log("Please set MONGODB_URI in Vercel Environment Variables")
    return false
  }

  connectionAttempts++
  console.log(`Attempting MongoDB connection (attempt ${connectionAttempts})...`)

  try {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    // **CRITICAL FIX: Use these exact options for Vercel + MongoDB Atlas**
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 50000, // 50 seconds
      socketTimeoutMS: 60000, // 60 seconds
      connectTimeoutMS: 50000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority',
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      // Remove deprecated options
    })

    isDbConnected = true
    console.log("✅ MongoDB connected successfully!")
    console.log(`📊 Database: ${mongoose.connection.name}`)
    console.log(`🔗 Host: ${mongoose.connection.host}`)
    console.log(`📈 Connection state: ${mongoose.connection.readyState}`)

    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to DB')
      isDbConnected = true
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message)
      isDbConnected = false
    })

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected')
      isDbConnected = false
    })

    return true

  } catch (error) {
    console.error("❌ MongoDB connection failed!")
    console.error("Error name:", error.name)
    console.error("Error message:", error.message)
    
    if (error.name === 'MongoNetworkError') {
      console.log("🔧 Fix: Check MongoDB Atlas → Network Access → Add IP 0.0.0.0/0")
    } else if (error.name === 'MongooseServerSelectionError') {
      console.log("🔧 Fix: Check connection string format")
    }
    
    isDbConnected = false
    return false
  }
}

// **IMPORTANT: Connect immediately in production (Vercel)**
if (process.env.NODE_ENV === 'production') {
  console.log("🚀 Production mode detected, connecting to DB...")
  connectDB().then(connected => {
    if (connected) {
      console.log("✅ Production DB connection initiated")
    } else {
      console.log("❌ Production DB connection failed")
    }
  })
}

// **Middleware to check DB connection before routes**
app.use(async (req, res, next) => {
  // Skip DB check for health endpoint
  if (req.path === '/api/health' || req.path === '/api/test-db') {
    return next()
  }

  if (mongoose.connection.readyState !== 1) {
    console.log(`🔄 DB not connected for ${req.path}, attempting connection...`)
    try {
      await connectDB()
    } catch (error) {
      console.error("Middleware connection failed:", error.message)
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

// Routes
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/enrollments", enrollmentRoutes)
app.use("/api/content", contentRoutes)
app.use("/api/notifications", notificationRoutes)

// **FIXED: Health check endpoint**
app.get("/api/health", async (req, res) => {
  const dbState = mongoose.connection.readyState
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }

  // Get basic connection info
  const connectionInfo = {
    status: states[dbState] || 'unknown',
    readyState: dbState,
    isConnected: dbState === 1,
    host: mongoose.connection.host || 'N/A',
    name: mongoose.connection.name || 'N/A',
    models: Object.keys(mongoose.models || {})
  }

  // Try to ping if connected
  if (dbState === 1) {
    try {
      const start = Date.now()
      // Check if db object exists before calling ping
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping()
        const end = Date.now()
        connectionInfo.ping = `success (${end - start}ms)`
      } else {
        connectionInfo.ping = "db object not available"
      }
    } catch (pingErr) {
      connectionInfo.ping = `failed: ${pingErr.message}`
    }
  } else {
    connectionInfo.ping = "not attempted (not connected)"
  }

  res.json({
    status: "API is running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: connectionInfo,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heap: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    }
  })
})

// **FIXED: Test DB endpoint - with proper error handling**
app.get("/api/test-db", async (req, res) => {
  try {
    console.log("🧪 Testing MongoDB connection...")

    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        error: "MISSING_ENV_VAR",
        message: "MONGODB_URI environment variable is not set",
        fix: "Add MONGODB_URI in Vercel Environment Variables"
      })
    }

    // Hide password for security
    const safeUri = process.env.MONGODB_URI.replace(
      /(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/,
      '$1***:***@'
    )

    const startTime = Date.now()
    
    // Ensure connection
    if (mongoose.connection.readyState !== 1) {
      console.log("Connecting to DB...")
      const connected = await connectDB()
      if (!connected) {
        throw new Error("Failed to connect to database")
      }
    }

    // **FIX: Check if db object exists before using it**
    if (!mongoose.connection.db) {
      throw new Error("Database object is not available")
    }

    // Test with a simple command
    const pingResult = await mongoose.connection.db.admin().ping()
    const collections = await mongoose.connection.db.listCollections().toArray()
    const endTime = Date.now()

    res.json({
      success: true,
      message: "✅ Database connection successful!",
      connectionTime: `${endTime - startTime}ms`,
      ping: pingResult,
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
      },
      collections: collections.map(c => c.name),
      connectionString: safeUri,
      connectionAttempts: connectionAttempts
    })

  } catch (error) {
    console.error("❌ Database test failed:", error.message)
    
    res.status(500).json({
      success: false,
      error: error.name || "DATABASE_ERROR",
      message: error.message,
      readyState: mongoose.connection.readyState,
      connectionAttempts: connectionAttempts,
      suggestions: [
        "1. Check MONGODB_URI in Vercel Environment Variables",
        "2. In MongoDB Atlas: Security → Network Access → Add IP Address 0.0.0.0/0",
        "3. In MongoDB Atlas: Database → Connect → Choose 'Drivers' → Copy connection string",
        "4. Verify database username/password in connection string"
      ]
    })
  }
})

// **Simple diagnostic endpoint**
app.get("/api/debug", (req, res) => {
  res.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI_SET: !!process.env.MONGODB_URI
    },
    mongoose: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.models || {})
    },
    app: {
      isDbConnected,
      connectionAttempts,
      uptime: process.uptime()
    }
  })
})

// Root endpoint
app.get("/", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1
  
  res.json({
    message: "EduTech Backend API",
    status: "running",
    database: isConnected ? "✅ CONNECTED" : "❌ DISCONNECTED",
    quickTest: isConnected ? "All good!" : "Check /api/test-db for details",
    endpoints: {
      root: "/",
      health: "/api/health",
      testDatabase: "/api/test-db",
      debug: "/api/debug",
      users: "/api/users",
      courses: "/api/courses",
      enrollments: "/api/enrollments",
      content: "/api/content",
      notifications: "/api/notifications"
    }
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error("🚨 Server error:", err.stack)
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    databaseStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  })
})

// Export for Vercel
export default app

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  
  connectDB().then(connected => {
    if (connected) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`)
        console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`)
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
        console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`)
      })
    } else {
      console.error("❌ Failed to connect to database, server not started")
      console.log("💡 Try setting MONGODB_URI in .env file")
    }
  })
}