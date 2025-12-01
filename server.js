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

// MongoDB Connection - Production mein sirf connect karo
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/edutech", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err))
}

// Routes
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/enrollments", enrollmentRoutes)
app.use("/api/content", contentRoutes)
app.use("/api/notifications", notificationRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running", env: process.env.NODE_ENV })
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "EduTech Backend API",
    endpoints: {
      users: "/api/users",
      courses: "/api/courses",
      enrollments: "/api/enrollments",
      content: "/api/content",
      notifications: "/api/notifications",
      health: "/api/health"
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