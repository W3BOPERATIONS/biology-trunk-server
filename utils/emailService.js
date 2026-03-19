import nodemailer from "nodemailer"
import PDFDocument from "pdfkit"

let transporter = null

const getTransporter = () => {
  if (transporter) {
    return transporter
  }

  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_APP_PASSWORD

  if (!emailUser || !emailPassword) {
    console.error("❌ EMAIL CONFIGURATION ERROR")
    throw new Error("Email configuration not complete")
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  })

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

    doc.fontSize(20).font("Helvetica-Bold").text("Enrollment Receipt", { align: "center" }).moveDown()
    doc.fontSize(12).font("Helvetica").text(`Receipt Number: ${enrollmentData.receiptNumber}`).moveDown(0.5)
    doc.text(`Date: ${new Date().toLocaleDateString()}`).moveDown(0.5)
    doc.text(`Time: ${new Date().toLocaleTimeString()}`).moveDown(1)

    doc.fontSize(14).font("Helvetica-Bold").text("Student Information").moveDown(0.5)
    doc.fontSize(11).font("Helvetica")
    doc.text(`Name: ${enrollmentData.studentName}`)
    doc.text(`Email: ${enrollmentData.studentEmail}`)
    doc.text(`Enrollment ID: ${enrollmentData.enrollmentId}`).moveDown(1)

    doc.fontSize(14).font("Helvetica-Bold").text("Course Information").moveDown(0.5)
    doc.fontSize(11).font("Helvetica")
    doc.text(`Course: ${enrollmentData.courseName}`)
    doc.text(`Course ID: ${enrollmentData.courseId}`).moveDown(1)

    doc.fontSize(14).font("Helvetica-Bold").text("Payment Details").moveDown(0.5)
    doc.fontSize(11).font("Helvetica")
    doc.text(`Amount: ₹${enrollmentData.amount}`)
    doc.text(`Payment Method: Razorpay`)
    doc.text(`Transaction ID: ${enrollmentData.transactionId}`)
    doc.text(`Status: ${enrollmentData.paymentStatus}`).moveDown(1)

    doc.fontSize(10).font("Helvetica").text("Thank you for your purchase!", { align: "center" }).moveDown(0.5)
    doc.text("For more information, visit: biology.trunk.com", { align: "center" })

    doc.end()
  })
}

export const sendEnrollmentEmail = async (enrollmentData) => {
  try {
    const mail = getTransporter()
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
            <p>Hi <strong>${enrollmentData.studentName}</strong>,</p>
            <p>You have successfully enrolled in <strong>${enrollmentData.courseName}</strong>!</p>
            <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 4px;">
              <h3>Enrollment Details:</h3>
              <ul>
                <li><strong>Enrollment ID:</strong> ${enrollmentData.enrollmentId}</li>
                <li><strong>Course:</strong> ${enrollmentData.courseName}</li>
                <li><strong>Amount Paid:</strong> ₹${enrollmentData.amount}</li>
              </ul>
            </div>
            <p>Your payment receipt PDF is attached.</p>
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

    await mail.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error("Email failed:", error.message)
    throw error
  }
}

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
            <h1 style="margin: 0; font-size: 24px;">Password Reset</h1>
          </div>
          <div style="padding: 20px; background-color: white; border-radius: 0 0 8px 8px; text-align: center;">
            <p>Hi <strong>${otpData.name}</strong>,</p>
            <p>Use the OTP below to reset your password:</p>
            <h2 style="color: #2196F3; font-size: 32px; letter-spacing: 5px;">${otpData.otp}</h2>
            <p>Valid for 10 minutes.</p>
          </div>
        </div>
      `,
    }
    await mail.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    throw error
  }
}

export const sendFacultyInviteEmail = async (email, otp) => {
  try {
    const mail = getTransporter()
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔑 Faculty Invitation OTP - Biology Trunk",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Faculty Invitation</h1>
          </div>
          <div style="padding: 20px; background-color: white; border-radius: 0 0 8px 8px; text-align: center;">
            <p>You have been invited to join <strong>Biology.Trunk</strong> as Faculty.</p>
            <p>Invitation OTP Code:</p>
            <h2 style="color: #2e7d32; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
            <p>Valid for 15 minutes.</p>
          </div>
        </div>
      `,
    }
    await mail.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    throw error
  }
}

export const sendStudentOtpEmail = async (email, otp) => {
  try {
    const mail = getTransporter()
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verification Code - Biology.Trunk",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Email Verification</h1>
          </div>
          <div style="padding: 20px; color: #3c4043; line-height: 1.6; text-align: center;">
            <p>Hello,</p>
            <p>Please use the following OTP to verify your email and complete your registration.</p>
            <h2 style="color: #4f46e5; letter-spacing: 5px; font-size: 32px;">${otp}</h2>
            <p>Valid for 15 minutes.</p>
          </div>
        </div>
      `,
    }
    await mail.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    throw error
  }
}

export default getTransporter
