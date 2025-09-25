import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  console.log("=== MANUAL TICKET CREATION ===");
  
  try {
    const body = await req.json();
    console.log("Manual ticket request body:", body);
    
    const { 
      paymentId, 
      eventId, 
      userId, 
      quantity = 1, 
      amount, 
      passId, 
      selectedDate 
    } = body;
    
    console.log("Manual ticket data:", { 
      paymentId, 
      eventId, 
      userId, 
      quantity, 
      amount, 
      passId, 
      selectedDate 
    });
    
    if (!eventId || !userId || !paymentId) {
      console.log("Missing fields - eventId:", !!eventId, "userId:", !!userId, "paymentId:", !!paymentId);
      return NextResponse.json({ 
        success: false,
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
      amount: amount || 0,
      quantity,
      passId: passId || undefined,
      selectedDate: selectedDate || undefined,
    });
    
    console.log("✅ Manual ticket creation successful:", result);
    
    return NextResponse.json({ 
      success: true, 
      ticketId: result,
      message: "Ticket created successfully"
    });
  } catch (error) {
    console.error("❌ Manual ticket creation error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return NextResponse.json({ 
      success: false,
      error: "Ticket creation failed", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
