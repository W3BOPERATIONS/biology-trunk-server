import express from "express"
import Course from "../models/Course.js"

const router = express.Router()

// Get all courses with pagination support
router.get("/", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 100
    const skip = (page - 1) * limit

    const courses = await Course.find().populate("faculty").populate("students").skip(skip).limit(limit)

    const total = await Course.countDocuments()

    res.json({
      courses,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Course.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get courses by category
router.get("/category/:category", async (req, res) => {
  try {
    const courses = await Course.find({ category: req.params.category }).populate("faculty").populate("students")
    res.json(courses)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("faculty").populate("students")
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    res.json(course)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get courses by faculty
router.get("/faculty/:facultyId", async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.params.facultyId }).populate("students")
    res.json(courses)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create course
router.post("/", async (req, res) => {
  try {
    const {
      title,
      category,
      subcategory,
      description,
      price,
      faculty,
      duration,
      courseLevel,
      prerequisites,
      curriculum,
      whatYouWillLearn,
      courseIncludes,
    } = req.body
    const course = new Course({
      title,
      category,
      subcategory,
      description,
      price,
      faculty,
      duration,
      courseLevel,
      prerequisites,
      curriculum,
      whatYouWillLearn,
      courseIncludes,
    })
    await course.save()
    res.status(201).json(course)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update course
router.put("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if the requesting user is the faculty assigned to this course
    const facultyId = req.body.facultyId || req.user?.id
    if (course.faculty.toString() !== facultyId) {
      return res.status(403).json({ message: "You can only update your own courses" })
    }

    // Allow faculty to update course description and details
    const allowedUpdates = [
      "title",
      "description",
      "price",
      "duration",
      "courseLevel",
      "prerequisites",
      "curriculum",
      "whatYouWillLearn",
      "courseIncludes",
    ]

    const updates = {}
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("faculty")
      .populate("students")

    res.json(updatedCourse)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete course
router.delete("/:id", async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id)
    res.json({ message: "Course deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
