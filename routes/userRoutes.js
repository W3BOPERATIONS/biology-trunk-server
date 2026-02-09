import express from "express"
import User from "../models/User.js"
import Notification from "../models/Notification.js"
import { sendOTPEmail } from "../utils/emailService.js"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" })
    }

    const user = new User({
      name,
      email,
      password,
      role,
      phone,
    })

    await user.save()

    const adminUsers = await User.find({ role: "admin" })
    for (const admin of adminUsers) {
      await Notification.create({
        recipient: admin._id,
        type: "announcement",
        title: `New ${role} Registered`,
        message: `${name} (${email}) has registered as a ${role}`,
        createdAt: new Date(),
      })
    }

    const userResponse = user.toObject()
    delete userResponse.password
    res.status(201).json({ message: "User registered successfully", user: userResponse })
  } catch (error) {
    console.error("[v0] Registration error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      console.error("[v0] User not found:", email)
      return res.status(401).json({ message: "Invalid email or password" })
    }

    if (await user.matchPassword(password)) {
      const userResponse = user.toObject()
      delete userResponse.password
      res.json({ user: userResponse })
    } else {
      console.error("[v0] Invalid password for:", email)
      return res.status(401).json({ message: "Invalid email or password" })
    }
  } catch (error) {
    console.error("[v0] Login error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    const userResponse = user.toObject()
    delete userResponse.password
    res.json(userResponse)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/search/:searchTerm", async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm
    const users = await User.find({
      $or: [{ name: { $regex: searchTerm, $options: "i" } }, { email: { $regex: searchTerm, $options: "i" } }],
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get faculty
router.get("/role/faculty", async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" })
    res.json(faculty)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get students
router.get("/role/student", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
    res.json(students)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update user
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    const userResponse = user.toObject()
    delete userResponse.password
    res.json(userResponse)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Forgot password - request OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "This email is not registered" })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Set OTP and expiry (10 minutes)
    user.resetOtp = otp
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    // Send OTP via email
    await sendOTPEmail({
      email: user.email,
      name: user.name,
      otp: otp,
    })

    res.json({
      message: "OTP sent successfully to your email",
      email: user.email,
    })
  } catch (error) {
    console.error("[v0] Forgot password error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Verify OTP and reset password
router.post("/verify-otp-reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" })
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if OTP exists
    if (!user.resetOtp) {
      return res.status(400).json({ message: "No OTP request found. Please request a new OTP" })
    }

    // Check if OTP is expired
    if (user.resetOtpExpires < new Date()) {
      user.resetOtp = undefined
      user.resetOtpExpires = undefined
      await user.save()
      return res.status(400).json({ message: "OTP has expired. Please request a new one" })
    }

    // Verify OTP
    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    // Update password and clear OTP
    // The pre-save hook in User model will handle hashing
    user.password = newPassword
    user.resetOtp = undefined
    user.resetOtpExpires = undefined
    await user.save()

    res.json({ message: "Password reset successfully. You can now login with your new password" })
  } catch (error) {
    console.error("[v0] Verify OTP error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
