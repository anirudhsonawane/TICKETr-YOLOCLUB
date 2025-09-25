import { mutation, query } from "./_generated/server";

export const addSingleEvent = mutation({
  args: {},
  handler: async (ctx) => {
    const eventId = await ctx.db.insert("events", {
      name: "Ghoomar Garba Night - Navratri Special",
      description: "Join us for an unforgettable night of traditional Garba and Dandiya with live music, delicious food, and amazing prizes! Experience the vibrant colors and energy of Navratri celebrations.",
      location: "YOLO Club Events Center, Mumbai",
      eventDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
      endDate: Date.now() + (7 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000),
      eventType: "Cultural",
      price: 599,
      totalTickets: 500,
      userId: "admin_user_123",
      is_cancelled: false,
      organizerUpiId: "yoloclub@paytm"
    });

    return { message: "Event added", eventId };
  },
});

export const getAllEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});
