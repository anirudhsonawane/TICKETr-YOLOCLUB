import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
      v.literal("phonepe"),
      v.literal("upi")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    console.log("🔧 Creating payment session with args:", args);
    console.log("🔧 Detailed args breakdown:", {
      sessionId: args.sessionId,
      userId: args.userId,
      eventId: args.eventId,
      amount: args.amount,
      quantity: args.quantity,
      passId: args.passId,
      selectedDate: args.selectedDate,
      couponCode: args.couponCode,
      waitingListId: args.waitingListId,
      paymentMethod: args.paymentMethod,
      metadata: args.metadata
    });
    
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

      // Validate that the event exists
      console.log("🔍 Checking if event exists:", args.eventId);
      const event = await ctx.db.get(args.eventId);
      if (!event) {
        console.error("❌ Event not found:", args.eventId);
        throw new Error(`Invalid event ID for payment session: ${args.eventId}`);
      }
      console.log("✅ Event validated:", event.name, "Event ID:", event._id);

      // Validate passId if provided
      if (args.passId) {
        console.log("🔍 Checking if pass exists:", args.passId);
        const pass = await ctx.db.get(args.passId);
        if (!pass) {
          console.error("❌ Pass not found:", args.passId);
          throw new Error(`Invalid pass ID for payment session: ${args.passId}`);
        }
        console.log("✅ Pass validated:", pass.name, "Pass ID:", pass._id);
      }

      // Check if session already exists
      const existingSession = await ctx.db
        .query("paymentSessions")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
        .first();

      if (existingSession) {
        console.log("🔄 Updating existing payment session:", existingSession._id);
        // Update existing session with only valid fields
        await ctx.db.patch(existingSession._id, {
          userId: args.userId,
          eventId: args.eventId,
          amount: Number(args.amount),
          quantity: Number(args.quantity),
          passId: args.passId || undefined,
          selectedDate: args.selectedDate || undefined,
          couponCode: args.couponCode || undefined,
          waitingListId: args.waitingListId || undefined,
          paymentMethod: args.paymentMethod,
          metadata: args.metadata || undefined,
          createdAt: now,
          expiresAt,
          status: "pending",
        });
        return existingSession._id;
      }

      console.log("🆕 Creating new payment session...");
      
      // Prepare the session data with proper types
      const sessionData = {
        sessionId: args.sessionId,
        userId: args.userId,
        eventId: args.eventId,
        amount: Number(args.amount),
        quantity: Number(args.quantity),
        passId: args.passId || undefined,
        selectedDate: args.selectedDate || undefined,
        couponCode: args.couponCode || undefined,
        waitingListId: args.waitingListId || undefined,
        paymentMethod: args.paymentMethod,
        metadata: args.metadata || undefined,
        status: "pending" as const,
        createdAt: now,
        expiresAt,
      };
      
      console.log("📋 Payment session data to insert:", sessionData);
      
      // Validate data types before insert
      if (typeof sessionData.amount !== 'number' || sessionData.amount <= 0) {
        throw new Error(`Invalid amount: ${sessionData.amount}`);
      }
      if (typeof sessionData.quantity !== 'number' || sessionData.quantity <= 0) {
        throw new Error(`Invalid quantity: ${sessionData.quantity}`);
      }
      
      console.log("💾 Attempting database insert with sessionData:", sessionData);
      
      try {
        const sessionId = await ctx.db.insert("paymentSessions", sessionData);
        console.log("✅ Database insert successful:", sessionId);
        return sessionId;
      } catch (dbError) {
        console.error("❌ Database insert failed:", dbError);
        console.error("❌ Database error details:", {
          message: dbError instanceof Error ? dbError.message : String(dbError),
          sessionData: sessionData
        });
        throw dbError;
      }
    } catch (error) {
      console.error("❌ Payment session creation failed:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        args: args
      });
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
