import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  console.log("=== MANUAL TICKET CREATION FOR SPECIFIC CASE ===");
  
  try {
    const body = await req.json();
    console.log("Manual ticket creation request body:", body);
    
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
    const event = await convex.query(api.events.getById, { eventId });
    if (!event) {
      return NextResponse.json({ 
        success: false,
        error: "Event not found"
      }, { status: 404 });
    }
    console.log("✅ Event found:", event.name);
    
    // Get user details to ensure user exists
    const user = await convex.query(api.users.getUserById, { userId });
    if (!user) {
      console.error("❌ User not found:", userId);
      return NextResponse.json({ 
        success: false,
        error: "User not found",
        details: `User with ID ${userId} does not exist in the database`
      }, { status: 404 });
    }
    console.log("✅ User found:", user.name || user.email);
    
    // Create ticket with the correct user ID
    const result = await convex.mutation(api.tickets.issueAfterPayment, {
      eventId,
      userId,
      paymentIntentId: paymentId,
      amount: amount || 0,
      quantity,
      passId: undefined,
      selectedDate: undefined,
    });
    
    console.log("✅ Manual ticket creation successful:", result);
    
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new Error("Manual ticket creation returned empty result");
    }
    
    return NextResponse.json({ 
      success: true, 
      ticketId: result,
      message: "Ticket created successfully with correct user ID"
    });
  } catch (error) {
    console.error("❌ Manual ticket creation error:", error);
    
    return NextResponse.json({ 
      success: false,
      error: "Manual ticket creation failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
