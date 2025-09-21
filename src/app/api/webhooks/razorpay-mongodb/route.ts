import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/database";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  console.log("=== RAZORPAY WEBHOOK (MONGODB) RECEIVED ===");
  
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    
    console.log("Signature present:", !!signature);
    console.log("Body length:", body.length);
    
    if (!signature) {
      console.log("❌ No signature provided");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log("❌ Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Event type:", event.event);
    
    if (event.event === "payment.captured") {
      console.log("💰 Processing payment.captured event");
      const { notes } = event.payload.payment.entity;
      console.log("Payment notes received:", notes);
      
      // Validate required fields
      if (!notes.eventId || !notes.userId) {
        console.error("❌ Missing required fields in payment notes:", { eventId: notes.eventId, userId: notes.userId });
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      
      try {
        console.log("Creating tickets with MongoDB...");
        
        // Check if tickets already exist for this payment (idempotency)
        const existingTickets = await db.getTicketsByPaymentIntent(event.payload.payment.entity.id);
        if (existingTickets.length > 0) {
          console.log("Tickets already exist for this payment, returning existing tickets");
          return NextResponse.json({ received: true });
        }

        // Get the event to verify it exists
        const eventDoc = await db.getEvent(notes.eventId);
        if (!eventDoc) {
          console.log("Event not found:", notes.eventId);
          return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Update waiting list entries to purchased status
        const waitingListEntries = await db.getWaitingListEntriesByUserAndEvent(notes.userId, notes.eventId);
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
        const ticketQuantity = Math.max(1, notes.quantity ? parseInt(notes.quantity) : 1);
        
        for (let i = 0; i < ticketQuantity; i++) {
          const ticketId = await db.createTicket({
            eventId: new ObjectId(notes.eventId),
            userId: notes.userId,
            purchasedAt: baseTime + i,
            status: 'valid',
            paymentIntentId: event.payload.payment.entity.id,
            amount: event.payload.payment.entity.amount / ticketQuantity,
            passId: notes.passId ? new ObjectId(notes.passId) : undefined,
            selectedDate: notes.selectedDate || undefined,
          });
          ticketIds.push(ticketId);
        }
        
        console.log(`Created ${ticketIds.length} tickets`);

        // Update pass sold quantity if passId is provided
        if (notes.passId) {
          const pass = await db.getPass(notes.passId);
          if (pass) {
            const newSoldQuantity = pass.soldQuantity + ticketQuantity;
            
            if (newSoldQuantity > pass.totalQuantity) {
              console.log(`Cannot sell ${ticketQuantity} tickets for pass ${notes.passId} - only ${pass.totalQuantity - pass.soldQuantity} remaining`);
              return NextResponse.json({ error: "Pass oversold" }, { status: 400 });
            }
            
            await db.updatePass(notes.passId, { soldQuantity: newSoldQuantity });
            console.log(`Updated pass ${notes.passId} sold quantity to ${newSoldQuantity}`);
          } else {
            console.log(`Pass ${notes.passId} not found`);
          }
        }

        // Get user details for email
        const user = await db.getUserByClerkId(notes.userId);
        if (user && user.email) {
          // Create email log entry
          await db.createEmailLog({
            userId: user.userId,
            userEmail: user.email,
            ticketIds: ticketIds.map(id => new ObjectId(id)),
            eventId: new ObjectId(notes.eventId),
            purchaseId: event.payload.payment.entity.id,
            sentAt: Date.now(),
            status: 'pending',
          });
          
          console.log(`Created email log for user ${user.email}`);
        }
        
        console.log("✅ MongoDB ticket creation successful, result:", ticketIds);
      } catch (mutationError) {
        console.error("❌ Error creating tickets in MongoDB:", mutationError);
        console.error("Mutation error details:", {
          message: mutationError instanceof Error ? mutationError.message : String(mutationError),
          stack: mutationError instanceof Error ? mutationError.stack : undefined
        });
        return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
