import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Create a payment session
export const createPaymentSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    eventId: v.id("events"),
    amount: v.number(),
    quantity: v.number(),
    passId: v.optional(v.id("passes")),
    selectedDate: v.optional(v.string()),
    couponCode: v.optional(v.string()),
    waitingListId: v.optional(v.id("waitingList")),
    paymentMethod: v.union(
      v.literal("razorpay"),
      v.literal("upi"),
      v.literal("phonepe")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    console.log("🔧 Creating payment session with args:", args);
    
    try {
      const now = Date.now();
      const expiresAt = now + (30 * 60 * 1000); // 30 minutes from now

      // Validate required fields
      if (!args.sessionId || !args.userId || !args.eventId || !args.amount || !args.paymentMethod) {
        console.error("❌ Missing required fields:", {
          sessionId: !!args.sessionId,
          userId: !!args.userId,
          eventId: !!args.eventId,
          amount: !!args.amount,
          paymentMethod: !!args.paymentMethod
        });
        throw new Error("Missing required fields for payment session creation");
      }

      // Check if session already exists
      const existingSession = await ctx.db
        .query("paymentSessions")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
        .first();

      if (existingSession) {
        console.log("🔄 Updating existing payment session:", existingSession._id);
        // Update existing session
        await ctx.db.patch(existingSession._id, {
          ...args,
          createdAt: now,
          expiresAt,
          status: "pending",
        });
        return existingSession._id;
      }

      console.log("🆕 Creating new payment session...");
      // Create new session
      const sessionId = await ctx.db.insert("paymentSessions", {
        ...args,
        status: "pending",
        createdAt: now,
        expiresAt,
      });

      console.log("✅ Payment session created successfully:", sessionId);
      return sessionId;
    } catch (error) {
      console.error("❌ Payment session creation failed:", error);
      throw error;
    }
  },
});

// Get payment session by session ID
export const getPaymentSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db
      .query("paymentSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (session.expiresAt < Date.now() && session.status === "pending") {
      // Return expired status without modifying the database in query context
      return { ...session, status: "expired" as const };
    }

    return session;
  },
});

// Update payment session status
export const updatePaymentSessionStatus = mutation({
  args: {
    sessionId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("expired")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { sessionId, status, metadata }) => {
    const session = await ctx.db
      .query("paymentSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();

    if (!session) {
      throw new ConvexError("Payment session not found");
    }

    const updateData: any = { status };
    if (metadata) {
      updateData.metadata = { ...session.metadata, ...metadata };
    }

    await ctx.db.patch(session._id, updateData);
    return session._id;
  },
});

// Get user's payment sessions
export const getUserPaymentSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const sessions = await ctx.db
      .query("paymentSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return sessions;
  },
});

// Get all payment sessions (for debugging)
export const getAllPaymentSessions = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("paymentSessions")
      .order("desc")
      .collect();

    return sessions;
  },
});

// Clean up expired sessions
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredSessions = await ctx.db
      .query("paymentSessions")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    for (const session of expiredSessions) {
      await ctx.db.patch(session._id, { status: "expired" });
    }

    console.log(`Cleaned up ${expiredSessions.length} expired payment sessions`);
    return expiredSessions.length;
  },
});

// Get payment session with event details
export const getPaymentSessionWithEvent = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db
      .query("paymentSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();

    if (!session) {
      return null;
    }

    // Get event details
    const event = await ctx.db.get(session.eventId);
    if (!event) {
      return null;
    }

    // Check if session has expired
    if (session.expiresAt < Date.now() && session.status === "pending") {
      // Return expired status without modifying the database in query context
      return { ...session, status: "expired" as const, event };
    }

    return { ...session, event };
  },
});
