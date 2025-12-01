import express from "express"
import Content from "../models/Content.js"
import Notification from "../models/Notification.js"
import Course from "../models/Course.js"

const router = express.Router()

// Get all content
router.get("/", async (req, res) => {
  try {
    const content = await Content.find().populate("course")
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get content by course
router.get("/course/:courseId", async (req, res) => {
  try {
    const content = await Content.find({ course: req.params.courseId })
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Upload content
router.post("/", async (req, res) => {
  try {
    const {
      course,
      faculty,
      type,
      title,
      description,
      pdfUrl,
      videoUrl,
      liveClassUrl,
      liveClassDate,
      liveClassTime,
      pdfFile,
      videoFile,
    } = req.body

    const content = new Content({
      course,
      faculty,
      type,
      title,
      description,
      pdfUrl,
      pdfFile,
      videoUrl,
      videoFile,
      liveClassUrl,
      liveClassDate,
      liveClassTime,
    })

    await content.save()

    const courseData = await Course.findById(course)
    if (courseData && courseData.students.length > 0) {
      const notificationType = type === "live_class" ? "live_class" : "content_upload"

      for (const studentId of courseData.students) {
        await Notification.create({
          recipient: studentId,
          type: notificationType,
          title: `New ${type} uploaded: ${title}`,
          message: description || `Check out the new ${type} in ${courseData.title}`,
          course: course,
          faculty: faculty,
        })
      }
    }

    res.status(201).json(content)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update content
router.put("/:id", async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete content
router.delete("/:id", async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id)
    res.json({ message: "Content deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
