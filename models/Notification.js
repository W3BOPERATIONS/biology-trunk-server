import mongoose from "mongoose"

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["content_upload", "live_class", "enrollment", "announcement"],
    required: true,
  },
  title: String,
  message: String,
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enrollment",
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Notification = mongoose.model("Notification", NotificationSchema)
export default Notification
