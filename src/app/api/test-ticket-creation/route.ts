import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  console.log("=== TEST TICKET CREATION ===");
  
  try {
    const body = await req.json();
    console.log("Test request body:", body);
    
    const { eventId, userId, paymentId, quantity = 1, amount = 100, passId } = body;
    
    console.log("Test data:", { eventId, userId, paymentId, quantity, amount, passId });
    
    if (!eventId || !userId || !paymentId) {
      console.log("Missing fields - eventId:", !!eventId, "userId:", !!userId, "paymentId:", !!paymentId);
      return NextResponse.json({ 
        error: "Missing required fields",
        received: { eventId: !!eventId, userId: !!userId, paymentId: !!paymentId }
      }, { status: 400 });
    }
    
    console.log("Getting Convex client...");
    const convex = getConvexClient();
    
    console.log("Calling issueAfterPayment mutation...");
    const result = await convex.mutation(api.tickets.issueAfterPayment, {
      eventId,
      userId,
      paymentIntentId: paymentId,
      amount,
      quantity,
      passId: passId || undefined,
    });
    
    console.log("✅ Test ticket creation successful:", result);
    
    return NextResponse.json({ 
      success: true, 
      ticketIds: result,
      message: "Test ticket creation successful"
    });
  } catch (error) {
    console.error("❌ Test ticket creation error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return NextResponse.json({ 
      error: "Test ticket creation failed", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
