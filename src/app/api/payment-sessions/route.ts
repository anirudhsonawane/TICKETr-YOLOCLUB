import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

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

    console.log("🔧 Payment session creation data:", {
      sessionId,
      userId,
      eventId,
      amount,
      quantity: quantity || 1,
      passId,
      selectedDate,
      couponCode,
      waitingListId,
      paymentMethod
    });

    const convex = getConvexClient();
    
    // First, verify the user exists
    const user = await convex.query(api.users.getUserById, { userId });
    if (!user) {
      console.error("❌ User not found during payment session creation:", userId);
      return NextResponse.json({
        success: false,
        error: "User not found",
        details: `User with ID ${userId} does not exist in the database. Please ensure you are logged in with a valid account.`
      }, { status: 404 });
    }
    console.log("✅ User verified for payment session:", user.name || user.email);
    
    try {
      const session = await convex.mutation(api.paymentSessions.createPaymentSession, {
        sessionId,
        userId,
        eventId,
        amount: Number(amount),
        quantity: Number(quantity) || 1,
        passId,
        selectedDate,
        couponCode,
        waitingListId,
        paymentMethod,
        metadata
      });

      return NextResponse.json({
        success: true,
        sessionId: session,
        message: "Payment session created successfully"
      });
    } catch (sessionError) {
      console.error("❌ Payment session creation failed, but payment can still proceed:", sessionError);
      
      // Return a success response even if session creation fails
      // The payment can still be processed using fallback mechanisms
      return NextResponse.json({
        success: true,
        sessionId: sessionId, // Use the original sessionId
        message: "Payment session creation failed, but payment can proceed with fallback",
        warning: "Payment session not stored in database, but payment processing can continue"
      });
    }

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
    console.log("🔍 Payment session GET request received");
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    
    console.log("📋 Request URL:", req.url);
    console.log("🆔 Session ID:", sessionId);

    if (!sessionId) {
      console.log("❌ Missing sessionId parameter");
      return NextResponse.json({
        error: "Missing sessionId parameter"
      }, { status: 400 });
    }

    console.log("🔗 Getting Convex client...");
    const convex = getConvexClient();
    
    console.log("🔍 Querying payment session from database...");
    const session = await convex.query(api.paymentSessions.getPaymentSessionWithEvent, { sessionId });
    
    console.log("📊 Session query result:", session);

    if (!session) {
      console.log("❌ Payment session not found in database");
      return NextResponse.json({
        success: false,
        error: "Payment session not found",
        sessionId: sessionId,
        message: "This payment session does not exist in the database. This could happen if the session was never created or has expired.",
        suggestion: "Try using the fallback ticket creation endpoint with the payment details"
      }, { status: 404 });
    }

    console.log("✅ Payment session found:", session);
    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error("❌ Payment session retrieval error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json({
      error: "Failed to retrieve payment session",
      details: error instanceof Error ? error.message : "Unknown error",
      sessionId: new URL(req.url).searchParams.get('sessionId')
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

    const convex = getConvexClient();
    const session = await convex.mutation(api.paymentSessions.updatePaymentSessionStatus, {
      sessionId,
      status,
      metadata
    });

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
