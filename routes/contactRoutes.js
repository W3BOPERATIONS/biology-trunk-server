import express from "express"
import nodemailer from "nodemailer"

const router = express.Router()

// Send contact form email
router.post("/send-email", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All required fields must be filled" })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Message:</h3>
            <p style="white-space: pre-wrap; color: #555;">${message}</p>
          </div>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This email was sent from the Biology.Trunk contact form.
          </p>
        </div>
      `,
    }

    // Email to user (confirmation)
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "We received your message - Biology.Trunk",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Thank You!</h1>
          </div>
          
          <div style="padding: 20px; background-color: white; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333;">Hi ${name},</p>
            
            <p style="font-size: 14px; color: #555; line-height: 1.6;">
              Thank you for reaching out to Biology.Trunk. We have received your message and will get back to you as soon as possible.
            </p>
            
            <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #0056b3;">Your Message Details:</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
                <li><strong>Subject:</strong> ${subject}</li>
                <li><strong>Received:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
              Our support team typically responds within 24-48 hours during business days.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; line-height: 1.6;">
              If you have any urgent matters, please feel free to reach out directly to our team.
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">
              © 2025 Biology.Trunk. All rights reserved.
            </p>
          </div>
        </div>
      `,
    }

    // Send both emails
    await Promise.all([transporter.sendMail(adminMailOptions), transporter.sendMail(userMailOptions)])

    console.log("[v0] Contact email sent successfully")
    res.json({ success: true, message: "Your message has been sent successfully" })
  } catch (error) {
    console.error("[v0] Contact email error:", error.message)
    res.status(500).json({ message: "Failed to send message. Please try again later." })
  }
})

export default router
