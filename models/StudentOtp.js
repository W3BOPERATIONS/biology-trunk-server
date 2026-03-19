import mongoose from "mongoose"

const StudentOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Auto-delete when expired
StudentOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const StudentOtp = mongoose.model("StudentOtp", StudentOtpSchema)
export default StudentOtp
