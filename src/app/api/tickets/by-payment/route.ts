import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: "Missing paymentId parameter"
      }, { status: 400 });
    }

    const convex = getConvexClient();
    const tickets = await convex.query(api.tickets.getTicketsByPaymentIntent, { paymentIntentId: paymentId });

    return NextResponse.json({
      success: true,
      tickets: tickets || []
    });

  } catch (error) {
    console.error("Error fetching tickets by payment:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch tickets",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
