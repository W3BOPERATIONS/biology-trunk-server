import nodemailer from "nodemailer"
import PDFDocument from "pdfkit"

let transporter = null

const getTransporter = () => {
  if (transporter) {
    return transporter
  }

  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_APP_PASSWORD

  console.log("[v0] Initializing email transporter with:", {
    user: emailUser ? emailUser.substring(0, 10) + "..." : "NOT SET",
    password: emailPassword ? "SET" : "NOT SET",
  })

  if (!emailUser || !emailPassword) {
    console.error("❌ EMAIL CONFIGURATION ERROR")
    console.error("Missing required email environment variables:")
    if (!emailUser) console.error("  - EMAIL_USER is missing")
    if (!emailPassword) console.error("  - EMAIL_APP_PASSWORD is missing")
    console.error("\nFIX: Add these to your .env file:")
    console.error("  EMAIL_USER=your_gmail@gmail.com")
    console.error("  EMAIL_APP_PASSWORD=your_app_password")
    console.error("\nGET APP PASSWORD:")
    console.error("  1. Go to: https://myaccount.google.com/apppasswords")
    console.error("  2. Select Gmail and your device")
    console.error("  3. Copy the generated 16-character password")
    throw new Error("Email configuration not complete")
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  })

  console.log("[v0] Email transporter created successfully")
  return transporter
}

// Generate PDF receipt
const generatePDFReceipt = (enrollmentData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument()
    const chunks = []

    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text("Enrollment Receipt", { align: "center" }).moveDown()

    // Receipt Details
    doc.fontSize(12).font("Helvetica").text(`Receipt Number: ${enrollmentData.receiptNumber}`).moveDown(0.5)
    doc.text(`Date: ${new Date().toLocaleDateString()}`).moveDown(0.5)
    doc.text(`Time: ${new Date().toLocaleTimeString()}`).moveDown(1)

    // Student Details
    doc.fontSize(14).font("Helvetica-Bold").text("Student Information").moveDown(0.5)
    doc.fontSize(11).font("Helvetica")
    doc.text(`Name: ${enrollmentData.studentName}`)
    doc.text(`Email: ${enrollmentData.studentEmail}`)
    doc.text(`Enrollment ID: ${enrollmentData.enrollmentId}`).moveDown(1)

    // Course Details
    doc.fontSize(14).font("Helvetica-Bold").text("Course Information").moveDown(0.5)
    doc.fontSize(11).font("Helvetica")
    doc.text(`Course: ${enrollmentData.courseName}`)
    doc.text(`Course ID: ${enrollmentData.courseId}`).moveDown(1)

    // Payment Details
    doc.fontSize(14).font("Helvetica-Bold").text("Payment Details").moveDown(0.5)
    doc.fontSize(11).font("Helvetica")
    doc.text(`Amount: ₹${enrollmentData.amount}`)
    doc.text(`Payment Method: Razorpay`)
    doc.text(`Transaction ID: ${enrollmentData.transactionId}`)
    doc.text(`Status: ${enrollmentData.paymentStatus}`).moveDown(1)

    // Footer
    doc.fontSize(10).font("Helvetica").text("Thank you for your purchase!", { align: "center" }).moveDown(0.5)
    doc.text("For more information, visit: biology.trunk.com", { align: "center" })

    doc.end()
  })
}

// Send enrollment confirmation email
export const sendEnrollmentEmail = async (enrollmentData) => {
  try {
    const mail = getTransporter()

    // Generate PDF receipt
    const pdfBuffer = await generatePDFReceipt(enrollmentData)

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: enrollmentData.studentEmail,
      subject: `🎉 Enrollment Successful - ${enrollmentData.courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✓ Congratulations!</h1>
          </div>
          
          <div style="padding: 20px; background-color: white; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi <strong>${enrollmentData.studentName}</strong>,</p>
            
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 15px;">
              You have successfully enrolled in <strong>${enrollmentData.courseName}</strong>! 🎓
            </p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #2e7d32;">Enrollment Details:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Enrollment ID:</strong> ${enrollmentData.enrollmentId}</li>
                <li><strong>Course:</strong> ${enrollmentData.courseName}</li>
                <li><strong>Amount Paid:</strong> ₹${enrollmentData.amount}</li>
                <li><strong>Payment Status:</strong> <span style="color: #4CAF50; font-weight: bold;">✓ Completed</span></li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
              Your payment receipt PDF is attached to this email. Please keep it for your records.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "https://biology-trunk-client.vercel.app"}/student-dashboard" 
                 style="display: inline-block; background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                Start Learning →
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; line-height: 1.6;">
              If you have any questions or need assistance, please don't hesitate to contact our support team at ${process.env.EMAIL_USER}
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">
              © 2025 Biology.Trunk. All rights reserved.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `enrollment_receipt_${enrollmentData.receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    }

    const result = await mail.sendMail(mailOptions)
    console.log("[v0] Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("[v0] Email sending failed:", error.message)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

// Send OTP email
export const sendOTPEmail = async (otpData) => {
  try {
    const mail = getTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: otpData.email,
      subject: "🔐 Password Reset OTP - Biology Trunk",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
          </div>
          
          <div style="padding: 20px; background-color: white; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi <strong>${otpData.name}</strong>,</p>
            
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 15px;">
              We received a request to reset your password. Use the OTP below to reset your password:
            </p>
            
            <div style="background-color: #e3f2fd; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; border: 2px dashed #2196F3;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your OTP Code:</p>
              <h2 style="margin: 0; color: #2196F3; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${otpData.otp}</h2>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: #856404;">
                ⚠️ <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin-top: 20px;">
              For security reasons, never share this OTP with anyone.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; line-height: 1.6;">
              If you need assistance, please contact our support team at ${process.env.EMAIL_USER}
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">
              © 2025 Biology.Trunk. All rights reserved.
            </p>
          </div>
        </div>
      `,
    }

    const result = await mail.sendMail(mailOptions)
    console.log("[v0] OTP email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("[v0] OTP email sending failed:", error.message)
    throw new Error(`Failed to send OTP email: ${error.message}`)
  }
}

export default getTransporter
