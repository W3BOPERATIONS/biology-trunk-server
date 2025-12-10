import express from "express"
import Enrollment from "../models/Enrollment.js"
import Course from "../models/Course.js"
import User from "../models/User.js"
import { createRazorpayOrder, verifyRazorpayPayment } from "../utils/razorpayService.js"
import { sendEnrollmentEmail } from "../utils/emailService.js"

const router = express.Router()

// Create payment order
router.post("/create-order", async (req, res) => {
  try {
    const { courseId, studentId } = req.body

    // Validate inputs
    if (!courseId || !studentId) {
      return res.status(400).json({ error: "Course ID and Student ID are required" })
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId })
    if (existingEnrollment && existingEnrollment.payment?.status === "completed") {
      return res.status(400).json({ message: "Student already enrolled in this course" })
    }

    // Get course details
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // Create Razorpay order
    const amount = course.price || 0
    const razorpayOrder = await createRazorpayOrder(amount, "INR")

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      courseId: courseId,
      courseName: course.title,
      coursePrice: course.price,
    })
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    res.status(500).json({
      error: error.message,
      details: error.code || "RAZORPAY_ERROR",
      suggestion: error.message.includes("not configured")
        ? "Please check if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set correctly in environment variables"
        : "Check your Razorpay account and ensure live keys are activated if using live mode",
    })
  }
})

// Verify payment and complete enrollment
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, studentId } = req.body

    console.log("[v0] Payment verification initiated:", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      courseId: courseId,
      studentId: studentId,
    })

    // Verify signature
    const isSignatureValid = verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!isSignatureValid) {
      console.error("[v0] Signature verification failed - possible key mismatch or tampering")
      return res.status(400).json({
        error: "Payment verification failed",
        details: "Signature mismatch - This could mean the live/test keys don't match between frontend and backend",
        suggestion:
          "Ensure both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are from the same environment (both live or both test)",
      })
    }

    // Get student and course details
    const student = await User.findById(studentId)
    const course = await Course.findById(courseId)

    if (!student || !course) {
      return res.status(404).json({ error: "Student or Course not found" })
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      "payment.status": "completed",
    })

    if (existingEnrollment) {
      return res.status(400).json({ message: "Student already enrolled in this course" })
    }

    // Create or update enrollment with payment info
    let enrollment = await Enrollment.findOne({ student: studentId, course: courseId })

    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    if (enrollment) {
      // Update existing enrollment
      enrollment.payment = {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: course.price,
        currency: "INR",
        status: "completed",
        paidAt: new Date(),
        receiptNumber,
      }
      await enrollment.save()
    } else {
      // Create new enrollment
      enrollment = new Enrollment({
        student: studentId,
        course: courseId,
        payment: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: course.price,
          currency: "INR",
          status: "completed",
          paidAt: new Date(),
          receiptNumber,
        },
      })
      await enrollment.save()
    }

    // Add student to course's students array
    if (!course.students.includes(studentId)) {
      await Course.findByIdAndUpdate(courseId, { $push: { students: studentId } })
    }

    // Send confirmation email with receipt
    try {
      await sendEnrollmentEmail({
        studentName: student.name,
        studentEmail: student.email,
        courseName: course.title,
        courseId: courseId,
        enrollmentId: enrollment._id.toString(),
        amount: course.price,
        transactionId: razorpay_payment_id,
        paymentStatus: "Completed",
        receiptNumber: receiptNumber,
      })
    } catch (emailError) {
      console.error("[v0] Email sending error (non-blocking):", emailError)
    }

    res.json({
      success: true,
      message: "Payment verified and enrollment completed",
      enrollment: enrollment,
      receiptNumber: receiptNumber,
    })
  } catch (error) {
    console.error("[v0] Error verifying payment:", error)
    res.status(500).json({
      error: error.message,
      details: "Payment verification encountered an error",
      debugging: {
        errorType: error.constructor.name,
        timestamp: new Date().toISOString(),
      },
    })
  }
})

export default router
