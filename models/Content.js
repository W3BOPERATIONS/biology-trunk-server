import mongoose from "mongoose"

const ContentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["pdf", "video", "live_class"],
    required: true,
  },
  title: String,
  description: String,
  pdfUrl: String,
  pdfFile: String, // File path for uploaded PDF
  videoUrl: String,
  videoFile: String, // File path for uploaded video
  liveClassUrl: String,
  liveClassDate: Date,
  liveClassTime: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Content = mongoose.model("Content", ContentSchema)
export default Content
