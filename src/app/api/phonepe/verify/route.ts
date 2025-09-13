import { NextRequest, NextResponse } from "next/server";
import { getPhonePeClient, PHONEPE_PAYMENT_STATUS } from "@/lib/phonepe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("PhonePe payment verification request:", body);
    
    const { merchantOrderId } = body;
    
    if (!merchantOrderId) {
      console.error("Missing merchantOrderId for verification");
      return NextResponse.json({ 
        error: "Missing required field", 
        details: "merchantOrderId is required"
      }, { status: 400 });
    }

    // Initialize PhonePe client
    const client = getPhonePeClient();
    
    console.log("Verifying PhonePe payment for order:", merchantOrderId);
    
    // Get order status from PhonePe
    const response = await client.getOrderStatus(merchantOrderId);
    
    console.log("PhonePe order status response:", response);

    if (!response || !response.data) {
      console.error("Invalid PhonePe verification response");
      return NextResponse.json({ 
        error: "Verification failed", 
        details: "Invalid response from PhonePe"
      }, { status: 500 });
    }

    const { code, data } = response;
    
    // Check if the request was successful
    if (code !== "SUCCESS") {
      console.error("PhonePe verification failed with code:", code);
      return NextResponse.json({ 
        error: "Verification failed", 
        details: `PhonePe returned error code: ${code}`,
        code
      }, { status: 400 });
    }

    // Extract payment details
    const paymentInfo = data;
    const isSuccess = paymentInfo.code === PHONEPE_PAYMENT_STATUS.SUCCESS;
    
    console.log("Payment verification result:", {
      orderId: merchantOrderId,
      status: paymentInfo.code,
      isSuccess,
      amount: paymentInfo.amount,
      transactionId: paymentInfo.transactionId
    });

    return NextResponse.json({
      success: true,
      orderId: merchantOrderId,
      status: paymentInfo.code,
      isSuccess,
      amount: paymentInfo.amount,
      currency: paymentInfo.currency || "INR",
      transactionId: paymentInfo.transactionId,
      paymentId: paymentInfo.paymentId,
      responseCode: paymentInfo.responseCode,
      responseMessage: paymentInfo.responseMessage,
      paymentInstrument: paymentInfo.paymentInstrument,
      rawResponse: paymentInfo,
    });

  } catch (error) {
    console.error("PhonePe payment verification error:", error);
    
    // Handle specific PhonePe errors
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        return NextResponse.json({ 
          error: "Configuration error", 
          details: "PhonePe credentials are invalid or missing"
        }, { status: 500 });
      }
      
      if (error.message.includes('not found') || error.message.includes('404')) {
        return NextResponse.json({ 
          error: "Order not found", 
          details: "The specified order ID does not exist"
        }, { status: 404 });
      }
    }

    return NextResponse.json({ 
      error: "Verification failed", 
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}

// GET endpoint for direct verification via query params
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantOrderId = searchParams.get('orderId');
    
    if (!merchantOrderId) {
      return NextResponse.json({ 
        error: "Missing required parameter", 
        details: "orderId query parameter is required"
      }, { status: 400 });
    }

    // Use the same verification logic as POST
    return POST(new NextRequest(req.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantOrderId })
    }));

  } catch (error) {
    console.error("PhonePe payment verification error (GET):", error);
    return NextResponse.json({ 
      error: "Verification failed", 
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
