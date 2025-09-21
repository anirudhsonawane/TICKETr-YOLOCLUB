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
      paymentReference,
      quantity,
      amount,
      passId,
      upiTransactionId,
      notes
    } = body;

    // Validate required fields
    if (!eventId || !userId || !quantity || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create ticket in Convex
    const ticketId = await convex.mutation(api.tickets.create, {
      eventId,
      userId,
      amount,
      quantity,
      passId,
      paymentIntentId: paymentReference || `UPI-${Date.now()}`,
      upiTransactionId,
      notes
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: "Ticket created successfully"
    });

  } catch (error) {
    console.error("Error creating manual UPI ticket:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
