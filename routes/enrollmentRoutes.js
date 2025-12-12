import express from "express"
import Enrollment from "../models/Enrollment.js"
import Course from "../models/Course.js"
import Notification from "../models/Notification.js"
import User from "../models/User.js" // Added import for User model

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student")
      .populate("course")
      .populate({
        path: "course",
        populate: {
          path: "faculty",
          model: "User",
        },
      })
    res.json(enrollments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/student/:studentId", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.params.studentId }).populate({
      path: "course",
      populate: {
        path: "faculty",
        model: "User",
      },
    })
    res.json(enrollments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/course/:courseId", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId }).populate("student")
    res.json(enrollments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Enroll student in course
router.post("/", async (req, res) => {
  try {
    const { student, course } = req.body

    const existingEnrollment = await Enrollment.findOne({ student, course })
    if (existingEnrollment) {
      return res.status(400).json({ message: "Student already enrolled in this course" })
    }

    const enrollment = new Enrollment({
      student,
      course,
    })

    await enrollment.save()

    // Add student to course's students array
    await Course.findByIdAndUpdate(course, { $push: { students: student } })

    const courseData = await Course.findById(course).populate("faculty")
    const studentData = await User.findById(student)

    // Notify faculty
    if (courseData && courseData.faculty) {
      await Notification.create({
        recipient: courseData.faculty._id,
        type: "enrollment",
        title: "New Student Enrolled",
        message: `${studentData.name} has enrolled in ${courseData.title}`,
        course: course,
        faculty: courseData.faculty._id,
        enrollment: enrollment._id,
        createdAt: new Date(),
      })
    }

    const adminUsers = await User.find({ role: "admin" })
    for (const admin of adminUsers) {
      await Notification.create({
        recipient: admin._id,
        type: "enrollment",
        title: "New Student Enrollment",
        message: `${studentData.name} enrolled in ${courseData.title} (Faculty: ${courseData.faculty?.name || "Unassigned"})`,
        course: course,
        faculty: courseData.faculty?._id,
        enrollment: enrollment._id,
        createdAt: new Date(),
      })
    }

    res.status(201).json(enrollment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update enrollment
router.put("/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(enrollment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete enrollment
router.delete("/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
    await Enrollment.findByIdAndDelete(req.params.id)
    await Course.findByIdAndUpdate(enrollment.course, { $pull: { students: enrollment.student } })
    res.json({ message: "Enrollment deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
