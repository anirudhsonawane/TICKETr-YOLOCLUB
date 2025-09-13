import { NextRequest, NextResponse } from "next/server";
import { 
  validatePhonePeCallback,
  getPhonePeWebhookCredentials,
  PhonePeException,
  PHONEPE_CALLBACK_TYPES,
  PHONEPE_PAYMENT_STATUS,
  PHONEPE_REFUND_STATUS
} from "@/lib/phonepe";
import { createHash } from 'crypto';

// POST method for handling PhonePe webhooks
export async function POST(req: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await req.text();
    const authorization = req.headers.get('authorization');
    
    console.log("PhonePe webhook received:", {
      hasBody: !!body,
      hasAuthorization: !!authorization,
      bodyLength: body.length,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Validate required headers
    if (!authorization) {
      console.error("Missing authorization header in PhonePe webhook");
      return NextResponse.json({ 
        error: "Unauthorized", 
        details: "Missing authorization header"
      }, { status: 401 });
    }

    if (!body) {
      console.error("Missing body in PhonePe webhook");
      return NextResponse.json({ 
        error: "Bad Request", 
        details: "Missing request body"
      }, { status: 400 });
    }

    // Get webhook credentials
    let webhookCredentials;
    try {
      webhookCredentials = getPhonePeWebhookCredentials();
    } catch (error) {
      console.error("PhonePe webhook credentials error:", error);
      return NextResponse.json({ 
        error: "Configuration error", 
        details: "Webhook credentials not configured"
      }, { status: 500 });
    }

    // Validate callback using PhonePe SDK
    let validatedCallback;
    try {
      console.log("Validating PhonePe callback...");
      validatedCallback = await validatePhonePeCallback(
        webhookCredentials.username,
        webhookCredentials.password,
        authorization,
        body
      );
      console.log("PhonePe callback validated successfully:", validatedCallback);
    } catch (validationError) {
      console.error("PhonePe callback validation failed:", validationError);
      
      // Handle PhonePe specific errors
      if (validationError instanceof PhonePeException) {
        console.error("PhonePe API Error:", {
          code: validationError.code,
          message: validationError.message,
          httpStatusCode: validationError.httpStatusCode,
          data: validationError.data
        });
        
        return NextResponse.json({ 
          error: "Validation failed", 
          details: `PhonePe validation error: ${validationError.message}`,
          code: validationError.code
        }, { status: validationError.httpStatusCode || 400 });
      }
      
      return NextResponse.json({ 
        error: "Validation failed", 
        details: "Invalid webhook signature or data"
      }, { status: 400 });
    }

    // Process the validated callback
    const { type, payload } = validatedCallback;
    
    console.log("Processing PhonePe callback:", {
      type,
      payload: {
        orderId: payload.orderId,
        merchantOrderId: payload.originalMerchantOrderId,
        state: payload.state,
        amount: payload.amount
      }
    });

    // Handle different callback types
    switch (type) {
      case PHONEPE_CALLBACK_TYPES.CHECKOUT_ORDER_COMPLETED:
        await handleOrderCompleted(payload);
        break;
        
      case PHONEPE_CALLBACK_TYPES.CHECKOUT_ORDER_FAILED:
        await handleOrderFailed(payload);
        break;
        
      case PHONEPE_CALLBACK_TYPES.PG_REFUND_COMPLETED:
        await handleRefundCompleted(payload);
        break;
        
      case PHONEPE_CALLBACK_TYPES.PG_REFUND_FAILED:
        await handleRefundFailed(payload);
        break;
        
      case PHONEPE_CALLBACK_TYPES.PG_REFUND_ACCEPTED:
        await handleRefundAccepted(payload);
        break;
        
      default:
        console.warn("Unknown PhonePe callback type:", type);
        break;
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      type,
      orderId: payload.orderId || payload.refundId,
      state: payload.state
    });

  } catch (error) {
    console.error("PhonePe webhook processing error:", error);
    
    // Handle specific PhonePe errors
    if (error instanceof PhonePeException) {
      console.error("PhonePe API Error:", {
        code: error.code,
        message: error.message,
        httpStatusCode: error.httpStatusCode,
        data: error.data
      });
      
      return NextResponse.json({ 
        error: "PhonePe API Error", 
        details: error.message,
        code: error.code,
        httpStatusCode: error.httpStatusCode
      }, { status: error.httpStatusCode || 500 });
    }
    
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        return NextResponse.json({ 
          error: "Configuration error", 
          details: "PhonePe webhook credentials not configured"
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: "Webhook processing failed", 
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}

// Handle order completed callback
async function handleOrderCompleted(payload: any) {
  console.log("Processing order completed callback:", payload);
  
  try {
        const {
      orderId,
      originalMerchantOrderId,
      state,
      amount,
      metaInfo,
      paymentDetails
    } = payload;

    // Validate required fields
    if (!orderId || !originalMerchantOrderId || !state) {
      console.error("Missing required fields in order completed callback:", payload);
      return;
    }

    // Verify the state is actually completed
    if (state !== PHONEPE_PAYMENT_STATUS.COMPLETED) {
      console.warn("Order completed callback received but state is not COMPLETED:", state);
    }

    console.log("Order completed successfully:", {
      orderId,
      merchantOrderId: originalMerchantOrderId,
      amount,
      paymentDetails: paymentDetails?.length || 0
    });

    // Extract metadata for ticket creation
    const eventId = metaInfo?.eventId;
    const userId = metaInfo?.userId;
    const quantity = metaInfo?.quantity ? parseInt(metaInfo.quantity) : 1;
    const passId = metaInfo?.passId || undefined;
    const selectedDate = metaInfo?.selectedDate || undefined;

    if (!eventId || !userId) {
      console.error("Missing eventId or userId in metaInfo:", metaInfo);
      return;
    }

    // Create tickets using the same logic as Razorpay webhook
    console.log("Creating tickets for PhonePe payment:", {
          eventId,
          userId,
      paymentIntentId: orderId,
      amount,
          quantity,
          passId,
      selectedDate
    });

    try {
      // For now, we'll use the manual ticket creation API
      // You can implement direct MongoDB operations here later
      const ticketResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manual-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: orderId,
          eventId,
          userId,
          amount,
          quantity,
          passId,
          selectedDate,
        }),
      });

      const ticketData = await ticketResponse.json();
      
      if (ticketData.success) {
        console.log("✅ PhonePe ticket creation successful, result:", ticketData.ticketId);

        // Update payment session status
        try {
          const { PaymentSessionService } = await import("@/lib/paymentSessionService");
          await PaymentSessionService.updateSessionStatus(originalMerchantOrderId, "completed", {
            ticketIds: [ticketData.ticketId],
            completedAt: Date.now(),
            orderId,
            amount
          });
          console.log("✅ Payment session status updated to completed");
        } catch (sessionError) {
          console.warn("Failed to update payment session status:", sessionError);
        }

        console.log("✅ PhonePe purchase completed");
      } else {
        console.error("❌ Failed to create tickets:", ticketData.error);
      }

    } catch (ticketError) {
      console.error("❌ Error creating tickets for PhonePe payment:", ticketError);
      // Don't throw here as we want to acknowledge the webhook
    }

  } catch (error) {
    console.error("Error processing order completed callback:", error);
    // Don't throw here as we want to acknowledge the webhook
  }
}

