import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    console.log("=== TESTING MONGODB CONNECTION ===");
    
    // Test MongoDB connection
    await connectDB();
    console.log("✅ MongoDB connected successfully");
    
    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    return NextResponse.json({
      success: false,
      message: "MongoDB connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    }, { status: 500 });
  }
}
