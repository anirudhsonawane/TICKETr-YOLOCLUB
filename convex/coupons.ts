import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new coupon
export const createCoupon = mutation({
  args: {
    code: v.string(),
    discountPercentage: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("flat"))),
    isActive: v.boolean(),
    validFrom: v.number(),
    validUntil: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    description: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if coupon with this code already exists
    const existingCoupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existingCoupon) {
      throw new ConvexError("Coupon with this code already exists");
    }

    // Set default discount type if not provided
    const discountType = args.discountType || (args.discountPercentage ? "percentage" : "flat");

    // Validate discount based on type
    if (discountType === "percentage") {
      if (!args.discountPercentage || args.discountPercentage < 0 || args.discountPercentage > 100) {
        throw new ConvexError("Discount percentage must be between 0 and 100");
      }
    } else if (discountType === "flat") {
      if (!args.discountAmount || args.discountAmount < 0) {
        throw new ConvexError("Discount amount must be a positive number");
      }
    }

    return await ctx.db.insert("coupons", {
      ...args,
      discountType,
      currentUses: 0,
      usedByUsers: [],
      usedByUserEvent: [],
    });
  },
});

// Get all coupons
export const getAllCoupons = query({
  handler: async (ctx) => {
    return await ctx.db.query("coupons").collect();
  },
});

// Get a coupon by code
export const getCouponByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
  },
});

// Validate a coupon code
export const validateCoupon = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!coupon) return { valid: false, message: "Coupon not found" };

    // Safely default legacy fields
    const isActive = coupon.isActive ?? true;
    const validFrom = coupon.validFrom ?? 0;
    const validUntil = coupon.validUntil ?? undefined;
    const maxUses = coupon.maxUses ?? undefined;
    const currentUses = coupon.currentUses ?? 0;

    if (!isActive) return { valid: false, message: "Coupon is not active" };

    const now = Date.now();
    if (now < validFrom) return { valid: false, message: "Coupon is not yet valid" };
    if (validUntil && now > validUntil) return { valid: false, message: "Coupon has expired" };
    if (maxUses && currentUses >= maxUses) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage ?? 0,
        discountAmount: coupon.discountAmount ?? 0,
        discountType: coupon.discountType ?? "percentage",
        description: coupon.description,
      },
    };
  },
});

// Apply a coupon to calculate discounted amount
export const calculateDiscountedAmount = query({
  args: { code: v.string(), amount: v.number(), userId: v.optional(v.string()), eventId: v.optional(v.id("events")) },
  handler: async (ctx, { code, amount, userId, eventId }) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!coupon) return { success: false, message: "Coupon not found", originalAmount: amount };

    // Safely default legacy fields
    const isActive = coupon.isActive ?? true;
    const validFrom = coupon.validFrom ?? 0;
    const validUntil = coupon.validUntil ?? undefined;
    const maxUses = coupon.maxUses ?? undefined;
    const currentUses = coupon.currentUses ?? 0;
    const usedByUsers = coupon.usedByUsers ?? [];
    const usedByUserEvent = coupon.usedByUserEvent ?? [];

    if (!isActive) return { success: false, message: "Coupon is not active", originalAmount: amount };

    const now = Date.now();
    if (now < validFrom) return { success: false, message: "Coupon is not yet valid", originalAmount: amount };
    if (validUntil && now > validUntil) return { success: false, message: "Coupon has expired", originalAmount: amount };
    if (maxUses && currentUses >= maxUses) {
      return { success: false, message: "Coupon usage limit reached", originalAmount: amount };
    }

    // Check if user has already used this coupon for this specific event
    if (userId && eventId) {
      const hasUsedForEvent = usedByUserEvent.some(
        usage => usage.userId === userId && usage.eventId === eventId
      );
      if (hasUsedForEvent) {
        return { success: false, message: "You have already used this coupon for this event", originalAmount: amount };
      }
    }

    // Fallback to global user check for backward compatibility (if no eventId provided)
    if (userId && !eventId && usedByUsers.includes(userId)) {
      return { success: false, message: "You have already used this coupon", originalAmount: amount };
    }

    // Calculate discount based on type
    const discountType = coupon.discountType ?? "percentage";
    let discountAmount = 0;
    let discountPercentage = 0;

    if (discountType === "percentage") {
      discountPercentage = coupon.discountPercentage ?? 0;
      discountAmount = Math.round((amount * discountPercentage) / 100);
    } else if (discountType === "flat") {
      discountAmount = coupon.discountAmount ?? 0;
      // For flat discounts, calculate the equivalent percentage for display
      discountPercentage = Math.round((discountAmount / amount) * 100);
    }

    const finalAmount = Math.max(0, amount - discountAmount); // Ensure final amount is not negative

    return {
      success: true,
      originalAmount: amount,
      discountPercentage,
      discountAmount,
      discountType,
      finalAmount,
      couponId: coupon._id,
    };
  },
});