// Handle order failed callback
async function handleOrderFailed(payload: any) {
  console.log("Processing order failed callback:", payload);
  
  try {
    const {
      orderId,
      originalMerchantOrderId,
      state,
      amount,
      errorCode,
      detailedErrorCode,
      metaInfo
    } = payload;

    // Validate required fields
    if (!orderId || !originalMerchantOrderId || !state) {
      console.error("Missing required fields in order failed callback:", payload);
      return;
    }

    // Verify the state is actually failed
    if (state !== PHONEPE_PAYMENT_STATUS.FAILED) {
      console.warn("Order failed callback received but state is not FAILED:", state);
    }

    // TODO: Update your database with the failed order
    // This is where you would:
    // 1. Update the order status in your database
    // 2. Send failure notification to customer
    // 3. Release any held inventory
    // 4. Log the failure for analysis

    console.log("Order failed:", {
      orderId,
      merchantOrderId: originalMerchantOrderId,
      amount,
      errorCode,
      detailedErrorCode
    });

    // Example: You might want to call your existing order failure logic here
    // await failOrder(originalMerchantOrderId, orderId, errorCode, detailedErrorCode);

  } catch (error) {
    console.error("Error processing order failed callback:", error);
    // Don't throw here as we want to acknowledge the webhook
  }
}

