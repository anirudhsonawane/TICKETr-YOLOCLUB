import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addQuickEvent = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a simple test event
    const eventId = await ctx.db.insert("events", {
      name: "Ghoomar Garba Night - Navratri Special",
      description: "Join us for an unforgettable night of traditional Garba and Dandiya with live music, delicious food, and amazing prizes! Experience the vibrant colors and energy of Navratri celebrations.",
      location: "YOLO Club Events Center, Mumbai",
      eventDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: Date.now() + (7 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000), // 4 hours duration
      eventType: "Cultural",
      price: 599,
      totalTickets: 500,
      userId: "admin_user_123",
      is_cancelled: false,
      organizerUpiId: "yoloclub@paytm"
    });

    // Create some passes for this event
    await ctx.db.insert("passes", {
      eventId: eventId,
      name: "Stag Female",
      description: "Standard entry to the event with basic amenities",
      price: 599,
      totalQuantity: 300,
      soldQuantity: 0,
      benefits: [
        "Full event access",
        "Discounted price",
        "Access to main venue",
        "All Day Early Bird"
      ],
      category: "Standard"
    });

    await ctx.db.insert("passes", {
      eventId: eventId,
      name: "Couple Pass",
      description: "Premium experience with exclusive perks and priority access",
      price: 799,
      totalQuantity: 1000,
      soldQuantity: 0,
      benefits: [
        "Event entry",
        "Discounted price",
        "Access to main venue",
        "Unlimited Fun"
      ],
      category: "Premium"
    });

    return { message: "Quick event added successfully", eventId };
  },
});
