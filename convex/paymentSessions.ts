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
      v.literal("upi")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + (30 * 60 * 1000); // 30 minutes from now

    // Check if session already exists
    const existingSession = await ctx.db
      .query("paymentSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existingSession) {
      // Update existing session
      await ctx.db.patch(existingSession._id, {
        ...args,
        createdAt: now,
        expiresAt,
        status: "pending",
      });
      return existingSession._id;
    }

    // Create new session
    const sessionId = await ctx.db.insert("paymentSessions", {
      ...args,
      status: "pending",
      createdAt: now,
      expiresAt,
    });

    return sessionId;
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
      // Mark as expired
      await ctx.db.patch(session._id, { status: "expired" });
      return { ...session, status: "expired" };
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
      await ctx.db.patch(session._id, { status: "expired" });
      return { ...session, status: "expired", event };
    }

    return { ...session, event };
  },
});