// Handle refund completed callback
async function handleRefundCompleted(payload: any) {
  console.log("Processing refund completed callback:", payload);
  
  try {
    const {
      refundId,
      merchantRefundId,
      state,
      amount,
      paymentDetails
    } = payload;

    // Validate required fields
    if (!refundId || !merchantRefundId || !state) {
      console.error("Missing required fields in refund completed callback:", payload);
      return;
    }

    // Verify the state is actually completed
    if (state !== PHONEPE_REFUND_STATUS.COMPLETED) {
      console.warn("Refund completed callback received but state is not COMPLETED:", state);
    }

    // TODO: Update your database with the completed refund
    // This is where you would:
    // 1. Update the refund status in your database
    // 2. Send refund confirmation email to customer
    // 3. Update order status to refunded
    // 4. Trigger any post-refund workflows

    console.log("Refund completed successfully:", {
      refundId,
      merchantRefundId,
      amount,
      paymentDetails: paymentDetails?.length || 0
    });

    // Example: You might want to call your existing refund completion logic here
    // await completeRefund(merchantRefundId, refundId, amount);

  } catch (error) {
    console.error("Error processing refund completed callback:", error);
    // Don't throw here as we want to acknowledge the webhook
  }
}

// Handle refund failed callback
async function handleRefundFailed(payload: any) {
  console.log("Processing refund failed callback:", payload);
  
  try {
    const {
      refundId,
      merchantRefundId,
      state,
      amount,
      errorCode,
      detailedErrorCode
    } = payload;

    // Validate required fields
    if (!refundId || !merchantRefundId || !state) {
      console.error("Missing required fields in refund failed callback:", payload);
      return;
    }

    // Verify the state is actually failed
    if (state !== PHONEPE_REFUND_STATUS.FAILED) {
      console.warn("Refund failed callback received but state is not FAILED:", state);
    }

    // TODO: Update your database with the failed refund
    // This is where you would:
    // 1. Update the refund status in your database
    // 2. Send failure notification to customer
    // 3. Log the failure for analysis
    // 4. Possibly retry the refund or escalate

    console.log("Refund failed:", {
      refundId,
      merchantRefundId,
      amount,
      errorCode,
      detailedErrorCode
    });

    // Example: You might want to call your existing refund failure logic here
    // await failRefund(merchantRefundId, refundId, errorCode, detailedErrorCode);

  } catch (error) {
    console.error("Error processing refund failed callback:", error);
    // Don't throw here as we want to acknowledge the webhook
  }
}

// Handle refund accepted callback
async function handleRefundAccepted(payload: any) {
  console.log("Processing refund accepted callback:", payload);
  
  try {
    const {
      refundId,
      merchantRefundId,
      state,
      amount
    } = payload;

    // Validate required fields
    if (!refundId || !merchantRefundId || !state) {
      console.error("Missing required fields in refund accepted callback:", payload);
      return;
    }

    // Verify the state is actually accepted/confirmed
    if (state !== PHONEPE_REFUND_STATUS.CONFIRMED) {
      console.warn("Refund accepted callback received but state is not CONFIRMED:", state);
    }

    // TODO: Update your database with the accepted refund
    // This is where you would:
    // 1. Update the refund status in your database
    // 2. Send acknowledgment email to customer
    // 3. Log the acceptance for tracking

    console.log("Refund accepted:", {
      refundId,
      merchantRefundId,
      amount
    });

    // Example: You might want to call your existing refund acceptance logic here
    // await acceptRefund(merchantRefundId, refundId, amount);

  } catch (error) {
    console.error("Error processing refund accepted callback:", error);
    // Don't throw here as we want to acknowledge the webhook
  }
}

// Helper function to calculate SHA256 hash for manual verification
function calculateSHA256Hash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

// GET method for webhook testing (optional)
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: "PhonePe webhook endpoint is active",
    timestamp: new Date().toISOString(),
    method: "POST",
    requiredHeaders: ["authorization"],
    requiredBody: "JSON string"
  });
}