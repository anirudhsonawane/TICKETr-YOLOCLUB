import { NextRequest, NextResponse } from "next/server";
import { 
  createPhonePeRefundRequest,
  initiatePhonePeRefund,
  checkPhonePeRefundStatus,
  generatePhonePeRefundId,
  PhonePeException,
  PHONEPE_REFUND_STATUS,
  isTerminalRefundState
} from "@/lib/phonepe";

// POST method for initiating refund
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      originalMerchantOrderId, 
      amount, 
      merchantRefundId,
      reason = "Customer requested refund"
    } = body;

    // Validate required parameters
    if (!originalMerchantOrderId || !amount) {
      return NextResponse.json({ 
        error: "Missing parameters", 
        details: "originalMerchantOrderId and amount are required"
      }, { status: 400 });
    }

    // Convert amount to number if it's a string
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Validate amount
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ 
        error: "Invalid amount", 
        details: "Refund amount must be greater than 0"
      }, { status: 400 });
    }

    // Generate refund ID if not provided
    const refundId = merchantRefundId || generatePhonePeRefundId();

    console.log("Initiating PhonePe refund:", {
      originalMerchantOrderId,
      amount: numericAmount,
      refundId,
      reason
    });

    try {
      // Create refund request
      const refundRequest = createPhonePeRefundRequest({
        merchantRefundId: refundId,
        originalMerchantOrderId,
        amount: numericAmount,
      });

      console.log("Refund request created:", refundRequest);

      // Initiate refund
      const response = await initiatePhonePeRefund(refundRequest);
      
      console.log("PhonePe refund initiated:", response);

      // Check if response has the expected structure
      if (!response) {
        console.error("Invalid PhonePe refund response structure:", response);
        return NextResponse.json({ 
          error: "Refund initiation failed", 
          details: "Invalid response structure from PhonePe"
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        refundId: response.refundId,
        merchantRefundId: refundId,
        originalMerchantOrderId,
        state: response.state,
        amount: response.amount,
        reason,
        // Additional status information
        statusInfo: {
          isPending: response.state === PHONEPE_REFUND_STATUS.PENDING,
          isConfirmed: response.state === PHONEPE_REFUND_STATUS.CONFIRMED,
          isCompleted: response.state === PHONEPE_REFUND_STATUS.COMPLETED,
          isFailed: response.state === PHONEPE_REFUND_STATUS.FAILED,
          needsReconciliation: response.state === PHONEPE_REFUND_STATUS.PENDING || response.state === PHONEPE_REFUND_STATUS.CONFIRMED
        }
      });
    } catch (refundError) {
      console.error("PhonePe refund initiation failed:", refundError);
      
      // Handle PhonePe specific errors
      if (refundError instanceof PhonePeException) {
        console.error("PhonePe API Error:", {
          code: refundError.code,
          message: refundError.message,
          httpStatusCode: refundError.httpStatusCode,
          data: refundError.data
        });
        
        return NextResponse.json({ 
          error: "Refund initiation failed", 
          details: `PhonePe API Error: ${refundError.message}`,
          code: refundError.code,
          httpStatusCode: refundError.httpStatusCode
        }, { status: refundError.httpStatusCode || 500 });
      }
      
      throw refundError;
    }

  } catch (error) {
    console.error("PhonePe refund initiation error:", error);
    
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
      
      if (error.message.includes('amount')) {
        return NextResponse.json({ 
          error: "Invalid amount", 
          details: "Refund amount must be greater than 0"
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: "Refund initiation failed", 
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}

// GET method for checking refund status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refundId = searchParams.get('refundId');

    // Validate required parameters
    if (!refundId) {
      return NextResponse.json({ 
        error: "Missing parameter", 
        details: "refundId is required"
      }, { status: 400 });
    }

    console.log("Checking PhonePe refund status:", {
      refundId
    });

    try {
      const response = await checkPhonePeRefundStatus(refundId);
      
      console.log("PhonePe refund status response:", response);

      // Check if response has the expected structure
      if (!response) {
        console.error("Invalid PhonePe response structure:", response);
        return NextResponse.json({ 
          error: "Refund status check failed", 
          details: "Invalid response structure from PhonePe"
        }, { status: 500 });
      }

      // Determine if refund is in terminal state
      const isTerminal = isTerminalRefundState(response.state);

      return NextResponse.json({
        success: true,
        refundId: response.refundId,
        merchantRefundId: response.merchantRefundId,
        state: response.state,
        amount: response.amount,
        paymentDetails: response.paymentDetails || [],
        isTerminal,
        // Additional status information
        statusInfo: {
          isPending: response.state === PHONEPE_REFUND_STATUS.PENDING,
          isConfirmed: response.state === PHONEPE_REFUND_STATUS.CONFIRMED,
          isCompleted: response.state === PHONEPE_REFUND_STATUS.COMPLETED,
          isFailed: response.state === PHONEPE_REFUND_STATUS.FAILED,
          needsReconciliation: response.state === PHONEPE_REFUND_STATUS.PENDING || response.state === PHONEPE_REFUND_STATUS.CONFIRMED
        }
      });
    } catch (statusError) {
      console.error("PhonePe refund status check failed:", statusError);
      
      // Handle PhonePe specific errors
      if (statusError instanceof PhonePeException) {
        console.error("PhonePe API Error:", {
          code: statusError.code,
          message: statusError.message,
          httpStatusCode: statusError.httpStatusCode,
          data: statusError.data
        });
        
        return NextResponse.json({ 
          error: "Refund status check failed", 
          details: `PhonePe API Error: ${statusError.message}`,
          code: statusError.code,
          httpStatusCode: statusError.httpStatusCode
        }, { status: statusError.httpStatusCode || 500 });
      }
      
      throw statusError;
    }

  } catch (error) {
    console.error("PhonePe refund status check error:", error);
    
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
      error: "Refund status check failed", 
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}