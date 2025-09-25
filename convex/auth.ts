import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    return user;
  },
});

export const getUserByGoogleId = query({
  args: { googleId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("googleId"), args.googleId))
      .first();
    return user;
  },
});

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    return user;
  },
});

export const createUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    googleId: v.optional(v.string()),
    facebookId: v.optional(v.string()),
    password: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"), v.literal("seller"))),
    isEmailVerified: v.optional(v.boolean()),
    lastLogin: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User already exists with this email");
    }

    const newUserId = await ctx.db.insert("users", {
      userId: args.userId,
      email: args.email,
      name: args.name,
      googleId: args.googleId,
      facebookId: args.facebookId,
      password: args.password,
      avatar: args.avatar,
      role: args.role || "user",
      isEmailVerified: args.isEmailVerified || false,
      lastLogin: args.lastLogin || Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stripeConnectId: undefined,
    });

    return newUserId;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      googleId: v.optional(v.string()),
      facebookId: v.optional(v.string()),
      avatar: v.optional(v.string()),
      role: v.optional(v.union(v.literal("user"), v.literal("admin"), v.literal("seller"))),
      isEmailVerified: v.optional(v.boolean()),
      lastLogin: v.optional(v.number()),
      password: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

export const updateLastLogin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

export const verifyPassword = query({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user || !user.password) {
      return null;
    }

    // For now, we'll do a simple comparison since we don't have bcrypt in Convex
    // In production, you'd want to hash passwords properly
    if (user.password === args.password) {
      return user;
    }

    return null;
  },
});
