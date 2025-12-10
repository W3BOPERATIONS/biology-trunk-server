import Razorpay from "razorpay"
import crypto from "crypto"

let razorpayInstance = null

const getRazorpayInstance = () => {
  if (razorpayInstance) {
    return razorpayInstance
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  // Detect mode
  let mode = "UNKNOWN"
  if (keyId && keyId.includes("_live_")) {
    mode = "🟢 LIVE MODE"
  } else if (keyId && keyId.includes("_test_")) {
    mode = "🟡 TEST MODE"
  }

  console.log("[RAZORPAY] Initializing with:", {
    mode: mode,
    keyIdPreview: keyId ? keyId.substring(0, 10) + "..." : "NOT SET",
    keyIdFull: process.env.NODE_ENV === "development" ? keyId : "HIDDEN_IN_PRODUCTION",
    keySecretSet: keySecret ? "✓ SET" : "✗ NOT SET",
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

  console.log("[RAZORPAY] Instance created successfully in", mode)
  return razorpayInstance
}

// Create Razorpay order
export const createRazorpayOrder = async (amount, currency = "INR") => {
  try {
    const razorpay = getRazorpayInstance()
    
    const orderAmount = Math.round(amount * 100) // Convert to paise
    console.log("[RAZORPAY] Creating order for amount:", {
      original: amount,
      inPaise: orderAmount,
      currency: currency
    })

    const order = await razorpay.orders.create({
      amount: orderAmount,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        source: "Biology.Trunk",
        environment: process.env.NODE_ENV || "development"
      }
    })
    
    console.log("[RAZORPAY] Order created successfully:", {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    })
    
    return order
  } catch (error) {
    console.error("[RAZORPAY] Error creating order:", error.message)
    console.error("[RAZORPAY] Full error details:", {
      code: error.code,
      statusCode: error.statusCode,
      description: error.description,
      error: error.error || "No additional error details",
    })
    
    // Provide helpful error messages
    let userMessage = `Failed to create order: ${error.message}`
    if (error.statusCode === 401) {
      userMessage = "Invalid Razorpay credentials. Please check your API keys."
    } else if (error.statusCode === 400) {
      userMessage = "Invalid payment request. Please check the amount and currency."
    }
    
    throw new Error(userMessage)
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("[RAZORPAY] Missing payment verification data")
      return false
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex")

    const isSignatureValid = expectedSignature === razorpay_signature

    console.log("[RAZORPAY] Payment verification result:", {
      isValid: isSignatureValid,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signatureMatch: isSignatureValid ? "✅ Valid" : "❌ Invalid",
      expectedSignaturePreview: expectedSignature.substring(0, 20) + "...",
      receivedSignaturePreview: razorpay_signature.substring(0, 20) + "...",
    })

    return isSignatureValid
  } catch (error) {
    console.error("[RAZORPAY] Error verifying payment:", error)
    throw new Error(`Failed to verify payment: ${error.message}`)
  }
}

// Helper function to check Razorpay mode
export const getRazorpayMode = () => {
  const keyId = process.env.RAZORPAY_KEY_ID
  if (keyId && keyId.includes("_live_")) {
    return "LIVE"
  } else if (keyId && keyId.includes("_test_")) {
    return "TEST"
  }
  return "UNKNOWN"
}

// Get Razorpay key for frontend
export const getRazorpayFrontendKey = () => {
  const keyId = process.env.RAZORPAY_KEY_ID
  const mode = getRazorpayMode()
  
  console.log("[RAZORPAY] Frontend key mode:", mode)
  
  // In production, ensure we're using live keys
  if (process.env.NODE_ENV === "production" && mode === "TEST") {
    console.warn("[RAZORPAY] ⚠️ WARNING: Using TEST keys in PRODUCTION environment!")
  }
  
  return keyId
}

export default getRazorpayInstance