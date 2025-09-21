import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Create a new payment notification
export const create = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    amount: v.number(),
    quantity: v.number(),
    passId: v.optional(v.id("passes")),
    upiTransactionId: v.string(),
    payeeName: v.string(),
    payeeMobileNumber: v.string(),
    userInfo: v.optional(v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("paymentNotifications", {
      ...args,
      status: "pending",
      ticketCreated: false,
    });
    return notificationId;
  },
});

// Get all payment notifications for an event
export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const notifications = await ctx.db
      .query("paymentNotifications")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .order("desc")
      .collect();
    
    return notifications;
  },
});

// Get payment notifications by status
export const getByStatus = query({
  args: { 
    eventId: v.id("events"),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))
  },
  handler: async (ctx, { eventId, status }) => {
    const notifications = await ctx.db
      .query("paymentNotifications")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId).eq("status", status))
      .order("desc")
      .collect();
    
    return notifications;
  },
});

// Get all pending payment notifications (for admin dashboard)
export const getAllPending = query({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db
      .query("paymentNotifications")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
    
    return notifications;
  },
});

// Update payment notification status
export const updateStatus = mutation({
  args: {
    notificationId: v.id("paymentNotifications"),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected")),
    ticketCreated: v.optional(v.boolean()),
  },
  handler: async (ctx, { notificationId, status, ticketCreated }) => {
    const updates: any = { status };
    
    if (status === "verified") {
      updates.verifiedAt = Date.now();
    }
    
    if (ticketCreated !== undefined) {
      updates.ticketCreated = ticketCreated;
    }
    
    await ctx.db.patch(notificationId, updates);
    return notificationId;
  },
});

// Get payment notification by ID
export const getById = query({
  args: { notificationId: v.id("paymentNotifications") },
  handler: async (ctx, { notificationId }) => {
    return await ctx.db.get(notificationId);
  },
});

// Delete payment notification (for cleanup)
export const deleteNotification = mutation({
  args: { notificationId: v.id("paymentNotifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.delete(notificationId);
  },
});

// Get payment notifications for a specific user
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const notifications = await ctx.db
      .query("paymentNotifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    return notifications;
  },
});

// Get payment statistics for admin dashboard
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allNotifications = await ctx.db
      .query("paymentNotifications")
      .collect();
    
    const stats = {
      total: allNotifications.length,
      pending: allNotifications.filter(n => n.status === "pending").length,
      verified: allNotifications.filter(n => n.status === "verified").length,
      rejected: allNotifications.filter(n => n.status === "rejected").length,
      totalAmount: allNotifications
        .filter(n => n.status === "verified")
        .reduce((sum, n) => sum + n.amount, 0),
    };
    
    return stats;
  },
});