// Increment coupon usage count
export const incrementCouponUsage = mutation({
  args: { code: v.string(), userId: v.optional(v.string()), couponId: v.optional(v.id("coupons")), eventId: v.optional(v.id("events")) },
  handler: async (ctx, { code, userId, couponId, eventId }) => {
    let coupon;
    
    if (couponId) {
      // If couponId is provided, use it directly
      try {
        coupon = await ctx.db.get(couponId);
      } catch (error) {
        console.error("Error getting coupon by ID:", error);
        // Fall back to code lookup if ID lookup fails
        coupon = await ctx.db
          .query("coupons")
          .withIndex("by_code", (q) => q.eq("code", code))
          .first();
      }
    } else {
      // Otherwise look up by code
      coupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
    }

    if (!coupon) throw new ConvexError("Coupon not found");

    // Max uses check right before update with safe defaults
    const maxUses = coupon.maxUses ?? undefined;
    const currentUses = coupon.currentUses ?? 0;
    if (maxUses && currentUses >= maxUses) {
      return { success: false, message: "Coupon usage limit reached" };
    }

    if (userId) {
      const usedByUsers = coupon.usedByUsers ?? [];
      const usedByUserEvent = coupon.usedByUserEvent ?? [];

      // If eventId is provided, check and update per-event usage
      if (eventId) {
        const hasUsedForEvent = usedByUserEvent.some(
          usage => usage.userId === userId && usage.eventId === eventId
        );
        if (hasUsedForEvent) {
          return { success: false, message: "You have already used this coupon for this event" };
        }

        // Add to per-event usage tracking
        const newUsage = {
          userId,
          eventId,
          usedAt: Date.now()
        };

        await ctx.db.patch(coupon._id, {
          currentUses: currentUses + 1,
          usedByUserEvent: [...usedByUserEvent, newUsage],
        });
      } else {
        // Fallback to global user tracking for backward compatibility
        if (usedByUsers.includes(userId)) {
          return { success: false, message: "You have already used this coupon" };
        }

        await ctx.db.patch(coupon._id, {
          currentUses: currentUses + 1,
          usedByUsers: [...usedByUsers, userId],
        });
      }
    } else {
      await ctx.db.patch(coupon._id, {
        currentUses: currentUses + 1,
      });
    }

    return { success: true };
  },
});

// Update coupon
export const updateCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
    code: v.optional(v.string()),
    discountPercentage: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("flat"))),
    isActive: v.optional(v.boolean()),
    validFrom: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    description: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { couponId, ...updates }) => {
    const coupon = await ctx.db.get(couponId);
    if (!coupon) throw new ConvexError("Coupon not found");

    // If code is being updated, check for duplicates
    if (updates.code && updates.code !== coupon.code) {
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", updates.code as string))
        .first();

      if (existingCoupon) throw new ConvexError("Coupon with this code already exists");
    }

    // Validate discount based on type
    const discountType = updates.discountType || coupon.discountType || "percentage";
    if (discountType === "percentage") {
      if (
        updates.discountPercentage !== undefined &&
        (updates.discountPercentage < 0 || updates.discountPercentage > 100)
      ) {
        throw new ConvexError("Discount percentage must be between 0 and 100");
      }
    } else if (discountType === "flat") {
      if (
        updates.discountAmount !== undefined &&
        updates.discountAmount < 0
      ) {
        throw new ConvexError("Discount amount must be a positive number");
      }
    }

    await ctx.db.patch(couponId, updates);
    return { success: true };
  },
});

