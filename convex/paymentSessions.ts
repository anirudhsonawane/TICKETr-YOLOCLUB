import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Payment session type
type PaymentSession = {
  eventId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  createdAt: number;
  paymentGatewayId?: string;
};

// -------------------------
// CREATE PAYMENT SESSION
// -------------------------
export const createPaymentSession = mutation({
  args: {
    eventId: v.string(),
    userId: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, { eventId, userId, amount, currency }) => {
    try {
      // Validate inputs
      if (!eventId || !userId) throw new Error("Invalid event or user ID");
      if (amount <= 0) throw new Error("Amount must be greater than 0");

      // Create new payment session
      const newSession: PaymentSession = {
        eventId,
        userId,
        amount,
        currency,
        status: "pending",
        createdAt: Date.now(),
        paymentGatewayId: undefined,
      };

      const sessionId = await ctx.db.insert("paymentsessions", newSession);
      return { success: true, session: { sessionId, ...newSession } };
    } catch (err) {
      console.error("Payment session creation failed:", err);
      return { success: false, error: "Failed to create payment session" };
    }
  },
});

// -------------------------
// UPDATE PAYMENT SESSION
// -------------------------
export const updatePaymentSession = mutation({
  args: {
    sessionId: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    paymentGatewayId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, status, paymentGatewayId }) => {
    try {
      const session = await ctx.db.get("paymentsessions", sessionId);
      if (!session) throw new Error("Payment session not found");

      await ctx.db.patch("paymentsessions", sessionId, {
        status,
        paymentGatewayId,
      });

      return { success: true, session: { sessionId, ...session, status, paymentGatewayId } };
    } catch (err) {
      console.error("Failed to update payment session:", err);
      return { success: false, error: "Failed to update payment session" };
    }
  },
});

// -------------------------
// GET PAYMENT SESSION (QUERY)
// -------------------------
export const getPaymentSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    try {
      const session = await ctx.db.get("paymentsessions", sessionId);
      if (!session) return { success: false, error: "Payment session not found" };

      return { success: true, session: { sessionId, ...session } };
    } catch (err) {
      console.error("Failed to fetch payment session:", err);
      return { success: false, error: "Failed to fetch payment session" };
    }
  },
});
