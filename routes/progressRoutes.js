import express from "express"
import Enrollment from "../models/Enrollment.js"
import Content from "../models/Content.js"

const router = express.Router()

router.get("/course/:courseId/student/:studentId", async (req, res) => {
  try {
    const { courseId, studentId } = req.params

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: studentId,
    }).populate("completedContent")

    if (!enrollment) {
      return res.json({
        completedContent: [],
        percentage: 0,
      })
    }

    // Get total content for the course
    const totalContent = await Content.countDocuments({ course: courseId })
    const completedCount = enrollment.completedContent?.length || 0
    const percentage = totalContent > 0 ? Math.round((completedCount / totalContent) * 100) : 0

    res.json({
      completedContent: enrollment.completedContent?.map((c) => c._id) || [],
      percentage,
      enrollmentId: enrollment._id,
    })
  } catch (error) {
    console.error("Error fetching progress:", error)
    res.status(500).json({ error: error.message })
  }
})

router.post("/mark-completed", async (req, res) => {
  try {
    const { studentId, courseId, contentId } = req.body

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: studentId,
    })

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" })
    }

    // Toggle completion status
    const index = enrollment.completedContent.indexOf(contentId)
    if (index > -1) {
      enrollment.completedContent.splice(index, 1)
    } else {
      enrollment.completedContent.push(contentId)
    }

    // Update progress percentage
    const totalContent = await Content.countDocuments({ course: courseId })
    const completedCount = enrollment.completedContent.length
    enrollment.progress = totalContent > 0 ? Math.round((completedCount / totalContent) * 100) : 0

    await enrollment.save()

    res.json({
      success: true,
      completedContent: enrollment.completedContent,
      percentage: enrollment.progress,
    })
  } catch (error) {
    console.error("Error marking as completed:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
