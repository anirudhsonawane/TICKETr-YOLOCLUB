import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  console.log("=== FALLBACK TICKET CREATION ===");
  console.log("📋 Request URL:", req.url);
  
  try {
    const body = await req.json();
    console.log("📦 Fallback ticket request body:", body);
    
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
    
    // Get user details to ensure user exists
    let user = await convex.query(api.users.getUserById, { userId });
    if (!user) {
      console.error("❌ User not found in fallback ticket creation:", userId);
      console.log("🔄 Attempting to create temporary user for ticket creation...");
      
      // Try to create a temporary user for this ticket
      try {
        const tempUserId = await convex.mutation(api.auth.createUser, {
          userId: userId,
          email: `temp_${userId}@ticketr.com`,
          name: `User ${userId.substring(0, 8)}`,
          role: "user",
          isEmailVerified: false,
          lastLogin: Date.now(),
        });
        
        console.log("✅ Temporary user created:", tempUserId);
        user = await convex.query(api.users.getUserById, { userId });
      } catch (createUserError) {
        console.error("❌ Failed to create temporary user:", createUserError);
        return NextResponse.json({ 
          success: false,
          error: "User not found and cannot create temporary user",
          details: `User with ID ${userId} does not exist in the database and temporary user creation failed: ${createUserError instanceof Error ? createUserError.message : String(createUserError)}`
        }, { status: 404 });
      }
    }
    console.log("✅ User found/created in fallback:", user.name || user.email);
    
    // Create ticket with minimal information
    const result = await convex.mutation(api.tickets.issueAfterPayment, {
      eventId,
      userId,
      paymentIntentId: paymentId,
      amount: Number(amount) || 0,
      quantity: Number(quantity) || 1,
      passId: undefined, // No pass information available
      selectedDate: undefined, // No date information available
    });
    
    console.log("✅ Fallback ticket creation successful:", result);
    
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new Error("Fallback ticket creation returned empty result");
    }
    
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
