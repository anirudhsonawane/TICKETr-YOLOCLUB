import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { TICKET_STATUS, WAITING_LIST_STATUS, DURATIONS } from "./constants";
import { api, internal } from "./_generated/api";


export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("events")
            .filter((q) => q.or(
                q.eq(q.field("is_cancelled"), undefined),
                q.eq(q.field("is_cancelled"), false)
            ))
            .collect();
    },
});        


export const getById = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
        return await ctx.db.get(eventId);
    },
});

export const getByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("events")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
    },
});

export const getEventAvailability = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
        const events = await ctx.db.get(eventId);
        if (!events) throw new Error("Event not found");

        //Count total purchased tickets 
        const purchasedCount = await ctx.db
            .query("tickets")
            .withIndex("by_event", (q) => q.eq("eventId", eventId))
            .collect()
            .then(
                (tickets) => 
                    tickets.filter(
                        (t) => 
                            t.status === TICKET_STATUS.VALID ||
                            t.status === TICKET_STATUS.USED
                    ).length
            );

            //Count current valid offers (excluding purchased)
            const now = Date.now();
            
            // First, clean up expired offers
            const expiredOffers = await ctx.db
              .query("waitingList")
              .withIndex("by_event_status", (q) =>
                q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
              )
              .collect()
              .then((entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) <= now));
            
            // Mark expired offers as expired
            const expireExpiredOffers = mutation({
            args: { eventId: v.id("events") },
            handler: async (ctx, { eventId }) => {
            const now = Date.now();

            const expiredOffers = await ctx.db
          .query("waitingList")
         .withIndex("by_event_status", (q) =>
         q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
         )
         .collect()
         .then((entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) <= now));

        for (const offer of expiredOffers) {
        await ctx.db.patch(offer._id, {
        status: WAITING_LIST_STATUS.EXPIRED,
      });
    }

    return { expiredCount: expiredOffers.length };
  },
});

            
            const activeOffers = await ctx.db
            .query("waitingList")
            .withIndex("by_event_status", (q) =>
                q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
            )
            .collect()
            .then(
                (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
            );

            const totalReserved  = purchasedCount + activeOffers;

            return {
                isSoldOut: totalReserved >= events.totalTickets,
                totalTickets: events.totalTickets,
                purchasedCount,
                activeOffers,
                remainingTickets: Math.max(0, events.totalTickets - totalReserved),
            };
    },
});    

// Helper function to check ticket availability for an event
export const checkAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

     // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

    return {
      available: availableSpots > 0,
      availableSpots,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
    };
  },
});

// Join waiting list for an event
export const joinWaitingList = mutation({
  // Function takes an event ID and user ID as arguments
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    // Check if user already has an active offer or is waiting
    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) => q.eq("userId", userId).eq("eventId", eventId))
      .filter((q) => q.or(
        q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING),
        q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED)
      ))
      .first();
    
    if (existingEntry) {
      return {
        success: true,
        status: existingEntry.status,
        message: existingEntry.status === WAITING_LIST_STATUS.OFFERED 
          ? "You already have an active ticket offer"
          : "You are already in the waiting list",
      };
    }

    // Verify the event exists
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Check if there are any available tickets right now
    const availability: { available: boolean } = await ctx.runQuery(api.events.checkAvailability, { eventId });
    const available = availability.available;

    const now = Date.now();

    if (available) {
      // If tickets are available, create an offer entry
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.OFFERED, // Mark as offered
        offerExpiresAt: now + DURATIONS.TICKET_OFFER, // Set expiration time
      });

      // Schedule a job to expire this offer after the offer duration
      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        {
          waitingListId,
          eventId,
        }
      );
    } else {
      // If no tickets available, add to waiting list
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING, // Mark as waiting
      });
    }

    // Return appropriate status message
    return {
      success: true,
      status: available
        ? WAITING_LIST_STATUS.OFFERED // If available, status is offered
        : WAITING_LIST_STATUS.WAITING, // If not available, status is waiting
      message: available
        ? `Ticket offered - you have ${DURATIONS.TICKET_OFFER / (60 * 1000)} minutes to purchase`
        : "Added to waiting list - you'll be notified when a ticket becomes available",
    };
  },
});

// Create a new event
export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      location: args.location,
      eventDate: args.eventDate,
      price: args.price,
      totalTickets: args.totalTickets,
      userId: args.userId,
      is_cancelled: false,
    });
    return eventId;
  },
});

// Update an existing event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updateData } = args;
    await ctx.db.patch(eventId, updateData);
  },
});

// Cancel an event
export const cancelEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    await ctx.db.patch(eventId, {
      is_cancelled: true,
    });
  },
});