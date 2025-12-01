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
