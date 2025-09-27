import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { WAITING_LIST_STATUS, TICKET_STATUS } from "./constants";
import { internal } from "./_generated/api";

// Authorized admin emails for ticket scanning
const AUTHORIZED_ADMIN_EMAILS = [
  'anirudhsonawane111@gmail.com',
  'gauravbhagwat999@gmail.com',
  'testmailsforweb@gmail.com',
  'helloworldforweb@gmail.com',
  't37823467@gmail.com',
];

// Helper function to check if email is authorized admin (simplified)
function isAuthorizedAdmin(email: string): boolean {
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase());
}

export const getUserTickets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.or(
        q.eq(q.field("status"), TICKET_STATUS.VALID),
        q.eq(q.field("status"), TICKET_STATUS.USED)
      ))
      .collect();

    // Get event details offf each ticket e
    const ticketsWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return {
          ...ticket,
          eventName: event?.name || "Unknown Event",
          eventDate: event?.eventDate || 0,
          eventLocation: event?.location || "Unknown Location",
          price: ticket.amount,
        };
      })
    );

    return ticketsWithEvents.sort((a, b) => b.eventDate - a.eventDate);
  },
});

export const getUserTicketForEvent = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    // Return Ticket for scanning status to update
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.or(
        q.eq(q.field("status"), TICKET_STATUS.VALID),
        q.eq(q.field("status"), TICKET_STATUS.USED)
      ))
      .first();

    return ticket;
  },
});

export const getById = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    return await ctx.db.get(ticketId);
  },
});

export const getUserTicketsForEvent = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.or(
        q.eq(q.field("status"), TICKET_STATUS.VALID),
        q.eq(q.field("status"), TICKET_STATUS.USED)
      ))
      .collect();

    return tickets;
  },
});

export const scanTicket = mutation({
  args: { 
    ticketId: v.id("tickets"),
    scannerId: v.string(),
    scannerEmail: v.optional(v.string())
  },
  handler: async (ctx, { ticketId, scannerId, scannerEmail }) => {
    try {
      const ticket = await ctx.db.get(ticketId);
      if (!ticket) throw new Error("Ticket not found");
      
      // Get the event to check ownership
      const event = await ctx.db.get(ticket.eventId);
      if (!event) throw new Error("Event not found");
      
      // Check if user is event owner OR authorized admin
      const isEventOwner = event.userId === scannerId;
      const isAuthorizedAdmin = scannerEmail && AUTHORIZED_ADMIN_EMAILS.includes(scannerEmail.toLowerCase());
      
      if (!isEventOwner && !isAuthorizedAdmin) {
        throw new Error("Access denied");
      }
      
      if (ticket.status === TICKET_STATUS.USED) {
        throw new Error("Ticket already scanned");
      }
      
      await ctx.db.patch(ticketId, {
        status: TICKET_STATUS.USED,
        scannedAt: Date.now(),
      });
      
      return { 
        success: true, 
        message: "Ticket scanned successfully"
      };
      
    } catch (error) {
      console.error("scanTicket error:", error);
      throw error;
    }
  },
});

export const getUserTicketCount = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.eq(q.field("status"), TICKET_STATUS.VALID))
      .collect();

    return tickets.length;
  },
});

// Get tickets for event owner or authorized admin to scan - BULLETPROOF VERSION
export const getEventTickets = query({
  args: { 
    eventId: v.id("events"),
    ownerId: v.string(),
    userEmail: v.optional(v.string())
  },
  handler: async (ctx, { eventId, ownerId, userEmail }) => {
    try {
      // Verify event exists
      const event = await ctx.db.get(eventId);
      if (!event) {
        return [];
      }
      
      // Simple authorization check
      const isEventOwner = event.userId === ownerId;
      const isAuthorizedAdmin = userEmail && AUTHORIZED_ADMIN_EMAILS.includes(userEmail.toLowerCase());
      
      if (!isEventOwner && !isAuthorizedAdmin) {
        return [];
      }
      
      // Get tickets for the event - simplified query
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();
      
      // Return tickets with basic user info - no complex queries
      return tickets.map(ticket => ({
        ...ticket,
        user: { name: "User", email: "user@example.com" }
      }));
      
    } catch (error) {
      console.error("getEventTickets error:", error);
      return [];
    }
  },
});

