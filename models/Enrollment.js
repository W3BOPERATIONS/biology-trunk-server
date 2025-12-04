import mongoose from "mongoose"

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "completed", "dropped"],
    default: "active",
  },
  progress: {
    type: Number,
    default: 0,
  },
  completedContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
    },
  ],
})

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema)
export default Enrollment
