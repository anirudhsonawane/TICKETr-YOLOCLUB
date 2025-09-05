import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createDefaultPasses = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    // If exist passes
    const existingPasses = await ctx.db
      .query("passes")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    if (existingPasses.length > 0) {
      return { message: "Passes already exist for this event" };
    }

    // Passes Type Default
    const passes = [
      {
        eventId,
        name: "General Admission",
        description: "Standard entry to the event with basic amenities",
        price: 50,
        totalQuantity: 100,
        soldQuantity: 0,
        benefits: [
          "Event entry",
          "Access to main venue",
          "Standard seating",
          "Basic refreshments"
        ]
      },
      {
        eventId,
        name: "VIP Pass",
        description: "Premium experience with exclusive perks and priority access",
        price: 150,
        totalQuantity: 50,
        soldQuantity: 0,
        benefits: [
          "Priority entry",
          "VIP seating area",
          "Complimentary drinks",
          "Meet & greet opportunity",
          "Exclusive merchandise",
          "Premium parking"
        ]
      },
      {
        eventId,
        name: "Early Bird",
        description: "Limited time offer with discounted pricing",
        price: 35,
        totalQuantity: 30,
        soldQuantity: 0,
        benefits: [
          "Event entry",
          "Discounted price",
          "Access to main venue",
          "Standard seating"
        ]
      }
    ];

    const createdPasses = [];
    for (const pass of passes) {
      const passId = await ctx.db.insert("passes", pass);
      createdPasses.push(passId);
    }

    return { 
      message: "Default passes created successfully",
      passIds: createdPasses
    };
  },
});