import { NextRequest, NextResponse } from "next/server";
import { PaymentSessionService } from "@/lib/paymentSessionService";

// POST - Create payment session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      userId,
      eventId,
      amount,
      quantity,
      passId,
      selectedDate,
      couponCode,
      waitingListId,
      paymentMethod,
      metadata
    } = body;

    // Validate required fields
    if (!sessionId || !userId || !eventId || !amount || !paymentMethod) {
      return NextResponse.json({
        error: "Missing required fields",
        details: "sessionId, userId, eventId, amount, and paymentMethod are required"
      }, { status: 400 });
    }

    const session = await PaymentSessionService.createSession({
      sessionId,
      userId,
      eventId,
      amount,
      quantity: quantity || 1,
      passId,
      selectedDate,
      couponCode,
      waitingListId,
      paymentMethod,
      metadata
    });

    return NextResponse.json({
      success: true,
      sessionId: session._id,
      message: "Payment session created successfully"
    });

  } catch (error) {
    console.error("Payment session creation error:", error);
    return NextResponse.json({
      error: "Failed to create payment session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// GET - Get payment session
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        error: "Missing sessionId parameter"
      }, { status: 400 });
    }

    const session = await PaymentSessionService.getSessionWithEvent(sessionId);

    if (!session) {
      return NextResponse.json({
        error: "Payment session not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error("Payment session retrieval error:", error);
    return NextResponse.json({
      error: "Failed to retrieve payment session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// PUT - Update payment session status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, status, metadata } = body;

    if (!sessionId || !status) {
      return NextResponse.json({
        error: "Missing required fields",
        details: "sessionId and status are required"
      }, { status: 400 });
    }

    const session = await PaymentSessionService.updateSessionStatus(sessionId, status, metadata);

    if (!session) {
      return NextResponse.json({
        error: "Payment session not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Payment session updated successfully"
    });

  } catch (error) {
    console.error("Payment session update error:", error);
    return NextResponse.json({
      error: "Failed to update payment session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
