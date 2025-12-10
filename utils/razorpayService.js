import Razorpay from "razorpay"
import crypto from "crypto"

let razorpayInstance = null

const getRazorpayInstance = () => {
  if (razorpayInstance) {
    return razorpayInstance
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  console.log("[v0] Initializing Razorpay with:", {
    keyId: keyId ? keyId.substring(0, 10) + "..." : "NOT SET",
    keySecret: keySecret ? "SET" : "NOT SET",
  })

  if (!keyId || !keySecret) {
    console.error("❌ RAZORPAY CONFIGURATION ERROR")
    console.error("Missing required Razorpay environment variables:")
    if (!keyId) console.error("  - RAZORPAY_KEY_ID is missing")
    if (!keySecret) console.error("  - RAZORPAY_KEY_SECRET is missing")
    console.error("\nFIX: Add these to your .env file:")
    console.error("  1. RAZORPAY_KEY_ID=your_key_id")
    console.error("  2. RAZORPAY_KEY_SECRET=your_key_secret")
    console.error("  Get them from: https://dashboard.razorpay.com/settings/api-keys")
    throw new Error("Razorpay credentials not configured")
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })

  console.log("[v0] Razorpay instance created successfully")
  return razorpayInstance
}

// Create Razorpay order
export const createRazorpayOrder = async (amount, currency = "INR") => {
  try {
    const razorpay = getRazorpayInstance()

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    })
    console.log("[v0] Razorpay order created:", order.id)
    return order
  } catch (error) {
    console.error("[v0] Error creating Razorpay order:", error.message)
    throw new Error(`Failed to create order: ${error.message}`)
  }
}

// Verify Razorpay payment signature
export const verifyRazorpayPayment = (paymentData) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      throw new Error("RAZORPAY_KEY_SECRET not configured")
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex")

    const isSignatureValid = expectedSignature === razorpay_signature

    console.log("[v0] Payment verification result:", {
      isValid: isSignatureValid,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    })

    return isSignatureValid
  } catch (error) {
    console.error("[v0] Error verifying payment:", error)
    throw new Error(`Failed to verify payment: ${error.message}`)
  }
}

export default getRazorpayInstance