// Delete coupon
export const deleteCoupon = mutation({
  args: { couponId: v.id("coupons") },
  handler: async (ctx, { couponId }) => {
    await ctx.db.delete(couponId);
    return { success: true };
  },
});


// Create flat discount coupons
export const createFlatDiscountCoupons = mutation({
  handler: async (ctx) => {
    const results = [];
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    // Flat discount coupons
    const flatCoupons = [
      {
        code: "Flat50YC",
        discountAmount: 50,
        description: "₹50 off your purchase with Flat50YC",
        maxUses: 1000,
      },
      {
        code: "Flat100YC", 
        discountAmount: 100,
        description: "₹100 off your purchase with Flat100YC",
        maxUses: 1000,
      },
      {
        code: "Flat500YC",
        discountAmount: 500,
        description: "₹500 off your purchase with Flat500YC", 
        maxUses: 100,
      },
    ];

    for (const coupon of flatCoupons) {
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", coupon.code))
        .first();

      if (!existingCoupon) {
        await ctx.db.insert("coupons", {
          code: coupon.code,
          discountAmount: coupon.discountAmount,
          discountType: "flat",
          isActive: true,
          validFrom: now,
          validUntil: now + oneYear,
          maxUses: coupon.maxUses,
          currentUses: 0,
          description: coupon.description,
          usedByUsers: [] as string[],
          usedByUserEvent: [] as Array<{userId: string, eventId: any, usedAt: number}>,
          userId: undefined,
        });
        results.push(`${coupon.code} created`);
      } else {
        // Update existing coupon to use flat discount
        await ctx.db.patch(existingCoupon._id, {
          discountAmount: coupon.discountAmount,
          discountType: "flat",
          discountPercentage: undefined, // Remove percentage discount
          description: coupon.description,
        });
        results.push(`${coupon.code} updated to flat discount`);
      }
    }

    return { message: "Flat discount coupons initialized", results };
  },
});

// Initialize only flat discount coupons
export const initializeFlatCoupons = mutation({
  handler: async (ctx) => {
    const results = [];
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    const flatCoupons = [
      {
        code: "Flat50YC",
        discountAmount: 50,
        description: "₹50 off your purchase with Flat50YC",
        maxUses: 1000,
      },
      {
        code: "Flat100YC", 
        discountAmount: 100,
        description: "₹100 off your purchase with Flat100YC",
        maxUses: 1000,
      },
      {
        code: "Flat500YC",
        discountAmount: 500,
        description: "₹500 off your purchase with Flat500YC", 
        maxUses: 100,
      },
    ];

    for (const coupon of flatCoupons) {
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", coupon.code))
        .first();

      if (!existingCoupon) {
        await ctx.db.insert("coupons", {
          code: coupon.code,
          discountAmount: coupon.discountAmount,
          discountType: "flat",
          isActive: true,
          validFrom: now,
          validUntil: now + oneYear,
          maxUses: coupon.maxUses,
          currentUses: 0,
          description: coupon.description,
          usedByUsers: [] as string[],
          usedByUserEvent: [] as Array<{userId: string, eventId: any, usedAt: number}>,
          userId: undefined,
        });
        results.push(`${coupon.code} created`);
      } else {
        // Update existing coupon to use flat discount
        await ctx.db.patch(existingCoupon._id, {
          discountAmount: coupon.discountAmount,
          discountType: "flat",
          discountPercentage: undefined, // Remove percentage discount
          description: coupon.description,
        });
        results.push(`${coupon.code} updated to flat discount`);
      }
    }
    
    return {
      message: "Flat coupons initialized",
      results,
    };
  },
});

// Fix existing flat coupons to use correct discount amounts
export const fixFlatCoupons = mutation({
  handler: async (ctx) => {
    const results = [];
    
    // List of flat coupons to fix
    const flatCoupons = [
      { code: "Flat50YC", discountAmount: 50, description: "₹50 off your purchase with Flat50YC" },
      { code: "Flat100YC", discountAmount: 100, description: "₹100 off your purchase with Flat100YC" },
      { code: "Flat500YC", discountAmount: 500, description: "₹500 off your purchase with Flat500YC" },
    ];

    for (const coupon of flatCoupons) {
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", coupon.code))
        .first();

      if (existingCoupon) {
        // Update existing coupon to use flat discount
        await ctx.db.patch(existingCoupon._id, {
          discountAmount: coupon.discountAmount,
          discountType: "flat",
          discountPercentage: undefined, // Remove percentage discount
          description: coupon.description,
        });
        results.push(`${coupon.code} fixed - now gives ₹${coupon.discountAmount} off`);
      } else {
        results.push(`${coupon.code} not found`);
      }
    }

    return { message: "Flat coupons fixed", results };
  },
});

