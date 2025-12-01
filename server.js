import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import enrollmentRoutes from "./routes/enrollmentRoutes.js"
import contentRoutes from "./routes/contentRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// MongoDB Connection
let mongoConnected = false

if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/edutech", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // 15 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 15000,
      maxPoolSize: 10, // Connection pool size
    })
    .then(() => {
      console.log("MongoDB connected")
      mongoConnected = true
    })
    .catch((err) => {
      console.log("MongoDB connection error:", err)
      mongoConnected = false
    })
}

// MongoDB connection state monitoring
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB')
  mongoConnected = true
})

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err)
  mongoConnected = false
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected')
  mongoConnected = false
})

// Routes
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/enrollments", enrollmentRoutes)
app.use("/api/content", contentRoutes)
app.use("/api/notifications", notificationRoutes)

// Health check with DB status
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }
  
  res.json({ 
    status: "Backend is running", 
    env: process.env.NODE_ENV,
    database: {
      status: dbStates[dbState],
      readyState: dbState,
      connected: dbState === 1
    },
    timestamp: new Date().toISOString()
  })
})

// Detailed DB status check endpoint
app.get("/api/db-status", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
    
    // Try to ping the database to check if it's actually responsive
    let pingResult = null
    if (dbState === 1) {
      try {
        await mongoose.connection.db.admin().ping()
        pingResult = "success"
      } catch (pingError) {
        pingResult = `failed: ${pingError.message}`
      }
    }
    
    res.json({
      database: {
        status: dbStates[dbState],
        readyState: dbState,
        connected: dbState === 1,
        host: mongoose.connection.host || 'N/A',
        name: mongoose.connection.name || 'N/A',
        ping: pingResult,
        models: Object.keys(mongoose.models || {}),
        connectionString: process.env.MONGODB_URI ? 
          process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://***:***@') : 
          'Using local MongoDB'
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  } catch (error) {
    res.status(500).json({
      error: "Error checking DB status",
      message: error.message,
      database: {
        connected: false,
        error: error.message
      }
    })
  }
})

// Root endpoint with connection info
app.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState
  const isConnected = dbState === 1
  
  res.json({ 
    message: "EduTech Backend API",
    status: {
      api: "running",
      database: isConnected ? "connected" : "disconnected"
    },
    endpoints: {
      users: "/api/users",
      courses: "/api/courses",
      enrollments: "/api/enrollments",
      content: "/api/content",
      notifications: "/api/notifications",
      health: "/api/health",
      dbStatus: "/api/db-status"
    }
  })
})

// Vercel ke liye export
const port = process.env.PORT || 5000

// Agar Vercel environment nahi hai, tab hi listen karo
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

export default app