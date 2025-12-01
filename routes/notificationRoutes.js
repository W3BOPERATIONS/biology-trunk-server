import express from "express"
import Notification from "../models/Notification.js"

const router = express.Router()

// Get all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().populate("recipient").populate("course")
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get notifications for user
router.get("/user/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.userId }).populate("course")
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create notification
router.post("/", async (req, res) => {
  try {
    const { recipient, type, title, message, course } = req.body

    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      course,
    })

    await notification.save()
    res.status(201).json(notification)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Mark as read
router.put("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
    res.json(notification)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete notification
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)
    res.json({ message: "Notification deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