// Issues tickets after successful payment confirmation (supports multiple tickets)
export const issueAfterPayment = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    paymentIntentId: v.string(),
    amount: v.number(),
    quantity: v.optional(v.number()),
    passId: v.optional(v.id("passes")),
    selectedDate: v.optional(v.string()),
  },
  handler: async (ctx, { eventId, userId, paymentIntentId, amount, quantity = 1, passId, selectedDate }) => {
    console.log("🎫 Starting ticket creation process:", { eventId, userId, paymentIntentId, amount, quantity, passId, selectedDate });
    
    // Validate event exists
    const event = await ctx.db.get(eventId);
    if (!event) {
      console.error("❌ Event not found:", eventId);
      throw new ConvexError("Event not found");
    }
    console.log("✅ Event found:", event.name);
    
    // Validate user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
    if (!user) {
      console.error("❌ User not found:", userId);
      throw new ConvexError("User not found");
    }
    console.log("✅ User found:", user.name || user.email);

    // Idempotency: if tickets already exist for this payment, return existing
    const existingByPayment = await ctx.db
      .query("tickets")
      .withIndex("by_payment_intent", (q) => q.eq("paymentIntentId", paymentIntentId))
      .collect();
    if (existingByPayment.length > 0) {
      console.log("✅ Tickets already exist for this payment:", existingByPayment.map(t => t._id));
      return existingByPayment.map(t => t._id);
    }
    console.log("🔄 No existing tickets found, proceeding with creation...");

    // Mark ALL user's waiting list entries as purchased
    const waitingListEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) => q.eq("userId", userId).eq("eventId", eventId))
      .filter((q) => q.or(
        q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED),
        q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING)
      ))
      .collect();
    
    for (const entry of waitingListEntries) {
      await ctx.db.patch(entry._id, {
        status: WAITING_LIST_STATUS.PURCHASED,
      });
    }
    
    if (waitingListEntries.length > 0) {
      // Process queue to offer ticket to next person
      await ctx.runMutation(internal.waitingList.processQueue, { eventId });
    }

    // Create tickets based on quantity (ensure exact quantity)
    const ticketIds = [];
    const baseTime = Date.now();
    const ticketQuantity = Math.max(1, quantity || 1); // Ensure at least 1 ticket
    
    console.log(`🎫 Creating ${ticketQuantity} ticket(s) for user ${userId}...`);
    
    for (let i = 0; i < ticketQuantity; i++) {
      try {
        // Ensure amount is a valid number
        const ticketAmount = Number(amount) / ticketQuantity;
        if (isNaN(ticketAmount) || ticketAmount <= 0) {
          throw new Error(`Invalid ticket amount: ${ticketAmount} (original amount: ${amount})`);
        }
        
        console.log(`🎫 Creating ticket ${i + 1}/${ticketQuantity} with amount: ${ticketAmount}, passId: ${passId}`);
        
        const ticketData = {
          eventId,
          userId,
          purchasedAt: baseTime + i,
          status: TICKET_STATUS.VALID,
          paymentIntentId,
          amount: ticketAmount,
          passId,
          selectedDate,
        };
        
        console.log(`🎫 Ticket data for ${i + 1}/${ticketQuantity}:`, ticketData);
        
        const ticketId = await ctx.db.insert("tickets", ticketData);
        ticketIds.push(ticketId);
        console.log(`✅ Created ticket ${i + 1}/${ticketQuantity}:`, ticketId);
      } catch (error) {
        console.error(`❌ Failed to create ticket ${i + 1}/${ticketQuantity}:`, error);
        console.error(`❌ Ticket data:`, { eventId, userId, amount, ticketQuantity, passId, selectedDate });
        throw new ConvexError(`Failed to create ticket ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log("🎉 All tickets created successfully:", ticketIds);
    
    // After successfully issuing tickets, send an email to the user
    if (user && user.email) {
      const eventDetails = await ctx.db.get(eventId);
      const subject = `Your Ticketr purchase for ${eventDetails?.name || "an event"}!`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">🎫 Your Tickets Are Ready!</h2>
          
          <p>Dear ${user.name || "Valued Customer"},</p>
          
          <p>Thank you for your purchase! We're excited to have you join us for <strong>${eventDetails?.name || "the event"}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">📋 Your Ticket Details</h3>
            <p><strong>Event:</strong> ${eventDetails?.name || "Event"}</p>
            <p><strong>Date:</strong> ${eventDetails?.eventDate ? new Date(eventDetails.eventDate).toLocaleDateString() : "TBD"}</p>
            <p><strong>Location:</strong> ${eventDetails?.location || "TBD"}</p>
            <p><strong>Ticket IDs:</strong> ${ticketIds.join(", ")}</p>
            <p><strong>Quantity:</strong> ${ticketQuantity}</p>
            <p><strong>Total Amount:</strong> ₹${amount}</p>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">📱 Important Instructions</h4>
            <ul>
              <li>Please bring a valid ID and this email confirmation</li>
              <li>Arrive 15 minutes before the event starts</li>
              <li>Keep your ticket IDs safe - you'll need them for entry</li>
            </ul>
          </div>
          
          <p>We look forward to seeing you there!</p>
          
          <p>Best regards,<br>
          <strong>The Ticketr Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `;

      try {
        console.log("📧 Scheduling ticket email to:", user.email);
        await ctx.scheduler.runAfter(0, internal.actions.email.sendTicketEmailAction, {
          to: user.email,
          subject,
          htmlContent,
        });
        console.log("✅ Ticket email scheduled successfully");
      } catch (emailError) {
        console.error("❌ Failed to schedule ticket email:", emailError);
        
        // Try fallback simple email method
        try {
          console.log("🔄 Trying fallback email method...");
          await ctx.scheduler.runAfter(0, internal.actions.simpleEmail.sendSimpleEmailAction, {
            to: user.email,
            subject,
            message: `Ticket Details:\nEvent: ${eventDetails?.name || "Event"}\nTicket IDs: ${ticketIds.join(", ")}\nQuantity: ${ticketQuantity}\nAmount: ₹${amount}`,
          });
          console.log("✅ Fallback email scheduled successfully");
        } catch (fallbackError) {
          console.error("❌ Fallback email also failed:", fallbackError);
        }
        
        // Don't throw error - ticket creation should still succeed even if email fails
      }
    }

    // Update pass sold quantity if passId is provided
    if (passId) {
      const pass = await ctx.db.get(passId);
      if (pass) {
        // Atomic update to ensure accurate sold quantity tracking
const newSoldQuantity = pass.soldQuantity + ticketQuantity;

// Verify we don't oversell the pass
if (newSoldQuantity > pass.totalQuantity) {
throw new ConvexError(`Cannot sell ${ticketQuantity} tickets for pass ${passId} - only ${pass.totalQuantity - pass.soldQuantity} remaining`);
}
        console.log(`Updating pass ${passId}: ${pass.soldQuantity} + ${ticketQuantity} = ${newSoldQuantity}`);
        // Update pass and ensure immediate consistency
await ctx.db.patch(passId, {
  soldQuantity: newSoldQuantity,
});

// Refresh event availability data
await ctx.scheduler.runAfter(0, internal.waitingList.processQueue, {
  eventId
});
        console.log(`Pass ${passId} updated successfully`);
      } else {
        console.log(`Pass ${passId} not found`);
      }
    } else {
      console.log('No passId provided, skipping pass update');
    }

    return ticketIds;
  },
});
export const getTicketWithDetails = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) return null;
    
    const event = await ctx.db.get(ticket.eventId);
    return {
      ...ticket,
      event
    };
  },
});
export const getTicketStatus = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) return null;
    
    // Get all user tickets for this event and passId
    const userTicketsQuery = ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) => q.eq("userId", ticket.userId).eq("eventId", ticket.eventId))
      .filter((q) => q.and(
        q.eq(q.field("passId"), ticket.passId),
        q.or(
          q.eq(q.field("status"), TICKET_STATUS.VALID),
          q.eq(q.field("status"), TICKET_STATUS.USED)
        )
      ));
    const userTickets = await userTicketsQuery.collect();
    
    const scannedCount = userTickets.filter(t => t.status === TICKET_STATUS.USED).length;
    
    return {
      status: ticket.status,
      scannedAt: ticket.scannedAt,
      scannedCount,
      totalCount: userTickets.length,
      isScanned: ticket.status === TICKET_STATUS.USED
    };
  },
});

// Debug query to check recent tickets and their passId values
export const getRecentTickets = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const tickets = await ctx.db
      .query("tickets")
      .order("desc")
      .take(limit);
    
    const ticketsWithPassInfo = await Promise.all(
      tickets.map(async (ticket) => {
        let pass = null;
        if (ticket.passId) {
          pass = await ctx.db.get(ticket.passId);
        }
        return {
          ...ticket,
          passInfo: pass ? { name: pass.name, id: pass._id } : null
        };
      })
    );
    
    return ticketsWithPassInfo;
  },
});

// Get tickets by payment intent ID
export const getTicketsByPaymentIntent = query({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, { paymentIntentId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_payment_intent", (q) => q.eq("paymentIntentId", paymentIntentId))
      .collect();
    
    return tickets;
  },
});