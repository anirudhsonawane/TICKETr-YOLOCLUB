import { NextRequest, NextResponse } from "next/server";
import { 
  checkPhonePeOrderStatus,
  PhonePeException,
  PHONEPE_PAYMENT_STATUS,
  isTerminalPaymentState
} from "@/lib/phonepe";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantOrderId = searchParams.get('merchantOrderId');
    const details = searchParams.get('details') === 'true';

    // Validate required parameters
    if (!merchantOrderId) {
      return NextResponse.json({ 
        error: "Missing parameter", 
        details: "merchantOrderId is required"
      }, { status: 400 });
    }

    console.log("Checking PhonePe order status:", {
      merchantOrderId,
      details
    });

    try {
      const response = await checkPhonePeOrderStatus(merchantOrderId, details);
      
      console.log("PhonePe order status response:", response);

      // Check if response has the expected structure
      if (!response) {
        console.error("Invalid PhonePe response structure:", response);
        return NextResponse.json({ 
          error: "Status check failed", 
          details: "Invalid response structure from PhonePe"
        }, { status: 500 });
      }

      // Determine if payment is in terminal state
      const isTerminal = isTerminalPaymentState(response.state);

      return NextResponse.json({
        success: true,
        orderId: response.orderId,
        merchantOrderId: merchantOrderId,
        state: response.state,
        amount: response.amount,
        expireAt: response.expireAt,
        metaInfo: response.metaInfo,
        paymentDetails: response.paymentDetails || [],
        isTerminal,
        // Additional status information
        statusInfo: {
          isPending: response.state === PHONEPE_PAYMENT_STATUS.PENDING,
          isCompleted: response.state === PHONEPE_PAYMENT_STATUS.COMPLETED,
          isFailed: response.state === PHONEPE_PAYMENT_STATUS.FAILED,
          needsReconciliation: response.state === PHONEPE_PAYMENT_STATUS.PENDING
        }
      });
    } catch (statusError) {
      console.error("PhonePe order status check failed:", statusError);
      
      // Handle PhonePe specific errors
      if (statusError instanceof PhonePeException) {
        console.error("PhonePe API Error:", {
          code: statusError.code,
          message: statusError.message,
          httpStatusCode: statusError.httpStatusCode,
          data: statusError.data
        });
        
        return NextResponse.json({ 
          error: "Status check failed", 
          details: `PhonePe API Error: ${statusError.message}`,
          code: statusError.code,
          httpStatusCode: statusError.httpStatusCode
        }, { status: statusError.httpStatusCode || 500 });
      }
      
      throw statusError;
    }

  } catch (error) {
    console.error("PhonePe order status check error:", error);
    
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
          details: "PhonePe credentials are invalid or missing"
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: "Status check failed", 
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}

// POST method for reconciliation with custom parameters
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantOrderId, details = false, maxRetries = 5, retryDelay = 3000 } = body;

    // Validate required parameters
    if (!merchantOrderId) {
      return NextResponse.json({ 
        error: "Missing parameter", 
        details: "merchantOrderId is required"
      }, { status: 400 });
    }

    console.log("Starting PhonePe order reconciliation:", {
      merchantOrderId,
      details,
      maxRetries,
      retryDelay
    });

    let attempts = 0;
    let lastResponse = null;
    let isTerminal = false;

    // Reconciliation loop
    while (attempts < maxRetries && !isTerminal) {
      attempts++;
      
      try {
        console.log(`Reconciliation attempt ${attempts}/${maxRetries} for order: ${merchantOrderId}`);
        
        const response = await checkPhonePeOrderStatus(merchantOrderId, details);
        lastResponse = response;
        
        console.log(`Attempt ${attempts} response:`, {
          state: response.state,
          orderId: response.orderId
        });

        // Check if payment is in terminal state
        isTerminal = isTerminalPaymentState(response.state);
        
        if (isTerminal) {
          console.log(`Order ${merchantOrderId} reached terminal state: ${response.state}`);
          break;
        }

        // Wait before next attempt (except for the last attempt)
        if (attempts < maxRetries) {
          console.log(`Waiting ${retryDelay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.error(`Reconciliation attempt ${attempts} failed:`, error);
        
        // If it's a PhonePe API error, we might want to stop reconciliation
        if (error instanceof PhonePeException) {
          console.error("PhonePe API Error during reconciliation:", {
            code: error.code,
            message: error.message,
            httpStatusCode: error.httpStatusCode
          });
          
          // For certain errors, we might want to stop reconciliation
          if (error.httpStatusCode >= 400 && error.httpStatusCode < 500) {
            break;
          }
        }
        
        // Wait before retry (except for the last attempt)
        if (attempts < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    // Return the final response
    if (lastResponse) {
      const finalIsTerminal = isTerminalPaymentState(lastResponse.state);
      
      return NextResponse.json({
        success: true,
        orderId: lastResponse.orderId,
        merchantOrderId: merchantOrderId,
        state: lastResponse.state,
        amount: lastResponse.amount,
        expireAt: lastResponse.expireAt,
        metaInfo: lastResponse.metaInfo,
        paymentDetails: lastResponse.paymentDetails || [],
        isTerminal: finalIsTerminal,
        reconciliationInfo: {
          attempts,
          maxRetries,
          reachedTerminal: finalIsTerminal,
          finalAttempt: attempts === maxRetries
        },
        // Additional status information
        statusInfo: {
          isPending: lastResponse.state === PHONEPE_PAYMENT_STATUS.PENDING,
          isCompleted: lastResponse.state === PHONEPE_PAYMENT_STATUS.COMPLETED,
          isFailed: lastResponse.state === PHONEPE_PAYMENT_STATUS.FAILED,
          needsReconciliation: lastResponse.state === PHONEPE_PAYMENT_STATUS.PENDING
        }
      });
    } else {
      return NextResponse.json({ 
        error: "Reconciliation failed", 
        details: "Unable to retrieve order status after all attempts"
      }, { status: 500 });
    }

  } catch (error) {
    console.error("PhonePe order reconciliation error:", error);
    
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
          details: "PhonePe credentials are invalid or missing"
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: "Reconciliation failed", 
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}