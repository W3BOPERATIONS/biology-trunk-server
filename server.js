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

// **IMPORTANT: Vercel-specific MongoDB connection**
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("Already connected to MongoDB")
    return
  }

  try {
    // Vercel पर MongoDB Atlas connection के लिए optimized settings
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000,
      maxPoolSize: 5, // Vercel के लिए smaller pool
      minPoolSize: 1,
      ssl: true,
      tlsAllowInvalidCertificates: false,
      retryWrites: true,
      w: 'majority'
    })
    
    console.log("✅ MongoDB connected successfully")
    console.log(`Database: ${mongoose.connection.name}`)
    console.log(`Host: ${mongoose.connection.host}`)
    
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    
    // Log detailed error for debugging
    if (error.name === 'MongoNetworkError') {
      console.error("Network error - Check MongoDB Atlas IP whitelist")
    } else if (error.name === 'MongoServerSelectionError') {
      console.error("Server selection error - Check connection string")
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error("Mongoose server selection error")
    }
  }
}

// Vercel functions में connection establish करें
if (process.env.NODE_ENV === 'production') {
  connectDB().catch(err => console.error("Initial connection error:", err))
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log("DB not connected, attempting to connect...")
    try {
      await connectDB()
    } catch (error) {
      console.error("Failed to connect DB in middleware:", error.message)
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

// Enhanced Health check
app.get("/api/health", async (req, res) => {
  const dbState = mongoose.connection.readyState
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  
  // Try to ping database if connected
  let dbPing = "not attempted"
  if (dbState === 1) {
    try {
      const start = Date.now()
      await mongoose.connection.db.admin().ping()
      const end = Date.now()
      dbPing = `success (${end - start}ms)`
    } catch (pingErr) {
      dbPing = `failed: ${pingErr.message}`
    }
  }
  
  res.json({
    status: "API is running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: states[dbState],
      readyState: dbState,
      ping: dbPing,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A'
    },
    memory: process.memoryUsage()
  })
})

// Test MongoDB connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    console.log("Testing MongoDB connection...")
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        error: "MONGODB_URI environment variable is not set",
        message: "Please set MONGODB_URI in Vercel environment variables"
      })
    }
    
    // Hide password in logs
    const safeUri = process.env.MONGODB_URI.replace(
      /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/,
      'mongodb$1://***:***@'
    )
    
    console.log("Using connection string:", safeUri)
    
    // Test connection
    const startTime = Date.now()
    
    if (mongoose.connection.readyState !== 1) {
      await connectDB()
    }
    
    // Run a simple query to test
    const collections = await mongoose.connection.db.listCollections().toArray()
    const endTime = Date.now()
    
    res.json({
      success: true,
      message: "✅ Database connection successful",
      connectionTime: `${endTime - startTime}ms`,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: collections.map(c => c.name),
      connectionState: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
      environment: process.env.NODE_ENV
    })
    
  } catch (error) {
    console.error("Database test failed:", error)
    res.status(500).json({
      success: false,
      error: error.name,
      message: error.message,
      suggestion: "Check: 1) MONGODB_URI in Vercel env vars, 2) MongoDB Atlas IP whitelist (0.0.0.0/0), 3) Network connectivity"
    })
  }
})

// Simple root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "EduTech Backend API",
    status: "running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    endpoints: {
      health: "/api/health",
      testDb: "/api/test-db",
      users: "/api/users",
      courses: "/api/courses"
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
    dbConnected: mongoose.connection.readyState === 1
  })
})

// Server setup
const PORT = process.env.PORT || 5000

// Vercel के लिए export
export default app

// Local development के लिए
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`)
    })
  }).catch(err => {
    console.error("Failed to start server:", err)
  })
}