// Force fix all flat coupons - deletes and recreates them
export const forceFixFlatCoupons = mutation({
  handler: async (ctx) => {
    const results = [];
    
    // List of flat coupons to fix
    const flatCoupons = [
      { code: "Flat50YC", discountAmount: 50, description: "₹50 off your purchase with Flat50YC", maxUses: 1000 },
      { code: "Flat100YC", discountAmount: 100, description: "₹100 off your purchase with Flat100YC", maxUses: 1000 },
      { code: "Flat500YC", discountAmount: 500, description: "₹500 off your purchase with Flat500YC", maxUses: 100 },
    ];

    for (const coupon of flatCoupons) {
      // First, delete existing coupon if it exists
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", coupon.code))
        .first();

      if (existingCoupon) {
        await ctx.db.delete(existingCoupon._id);
        results.push(`${coupon.code} deleted`);
      }

      // Create new coupon with correct flat discount
      await ctx.db.insert("coupons", {
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        discountType: "flat",
        isActive: true,
        validFrom: Date.now(),
        validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        maxUses: coupon.maxUses,
        currentUses: 0,
        description: coupon.description,
        usedByUsers: [] as string[],
        usedByUserEvent: [] as Array<{userId: string, eventId: any, usedAt: number}>,
        userId: undefined,
      });
      results.push(`${coupon.code} created with ₹${coupon.discountAmount} flat discount`);
    }

    return { message: "Flat coupons force fixed", results };
  },
});

// Delete all old percentage-based coupons
export const deleteOldCoupons = mutation({
  handler: async (ctx) => {
    const results = [];
    
    // List of old coupons to delete
    const oldCoupons = ["YOLOCLUB15", "YOLO-CLUB"];
    
    for (const code of oldCoupons) {
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();

      if (existingCoupon) {
        await ctx.db.delete(existingCoupon._id);
        results.push(`${code} deleted`);
      } else {
        results.push(`${code} not found`);
      }
    }

    return { message: "Old coupons deleted", results };
  },
});

// Clean up and initialize only flat coupons
export const cleanAndInitializeFlatCoupons = mutation({
  handler: async (ctx) => {
    const results = [];
    
    // First delete old coupons
    const oldCoupons = ["YOLOCLUB15", "YOLO-CLUB"];
    
    for (const code of oldCoupons) {
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();

      if (existingCoupon) {
        await ctx.db.delete(existingCoupon._id);
        results.push(`${code} deleted`);
      } else {
        results.push(`${code} not found`);
      }
    }
    
    // Then create flat coupons
    const flatCoupons = [
      { code: "Flat50YC", discountAmount: 50, description: "₹50 off your purchase with Flat50YC", maxUses: 1000 },
      { code: "Flat100YC", discountAmount: 100, description: "₹100 off your purchase with Flat100YC", maxUses: 1000 },
      { code: "Flat500YC", discountAmount: 500, description: "₹500 off your purchase with Flat500YC", maxUses: 100 },
    ];

    for (const coupon of flatCoupons) {
      // Delete existing if any
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", coupon.code))
        .first();

      if (existingCoupon) {
        await ctx.db.delete(existingCoupon._id);
        results.push(`${coupon.code} deleted`);
      }

      // Create new coupon with correct flat discount
      await ctx.db.insert("coupons", {
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        discountType: "flat",
        isActive: true,
        validFrom: Date.now(),
        validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        maxUses: coupon.maxUses,
        currentUses: 0,
        description: coupon.description,
        usedByUsers: [] as string[],
        usedByUserEvent: [] as Array<{userId: string, eventId: any, usedAt: number}>,
        userId: undefined,
      });
      results.push(`${coupon.code} created with ₹${coupon.discountAmount} flat discount`);
    }
    
    return { message: "Cleaned up old coupons and initialized flat coupons", results };
  },
});
