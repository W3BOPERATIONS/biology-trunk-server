import mongoose from "mongoose"

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: String,
  description: String,
  price: {
    type: Number,
    default: 0,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignedTo: {
    type: String,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  duration: {
    type: String,
    default: "8 weeks",
  },
  courseLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Intermediate",
  },
  prerequisites: {
    type: String,
    default: "Basic Biology Knowledge",
  },
  curriculum: [
    {
      module: String,
      topics: [String],
    },
  ],
  whatYouWillLearn: [String],
  courseIncludes: {
    videos: { type: Boolean, default: true },
    liveLectures: { type: Boolean, default: true },
    pdfs: { type: Boolean, default: true },
    quizzes: { type: Boolean, default: true },
    assignments: { type: Boolean, default: true },
    certificates: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

CourseSchema.virtual("totalEnrolled").get(function () {
  return this.students ? this.students.length : 0
})

CourseSchema.set("toJSON", { virtuals: true })

const Course = mongoose.model("Course", CourseSchema)
export default Course
