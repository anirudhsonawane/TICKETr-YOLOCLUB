import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  console.log("=== FALLBACK TICKET CREATION ===");
  
  try {
    const body = await req.json();
    console.log("Fallback ticket request body:", body);
    
    const { 
      paymentId, 
      eventId, 
      userId, 
      amount,
      quantity = 1
    } = body;
    
    if (!paymentId || !eventId || !userId) {
      return NextResponse.json({ 
        success: false,
        error: "Missing required fields: paymentId, eventId, userId"
      }, { status: 400 });
    }
    
    const convex = getConvexClient();
    
    // Get event details to ensure it exists
    const event = await convex.query(api.events.getEvent, { eventId });
    if (!event) {
      return NextResponse.json({ 
        success: false,
        error: "Event not found"
      }, { status: 404 });
    }
    
    // Get user details to ensure user exists
    const user = await convex.query(api.users.getUser, { userId });
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: "User not found"
      }, { status: 404 });
    }
    
    // Create ticket with minimal information
    const result = await convex.mutation(api.tickets.issueAfterPayment, {
      eventId,
      userId,
      paymentIntentId: paymentId,
      amount: amount || 0,
      quantity,
      passId: undefined, // No pass information available
      selectedDate: undefined, // No date information available
    });
    
    console.log("✅ Fallback ticket creation successful:", result);
    
    return NextResponse.json({ 
      success: true, 
      ticketId: result,
      message: "Ticket created successfully with fallback method"
    });
  } catch (error) {
    console.error("❌ Fallback ticket creation error:", error);
    
    return NextResponse.json({ 
      success: false,
      error: "Fallback ticket creation failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
