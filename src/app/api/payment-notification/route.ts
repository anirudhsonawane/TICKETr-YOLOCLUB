import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Payment notification request body:", body);
    
    const {
      eventId,
      userId,
      amount,
      quantity,
      passId,
      upiTransactionId,
      payeeName,
      payeeMobileNumber,
      userInfo
    } = body;

    // Validate required fields
    if (!eventId || !userId || !amount || !quantity || !upiTransactionId || !payeeName || !payeeMobileNumber) {
      console.log("Missing required fields:", { eventId, userId, amount, quantity, upiTransactionId, payeeName, payeeMobileNumber });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate eventId format (should be a Convex ID)
    if (typeof eventId !== 'string' || !eventId.startsWith('j')) {
      console.log("Invalid eventId format:", eventId);
      return NextResponse.json(
        { success: false, error: "Invalid event ID format" },
        { status: 400 }
      );
    }

    console.log("Creating payment notification with data:", {
      eventId,
      userId,
      amount,
      quantity,
      passId,
      upiTransactionId,
      payeeName,
      payeeMobileNumber,
      userInfo
    });

    // Create payment notification in Convex
    const notificationId = await convex.mutation(api.paymentNotifications.create, {
      eventId,
      userId,
      amount,
      quantity,
      passId,
      upiTransactionId,
      payeeName,
      payeeMobileNumber,
      userInfo
    });

    console.log("Payment notification created successfully:", notificationId);

    return NextResponse.json({
      success: true,
      notificationId,
      message: "Payment notification submitted successfully"
    });

  } catch (error) {
    console.error("Error creating payment notification:", error);
    return NextResponse.json(
      { success: false, error: `Failed to create payment notification: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const userId = searchParams.get("userId");

    if (eventId) {
      const notifications = await convex.query(api.paymentNotifications.getByEvent, { eventId });
      return NextResponse.json({ success: true, notifications });
    } else if (userId) {
      const notifications = await convex.query(api.paymentNotifications.getByUser, { userId });
      return NextResponse.json({ success: true, notifications });
    } else {
      const notifications = await convex.query(api.paymentNotifications.getAllPending);
      return NextResponse.json({ success: true, notifications });
    }
  } catch (error) {
    console.error("Error fetching payment notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment notifications" },
      { status: 500 }
    );
  }
}
