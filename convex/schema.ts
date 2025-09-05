import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    endDate: v.optional(v.number()), // NEW: end date of the event
    eventType: v.optional(v.string()), // NEW: type (Concert, Workshop, etc.)
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
    is_cancelled: v.optional(v.boolean()),
    imageStorageId: v.optional(v.id("_storage")),
  }),

  passes: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    totalQuantity: v.number(),
    soldQuantity: v.number(),
    benefits: v.array(v.string()),
  }).index("by_event", ["eventId"]),

  tickets: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    purchasedAt: v.number(),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded")
    ),
    paymentIntentId: v.string(),
    amount: v.number(),
    scannedAt: v.optional(v.number()),
    passId: v.optional(v.id("passes")),

    // ✅ NEW fields
    ticketType: v.optional(v.string()), // e.g. "VIP", "Standard"
    ticketTier: v.optional(v.string()), // e.g. "Gold", "Silver"
    scanLimit: v.optional(v.number()), // how many times ticket can be scanned
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_payment_intent", ["paymentIntentId"]),

  waitingList: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("offered"),
      v.literal("purchased"),
      v.literal("expired")
    ),
    offerExpiresAt: v.optional(v.number()),
    passId: v.optional(v.id("passes")),
  })
    .index("by_user_event", ["userId", "eventId"])
    .index("by_event_status", ["eventId", "status"]),

  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    stripeConnectId: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  coupons: defineTable({
    userId: v.optional(v.string()),
    code: v.string(),
    // Relax required fields to allow legacy documents to load; we'll default in code
    discountPercentage: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    validFrom: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    currentUses: v.optional(v.number()),
    description: v.optional(v.string()),
    usedByUsers: v.optional(v.array(v.string())),
  }).index("by_code", ["code"]),
});
