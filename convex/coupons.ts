import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new coupon
export const createCoupon = mutation({
  args: {
    code: v.string(),
    discountPercentage: v.number(),
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

    // Validate discount percentage (0-100)
    if (args.discountPercentage < 0 || args.discountPercentage > 100) {
      throw new ConvexError("Discount percentage must be between 0 and 100");
    }

    return await ctx.db.insert("coupons", {
      ...args,
      currentUses: 0,
      usedByUsers: [],
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
        description: coupon.description,
      },
    };
  },
});

// Apply a coupon to calculate discounted amount
export const calculateDiscountedAmount = query({
  args: { code: v.string(), amount: v.number(), userId: v.optional(v.string()) },
  handler: async (ctx, { code, amount, userId }) => {
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

    if (!isActive) return { success: false, message: "Coupon is not active", originalAmount: amount };

    const now = Date.now();
    if (now < validFrom) return { success: false, message: "Coupon is not yet valid", originalAmount: amount };
    if (validUntil && now > validUntil) return { success: false, message: "Coupon has expired", originalAmount: amount };
    if (maxUses && currentUses >= maxUses) {
      return { success: false, message: "Coupon usage limit reached", originalAmount: amount };
    }

    // Prevent user from reusing coupon
    if (userId && usedByUsers.includes(userId)) {
      return { success: false, message: "You have already used this coupon", originalAmount: amount };
    }

    // Calculate discount
    const discountPercentage = coupon.discountPercentage ?? 0;
    const discountAmount = Math.round((amount * discountPercentage) / 100);
    const finalAmount = amount - discountAmount;

    return {
      success: true,
      originalAmount: amount,
      discountPercentage,
      discountAmount,
      finalAmount,
      couponId: coupon._id,
    };
  },
});

// Increment coupon usage count
export const incrementCouponUsage = mutation({
  args: { code: v.string(), userId: v.optional(v.string()), couponId: v.optional(v.id("coupons")) },
  handler: async (ctx, { code, userId, couponId }) => {
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
      if (usedByUsers.includes(userId)) {
        return { success: false, message: "You have already used this coupon" };
      }

      await ctx.db.patch(coupon._id, {
        currentUses: currentUses + 1,
        usedByUsers: [...usedByUsers, userId],
      });
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

    // Validate discount
    if (
      updates.discountPercentage !== undefined &&
      (updates.discountPercentage < 0 || updates.discountPercentage > 100)
    ) {
      throw new ConvexError("Discount percentage must be between 0 and 100");
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

// Seed initial coupon YOLOCLUB15
export const seedInitialCoupon = mutation({
  handler: async (ctx) => {
    const existingCoupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", "YOLOCLUB15"))
      .first();

    if (existingCoupon) return { message: "Initial coupon already exists" };

    await ctx.db.insert("coupons", {
      code: "YOLOCLUB15",
      discountPercentage: 15,
      isActive: true,
      validFrom: Date.now(),
      validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      maxUses: 1000,
      currentUses: 0,
      description: "15% off your purchase with YOLOCLUB15",
      usedByUsers: [] as string[],
      userId: undefined, 
    });

    return { message: "Initial coupon created successfully" };
  },
});

// Ensure a coupon with a given code exists (create if missing)
export const ensureCouponExists = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const existing = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (existing) return { created: false };

    const nowTs = Date.now();
    await ctx.db.insert("coupons", {
      code,
      discountPercentage: 15,
      isActive: true,
      validFrom: nowTs,
      validUntil: nowTs + 365 * 24 * 60 * 60 * 1000,
      maxUses: 1000,
      currentUses: 0,
      description: `${code} gives 15% off`,
      usedByUsers: [] as string[],
      userId: undefined,
    });

    return { created: true };
  },
});
