import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";

export async function GET(req: NextRequest) {
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
    // In production, you'd want to implement proper JWT validation
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

    const convex = getConvexClient();
    const user = await convex.query(api.auth.getUserById, { userId });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}
