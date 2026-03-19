import express from "express"
import User from "../models/User.js"
import Course from "../models/Course.js"
import Notification from "../models/Notification.js"
import FacultyInvite from "../models/FacultyInvite.js"
import StudentOtp from "../models/StudentOtp.js"
import Enrollment from "../models/Enrollment.js"
import { sendOTPEmail, sendFacultyInviteEmail, sendStudentOtpEmail } from "../utils/emailService.js"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, otp } = req.body

    // For students, verify OTP
    if (role === "student") {
      if (!otp) {
        return res.status(400).json({ message: "OTP is required for student registration" })
      }
      const otpRecord = await StudentOtp.findOne({ email, otp })
      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP" })
      }
      // Delete OTP after verification
      await StudentOtp.deleteOne({ email })
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-={}[\]|:;"'<>,.?/~`]).{6,}$/
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

    const user = await User.findOne({ email }).select("+password")
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
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Cascading delete: If user is a faculty, delete all their courses
    if (user.role === "faculty") {
      await Course.deleteMany({ faculty: user._id })
    }

    // Cascading delete for students: delete their enrollments
    if (user.role === "student") {
      await Enrollment.deleteMany({ student: user._id })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted successfully" })
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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-={}[\]|:;"'<>,.?/~`]).{6,}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      })
    }

    const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpires")
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

// --- Admin Faculty Management Routes ---

// 1. Send OTP to Faculty Email (Admin only)
router.post("/faculty/send-otp", async (req, res) => {
  try {
    const { email, adminId } = req.body

    if (!email) {
      return res.status(400).json({ message: "Faculty email is required" })
    }

    // Check if email already exists in User model
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists" })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Save or update invite
    await FacultyInvite.findOneAndUpdate(
      { email },
      { otp, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
      { upsert: true, new: true },
    )

    // Send email
    await sendFacultyInviteEmail(email, otp)

    res.json({ message: `Invitation OTP sent to ${email}` })
  } catch (error) {
    console.error("[v0] Faculty invite error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// 2. Verify OTP for Faculty (Admin only)
router.post("/faculty/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }

    const invite = await FacultyInvite.findOne({ email })

    if (!invite) {
      return res.status(400).json({ message: "No invitation found for this email" })
    }

    if (invite.expiresAt < new Date()) {
      await FacultyInvite.deleteOne({ email })
      return res.status(400).json({ message: "OTP has expired" })
    }

    if (invite.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    res.json({ message: "OTP verified correctly", verified: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 3. Complete Faculty Creation (Admin only)
router.post("/faculty/register-by-admin", async (req, res) => {
  try {
    const { name, email, password, phone, otp } = req.body

    // Verify OTP one last time to be safe (or check if verified in session, but stateless is better)
    const invite = await FacultyInvite.findOne({ email, otp })
    if (!invite || invite.expiresAt < new Date()) {
      return res.status(400).json({ message: "Session expired or invalid. Please verify OTP again." })
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: "faculty",
      phone,
    })

    await user.save()

    // Clear invite
    await FacultyInvite.deleteOne({ email })

    res.status(201).json({ message: "Faculty account created successfully", user: { name, email, role: "faculty" } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Student OTP Route
router.post("/student/send-otp", async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Save/Update OTP
    await StudentOtp.findOneAndUpdate(
      { email },
      { otp, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
      { upsert: true, new: true },
    )

    // Send Email
    await sendStudentOtpEmail(email, otp)

    res.json({ message: "Verification OTP sent to your email" })
  } catch (error) {
    console.error("Student OTP Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
