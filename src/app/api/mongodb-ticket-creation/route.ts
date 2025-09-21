import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  console.log("=== MONGODB TICKET CREATION ===");
  
  try {
    const body = await req.json();
    console.log("Request body:", body);
    
    const { eventId, userId, paymentId, quantity = 1, amount = 100, passId, selectedDate } = body;
    
    console.log("Parsed data:", { eventId, userId, paymentId, quantity, amount, passId, selectedDate });
    
    if (!eventId || !userId || !paymentId) {
      console.log("Missing fields - eventId:", !!eventId, "userId:", !!userId, "paymentId:", !!paymentId);
      return NextResponse.json({ 
        error: "Missing required fields",
        received: { eventId: !!eventId, userId: !!userId, paymentId: !!paymentId }
      }, { status: 400 });
    }
    
    // Check if tickets already exist for this payment (idempotency)
    const existingTickets = await db.getTicketsByPaymentIntent(paymentId);
    if (existingTickets.length > 0) {
      console.log("Tickets already exist for this payment, returning existing tickets");
      return NextResponse.json({ 
        success: true, 
        ticketIds: existingTickets.map(t => t._id),
        message: "Tickets already exist for this payment"
      });
    }

    // Get the event to verify it exists
    const event = await db.getEvent(eventId);
    if (!event) {
      console.log("Event not found:", eventId);
      return NextResponse.json({ 
        error: "Event not found" 
      }, { status: 404 });
    }

    // Update waiting list entries to purchased status
    const waitingListEntries = await db.getWaitingListEntriesByUserAndEvent(userId, eventId);
    const validEntries = waitingListEntries.filter(entry => 
      entry.status === 'waiting' || entry.status === 'offered'
    );
    
    for (const entry of validEntries) {
      await db.updateWaitingListEntry(entry._id!, { status: 'purchased' });
    }
    
    console.log(`Updated ${validEntries.length} waiting list entries to purchased`);

    // Create tickets
    const ticketIds = [];
    const baseTime = Date.now();
    const ticketQuantity = Math.max(1, quantity || 1);
    
    for (let i = 0; i < ticketQuantity; i++) {
      const ticketId = await db.createTicket({
        eventId: new ObjectId(eventId),
        userId,
        purchasedAt: baseTime + i,
        status: 'valid',
        paymentIntentId: paymentId,
        amount: amount / ticketQuantity,
        passId: passId ? new ObjectId(passId) : undefined,
        selectedDate,
      });
      ticketIds.push(ticketId);
    }
    
    console.log(`Created ${ticketIds.length} tickets`);

    // Update pass sold quantity if passId is provided
    if (passId) {
      const pass = await db.getPass(passId);
      if (pass) {
        const newSoldQuantity = pass.soldQuantity + ticketQuantity;
        
        if (newSoldQuantity > pass.totalQuantity) {
          console.log(`Cannot sell ${ticketQuantity} tickets for pass ${passId} - only ${pass.totalQuantity - pass.soldQuantity} remaining`);
          return NextResponse.json({ 
            error: `Cannot sell ${ticketQuantity} tickets for pass ${passId} - only ${pass.totalQuantity - pass.soldQuantity} remaining` 
          }, { status: 400 });
        }
        
        await db.updatePass(passId, { soldQuantity: newSoldQuantity });
        console.log(`Updated pass ${passId} sold quantity to ${newSoldQuantity}`);
      } else {
        console.log(`Pass ${passId} not found`);
      }
    }

    // Get user details for email
    const user = await db.getUserByClerkId(userId);
    if (user && user.email) {
      // Create email log entry
      await db.createEmailLog({
        userId: user.userId,
        userEmail: user.email,
        ticketIds: ticketIds.map(id => new ObjectId(id)),
        eventId: new ObjectId(eventId),
        purchaseId: paymentId,
        sentAt: Date.now(),
        status: 'pending',
      });
      
      console.log(`Created email log for user ${user.email}`);
    }
    
    console.log("✅ MongoDB ticket creation successful:", ticketIds);
    
    return NextResponse.json({ 
      success: true, 
      ticketIds: ticketIds,
      message: "Tickets created successfully in MongoDB"
    });
  } catch (error) {
    console.error("❌ MongoDB ticket creation error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return NextResponse.json({ 
      error: "Failed to create ticket in MongoDB", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
