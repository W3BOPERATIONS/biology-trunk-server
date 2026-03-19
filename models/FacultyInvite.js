import mongoose from "mongoose"

const FacultyInviteSchema = new mongoose.Schema({
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
FacultyInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const FacultyInvite = mongoose.model("FacultyInvite", FacultyInviteSchema)
export default FacultyInvite
