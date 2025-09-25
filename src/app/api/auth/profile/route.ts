import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'No token provided'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // For now, we'll use a simple token validation
    let userId: string;
    try {
      const tokenData = JSON.parse(atob(token));
      userId = tokenData.userId;
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    const { name, email } = await req.json();
    const convex = getConvexClient();

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await convex.query(api.auth.getUserByEmail, { email });
      if (existingUser && existingUser.userId !== userId) {
        return NextResponse.json({
          success: false,
          message: 'Email already exists'
        }, { status: 400 });
      }
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    await convex.mutation(api.auth.updateUser, {
      userId,
      updates
    });

    // Get updated user
    const user = await convex.query(api.auth.getUserById, { userId });
    if (!user) {
      throw new Error('User not found after update');
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}
