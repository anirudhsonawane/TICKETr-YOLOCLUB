import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Submit payment verification request
export const submitPaymentVerification = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    mobileNumber: v.string(),
    uid: v.string(),
    amount: v.number(),
    quantity: v.number(),
    passId: v.optional(v.id("passes")),
    selectedDate: v.optional(v.string()),
    paymentScreenshotStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Check if verification already exists for this UID
    const existingVerification = await ctx.db
      .query("paymentVerifications")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .first();

    if (existingVerification) {
      throw new ConvexError("Payment verification already exists for this UID");
    }

    // Create payment verification record
    const verificationId = await ctx.db.insert("paymentVerifications", {
      ...args,
      status: "pending",
      submittedAt: Date.now(),
    });

    return verificationId;
  },
});

// Get payment verifications for an event (admin view)
export const getEventPaymentVerifications = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const verifications = await ctx.db
      .query("paymentVerifications")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get event details
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Get user details for each verification
    const verificationsWithUsers = await Promise.all(
      verifications.map(async (verification) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("userId", verification.userId))
          .first();

        // Get pass details if applicable
        let pass = null;
        if (verification.passId) {
          pass = await ctx.db.get(verification.passId);
        }

        return {
          ...verification,
          event,
          user,
          pass,
        };
      })
    );

    return verificationsWithUsers.sort((a, b) => b.submittedAt - a.submittedAt);
  },
});

// Get payment verification by ID
export const getPaymentVerification = query({
  args: {
    verificationId: v.id("paymentVerifications"),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db.get(args.verificationId);
    if (!verification) {
      throw new ConvexError("Payment verification not found");
    }

    const event = await ctx.db.get(verification.eventId);
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", verification.userId))
      .first();
    
    let pass = null;
    if (verification.passId) {
      pass = await ctx.db.get(verification.passId);
    }

    return {
      ...verification,
      event,
      user,
      pass,
    };
  },
});

// Approve payment verification and create tickets
export const approvePaymentVerification = mutation({
  args: {
    verificationId: v.id("paymentVerifications"),
    reviewedBy: v.string(),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db.get(args.verificationId);
    if (!verification) {
      throw new ConvexError("Payment verification not found");
    }

    if (verification.status !== "pending") {
      throw new ConvexError("Payment verification is not pending");
    }

    // Create tickets using the existing issueAfterPayment logic
    const ticketIds = [];
    const baseTime = Date.now();
    
    for (let i = 0; i < verification.quantity; i++) {
      const ticketId = await ctx.db.insert("tickets", {
        eventId: verification.eventId,
        userId: verification.userId,
        uid: verification.uid,
        purchasedAt: baseTime + i,
        status: "valid",
        paymentIntentId: `verification_${verification._id}`,
        amount: verification.amount,
        passId: verification.passId,
        selectedDate: verification.selectedDate,
      });
      ticketIds.push(ticketId);
    }

    // Update verification status
    await ctx.db.patch(args.verificationId, {
      status: "approved",
      reviewedAt: Date.now(),
      reviewedBy: args.reviewedBy,
      reviewNotes: args.reviewNotes,
      ticketIds,
    });

    // Mark waiting list entries as purchased
    const waitingListEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) => 
        q.eq("userId", verification.userId).eq("eventId", verification.eventId)
      )
      .filter((q) => q.or(
        q.eq(q.field("status"), "offered"),
        q.eq(q.field("status"), "waiting")
      ))
      .collect();
    
    for (const entry of waitingListEntries) {
      await ctx.db.patch(entry._id, {
        status: "purchased",
      });
    }

    return ticketIds;
  },
});

// Reject payment verification
export const rejectPaymentVerification = mutation({
  args: {
    verificationId: v.id("paymentVerifications"),
    reviewedBy: v.string(),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db.get(args.verificationId);
    if (!verification) {
      throw new ConvexError("Payment verification not found");
    }

    if (verification.status !== "pending") {
      throw new ConvexError("Payment verification is not pending");
    }

    await ctx.db.patch(args.verificationId, {
      status: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: args.reviewedBy,
      reviewNotes: args.reviewNotes,
    });

    return { success: true };
  },
});

// Get user's payment verification history
export const getUserPaymentVerifications = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const verifications = await ctx.db
      .query("paymentVerifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const verificationsWithEvents = await Promise.all(
      verifications.map(async (verification) => {
        const event = await ctx.db.get(verification.eventId);
        let pass = null;
        if (verification.passId) {
          pass = await ctx.db.get(verification.passId);
        }
        return {
          ...verification,
          event,
          pass,
        };
      })
    );

    return verificationsWithEvents.sort((a, b) => b.submittedAt - a.submittedAt);
  },
});

// Get pending payment verifications count (for admin notifications)
export const getPendingVerificationsCount = query({
  args: {},
  handler: async (ctx) => {
    const pendingVerifications = await ctx.db
      .query("paymentVerifications")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return pendingVerifications.length;
  },
});
