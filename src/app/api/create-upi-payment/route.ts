import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      eventId,
      userId,
      quantity,
      passId,
      couponCode,
      selectedDate,
      waitingListId,
      customerName,
      customerPhone,
      upiId,
      merchantName = "TICKETr",
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!upiId) {
      return NextResponse.json(
        { error: "UPI ID is required" },
        { status: 400 }
      );
    }

    // Generate unique payment session ID
    const sessionId = `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment note
    const paymentNote = `TICKETr - Event ticket payment`;

    // Generate UPI deep link
    const generateUPILink = () => {
      const params = new URLSearchParams({
        pa: upiId,
        pn: merchantName,
        am: amount.toString(),
        cu: "INR",
        tn: paymentNote,
      });

      // Add optional parameters
      if (customerName) {
        params.append("pn", customerName);
      }

      return `upi://pay?${params.toString()}`;
    };

    const upiLink = generateUPILink();

    // Create payment session in database
    try {
      await convex.mutation(api.paymentSessions.createPaymentSession, {
        sessionId,
        userId,
        eventId,
        amount: Number(amount),
        quantity: Number(quantity) || 1,
        passId: passId || undefined,
        selectedDate: selectedDate || undefined,
        couponCode: couponCode || undefined,
        waitingListId: waitingListId || undefined,
        paymentMethod: "upi",
        metadata: {
          upiId,
          merchantName,
          paymentNote,
          upiLink,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
        },
      });
    } catch (sessionError) {
      console.error("Failed to create payment session:", sessionError);
      // Continue with payment generation even if session creation fails
    }

    // Return payment details
    return NextResponse.json({
      success: true,
      paymentId: sessionId,
      upiLink,
      amount,
      currency: "INR",
      upiId,
      merchantName,
      paymentNote,
      instructions: {
        step1: "Click the UPI link or scan the QR code",
        step2: "Verify amount and merchant details",
        step3: "Complete payment in your UPI app",
        step4: "Keep the payment receipt for confirmation",
      },
      supportedApps: [
        "GPay (Google Pay)",
        "PhonePe",
        "Paytm",
        "BHIM",
        "Amazon Pay",
        "Any UPI enabled app",
      ],
    });

  } catch (error) {
    console.error("UPI payment creation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create UPI payment",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving payment details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Get payment session
    const session = await convex.query(api.paymentSessions.getPaymentSession, {
      sessionId: paymentId,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Payment session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: session.sessionId,
        amount: session.amount,
        currency: "INR",
        status: session.status,
        paymentMethod: session.paymentMethod,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        metadata: session.metadata,
      },
    });

  } catch (error) {
    console.error("UPI payment retrieval error:", error);
    return NextResponse.json(
      { 
        error: "Failed to retrieve payment details",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
