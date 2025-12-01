import express from "express"
import User from "../models/User.js"
import Notification from "../models/Notification.js"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body

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

    if (user.password !== password) {
      console.error("[v0] Invalid password for:", email)
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const userResponse = user.toObject()
    delete userResponse.password
    res.json({ user: userResponse })
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

export default router
