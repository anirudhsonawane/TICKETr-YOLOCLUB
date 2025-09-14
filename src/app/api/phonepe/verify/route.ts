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
    let client;
    try {
      client = getPhonePeClient();
      console.log("PhonePe client initialized successfully");
    } catch (clientError) {
      console.error("Failed to initialize PhonePe client:", clientError);
      return NextResponse.json({ 
        error: "Configuration error", 
        details: `PhonePe client initialization failed: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`
      }, { status: 500 });
    }
    
    console.log("Verifying PhonePe payment for order:", merchantOrderId);
    
    // Get order status from PhonePe
    let response;
    try {
      response = await client.getOrderStatus(merchantOrderId);
      console.log("PhonePe API call successful");
    } catch (apiError) {
      console.error("PhonePe API call failed:", apiError);
      return NextResponse.json({ 
        error: "API call failed", 
        details: `PhonePe API error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
        apiError: apiError instanceof Error ? apiError.message : String(apiError)
      }, { status: 500 });
    }
    
    console.log("PhonePe order status response:", JSON.stringify(response, null, 2));

    if (!response) {
      console.error("PhonePe API returned null/undefined response");
      return NextResponse.json({ 
        error: "Verification failed", 
        details: "PhonePe API returned no response"
      }, { status: 500 });
    }

    // Handle different possible response structures
    let code, data, paymentInfo;
    const responseAny = response as any;
    
    // Check if response has the old structure (code + data)
    if (responseAny.code && responseAny.data) {
      console.log("Using old response structure (code + data)");
      code = responseAny.code;
      data = responseAny.data;
      paymentInfo = data;
    }
    // Check if response has the new structure (direct payment info)
    else if (responseAny.state || responseAny.status || responseAny.paymentStatus) {
      console.log("Using new response structure (direct payment info)");
      code = responseAny.code || responseAny.status || "SUCCESS";
      data = responseAny;
      paymentInfo = responseAny;
    }
    // Check if response is the payment info directly
    else if (responseAny.amount || responseAny.transactionId) {
      console.log("Using direct payment info structure");
      code = "SUCCESS";
      data = responseAny;
      paymentInfo = responseAny;
    }
    else {
      console.error("Unknown PhonePe API response structure:", response);
      return NextResponse.json({ 
        error: "Verification failed", 
        details: "Unknown PhonePe API response structure",
        rawResponse: response
      }, { status: 500 });
    }

    console.log("Parsed response:", { code, data, paymentInfo });
    
    // Check if the request was successful
    if (code !== "SUCCESS") {
      console.error("PhonePe verification failed with code:", code);
      return NextResponse.json({ 
        error: "Verification failed", 
        details: `PhonePe returned error code: ${code}`,
        code
      }, { status: 400 });
    }

    // Extract payment details with flexible field mapping
    const paymentInfoAny = paymentInfo as any;
    const paymentStatus = paymentInfoAny.code || paymentInfoAny.state || paymentInfoAny.status || paymentInfoAny.paymentStatus;
    
    // Check for success with multiple possible status values
    const isSuccess = paymentStatus === PHONEPE_PAYMENT_STATUS.COMPLETED || 
                     paymentStatus === 'SUCCESS' || 
                     paymentStatus === 'PAYMENT_SUCCESS' ||
                     paymentStatus === 'COMPLETED';
    
    console.log("Payment verification result:", {
      orderId: merchantOrderId,
      status: paymentStatus,
      isSuccess,
      amount: paymentInfoAny.amount,
      transactionId: paymentInfoAny.transactionId,
      allFields: Object.keys(paymentInfo)
    });

    return NextResponse.json({
      success: true,
      orderId: merchantOrderId,
      paymentStatus: paymentStatus, // This is what the success page checks
      status: paymentStatus,
      isSuccess,
      amount: paymentInfoAny.amount,
      currency: paymentInfoAny.currency || "INR",
      transactionId: paymentInfoAny.transactionId,
      paymentId: paymentInfoAny.paymentId,
      responseCode: paymentInfoAny.responseCode,
      responseMessage: paymentInfoAny.responseMessage,
      paymentInstrument: paymentInfoAny.paymentInstrument,
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
