import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Please provide name, email and password'
      }, { status: 400 });
    }

    const convex = getConvexClient();
    
    // Check if user exists
    const existingUser = await convex.query(api.auth.getUserByEmail, { email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User already exists with this email'
      }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user in Convex
    await convex.mutation(api.auth.createUser, {
      userId,
      email,
      name,
      password: hashedPassword,
      isEmailVerified: false,
    });

    // Get the created user
    const user = await convex.query(api.auth.getUserByEmail, { email });
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error creating user'
    }, { status: 500 });
  }
}
