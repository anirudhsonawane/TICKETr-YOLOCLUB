import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      notificationId,
      message: "Payment notification submitted successfully"
    });

  } catch (error) {
    console.error("Error creating payment notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment notification" },
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
