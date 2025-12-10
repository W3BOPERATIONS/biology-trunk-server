import express from "express"
import Enrollment from "../models/Enrollment.js"
import Course from "../models/Course.js"
import User from "../models/User.js"
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayMode, getRazorpayFrontendKey } from "../utils/razorpayService.js"
import { sendEnrollmentEmail } from "../utils/emailService.js"

const router = express.Router()

// Debug endpoint to check Razorpay configuration
router.get("/config", (req, res) => {
  const mode = getRazorpayMode()
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  
  res.json({
    success: true,
    razorpay: {
      mode: mode,
      keyIdPreview: keyId ? keyId.substring(0, 10) + "..." : "NOT SET",
      keyIdLength: keyId ? keyId.length : 0,
      keySecretSet: !!keySecret,
      frontendKey: getRazorpayFrontendKey(),
      environment: process.env.NODE_ENV || "development",
      shouldUseLive: process.env.NODE_ENV === "production"
    },
    suggestion: mode === "TEST" && process.env.NODE_ENV === "production" 
      ? "⚠️ WARNING: Using TEST keys in PRODUCTION! Update to LIVE keys."
      : "✅ Configuration looks good"
  })
})

// Create payment order
router.post("/create-order", async (req, res) => {
  try {
    const { courseId, studentId } = req.body

    console.log("[PAYMENT] Creating order request:", { courseId, studentId })

    // Validate inputs
    if (!courseId || !studentId) {
      return res.status(400).json({ 
        error: "Course ID and Student ID are required",
        suggestion: "Make sure you're passing both courseId and studentId in the request body"
      })
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId })
    if (existingEnrollment && existingEnrollment.payment?.status === "completed") {
      return res.status(400).json({ 
        message: "Student already enrolled in this course",
        enrollmentId: existingEnrollment._id
      })
    }

    // Get course details
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // Get student details
    const student = await User.findById(studentId)
    if (!student) {
      return res.status(404).json({ error: "Student not found" })
    }

    console.log("[PAYMENT] Found course and student:", {
      courseTitle: course.title,
      coursePrice: course.price,
      studentName: student.name,
      studentEmail: student.email
    })

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
      studentName: student.name,
      razorpayMode: getRazorpayMode(),
      frontendKey: getRazorpayFrontendKey(),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("[PAYMENT] Error creating order:", error.message)
    
    // Check for specific Razorpay errors
    let statusCode = 500
    let errorDetails = error.code || "RAZORPAY_ERROR"
    let suggestion = ""
    
    if (error.message.includes("not configured") || error.message.includes("credentials")) {
      statusCode = 500
      suggestion = "Please check if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set correctly in environment variables"
    } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
      statusCode = 401
      suggestion = "Invalid Razorpay API keys. Please verify your keys are correct and active."
    } else if (error.message.includes("400") || error.message.includes("bad request")) {
      statusCode = 400
      suggestion = "Invalid payment request. Please check the amount and ensure it's in valid format."
    }
    
    res.status(statusCode).json({
      success: false,
      error: error.message,
      details: errorDetails,
      suggestion: suggestion || "Check your Razorpay account and ensure live keys are activated if using live mode",
      razorpayMode: getRazorpayMode(),
      timestamp: new Date().toISOString()
    })
  }
})

// Verify payment and complete enrollment
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, studentId } = req.body

    console.log("[PAYMENT] Payment verification initiated:", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      courseId: courseId,
      studentId: studentId,
      signatureLength: razorpay_signature?.length || 0
    })

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: "Missing payment verification data",
        suggestion: "Make sure all razorpay_order_id, razorpay_payment_id, and razorpay_signature are provided"
      })
    }

    // Verify signature
    const isSignatureValid = verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!isSignatureValid) {
      console.error("[PAYMENT] Signature verification failed - possible key mismatch or tampering")
      console.error("[PAYMENT] Current Razorpay mode:", getRazorpayMode())
      
      return res.status(400).json({
        error: "Payment verification failed",
        details: "Signature mismatch - This could mean the live/test keys don't match between frontend and backend",
        suggestion: `Ensure both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are from the same environment (both live or both test). Current mode: ${getRazorpayMode()}`,
        razorpayMode: getRazorpayMode()
      })
    }

    console.log("[PAYMENT] Signature verified successfully")

    // Get student and course details
    const student = await User.findById(studentId)
    const course = await Course.findById(courseId)

    if (!student || !course) {
      return res.status(404).json({ 
        error: "Student or Course not found",
        studentExists: !!student,
        courseExists: !!course
      })
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      "payment.status": "completed",
    })

    if (existingEnrollment) {
      return res.status(400).json({ 
        message: "Student already enrolled in this course",
        enrollmentId: existingEnrollment._id,
        enrolledAt: existingEnrollment.payment?.paidAt
      })
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
        verifiedAt: new Date()
      }
      await enrollment.save()
      console.log("[PAYMENT] Updated existing enrollment:", enrollment._id)
    } else {
      // Create new enrollment
      enrollment = new Enrollment({
        student: studentId,
        course: courseId,
        enrollmentDate: new Date(),
        payment: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: course.price,
          currency: "INR",
          status: "completed",
          paidAt: new Date(),
          receiptNumber,
          verifiedAt: new Date()
        },
      })
      await enrollment.save()
      console.log("[PAYMENT] Created new enrollment:", enrollment._id)
    }

    // Add student to course's students array
    if (!course.students.includes(studentId)) {
      await Course.findByIdAndUpdate(courseId, { $push: { students: studentId } })
      console.log("[PAYMENT] Added student to course:", studentId)
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
      console.log("[PAYMENT] Enrollment email sent to:", student.email)
    } catch (emailError) {
      console.error("[PAYMENT] Email sending error (non-blocking):", emailError.message)
    }

    res.json({
      success: true,
      message: "Payment verified and enrollment completed",
      enrollment: {
        id: enrollment._id,
        studentId: studentId,
        courseId: courseId,
        receiptNumber: receiptNumber,
        enrolledAt: enrollment.enrollmentDate || new Date()
      },
      receiptNumber: receiptNumber,
      razorpayMode: getRazorpayMode(),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("[PAYMENT] Error verifying payment:", error)
    console.error("[PAYMENT] Error stack:", error.stack)
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: "Payment verification encountered an error",
      debugging: {
        errorType: error.constructor.name,
        timestamp: new Date().toISOString(),
        razorpayMode: getRazorpayMode(),
        hasOrderId: !!razorpay_order_id,
        hasPaymentId: !!razorpay_payment_id,
        hasSignature: !!razorpay_signature
      },
      suggestion: "Please check server logs for more details and contact support if issue persists"
    })
  }
})

// Test payment endpoint
router.post("/test-payment", async (req, res) => {
  try {
    const mode = getRazorpayMode()
    
    // Try to create a test order
    const testOrder = await createRazorpayOrder(1, "INR") // 1 rupee test
    
    res.json({
      success: true,
      message: `Payment system is working in ${mode} mode`,
      testOrder: {
        id: testOrder.id,
        amount: testOrder.amount,
        currency: testOrder.currency,
        status: testOrder.status
      },
      configuration: {
        mode: mode,
        environment: process.env.NODE_ENV,
        keyIdPreview: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 15) + "..." : "NOT SET",
        keySecretSet: !!process.env.RAZORPAY_KEY_SECRET
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      mode: getRazorpayMode(),
      suggestion: "Check your Razorpay API keys in environment variables"
    })
  }
})

export default router