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
    organizerUpiId: v.optional(v.string()), // NEW: organizer's UPI ID for payments
  }),

  passes: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    totalQuantity: v.number(),
    soldQuantity: v.number(),
    benefits: v.array(v.string()),
    category: v.optional(v.string()), // e.g., "Seasonal Pass", "General", "VIP"
  }).index("by_event", ["eventId"]),

  tickets: defineTable({
    eventId: v.id('events'),
    userId: v.string(),
    uid: v.optional(v.string()), // Made uid optional to fix schema validation
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

    
    ticketType: v.optional(v.string()), // e.g. "VIP", "Standard"
    ticketTier: v.optional(v.string()), // e.g. "Gold", "Silver"
    scanLimit: v.optional(v.number()), // how many times ticket can be scanned
    selectedDate: v.optional(v.string()), // selected date for Seasonal Pass
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_payment_intent", ["paymentIntentId"]),

  emailLogs: defineTable({
    userId: v.string(),
    userEmail: v.string(),
    ticketIds: v.array(v.id("tickets")),
    eventId: v.id("events"),
    purchaseId: v.string(), // Correlate with payment intent or a unique purchase ID
    sentAt: v.number(),
    status: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("pending")
    ),
    errorMessage: v.optional(v.string()),
  }).index("by_userId", ["userId"])
    .index("by_userEmail", ["userEmail"])
    .index("by_ticketId", ["ticketIds"])
    .index("by_eventId", ["eventId"]),

  paymentSessions: defineTable({
    sessionId: v.string(), // Unique session identifier (orderId or paymentId)
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
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("expired")
    ),
    createdAt: v.number(),
    expiresAt: v.number(),
    metadata: v.optional(v.any()), // Additional payment-specific data
  }).index("by_sessionId", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_status", ["status"])
    .index("by_expiresAt", ["expiresAt"]),

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
    discountAmount: v.optional(v.number()), // NEW: flat discount amount in rupees
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("flat"))), // NEW: type of discount
    isActive: v.optional(v.boolean()),
    validFrom: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    currentUses: v.optional(v.number()),
    description: v.optional(v.string()),
    usedByUsers: v.optional(v.array(v.string())), // Keep for backward compatibility
    usedByUserEvent: v.optional(v.array(v.object({
      userId: v.string(),
      eventId: v.id("events"),
      usedAt: v.number()
    }))), // New field for per-event usage tracking
  }).index("by_code", ["code"]),

  upi_payments: defineTable({
    uid: v.string(),
    eventId: v.id("events"),
    userId: v.string(),
    amount: v.number(),
    timestamp: v.number(),
  }).index("by_uid", ["uid"]),

  paymentVerifications: defineTable({
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
    paymentScreenshotUrl: v.optional(v.string()),
    paymentScreenshotStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),
    ticketIds: v.optional(v.array(v.id("tickets"))), // Created after approval
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_uid", ["uid"]),
});