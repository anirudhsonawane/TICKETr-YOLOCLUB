import { NextRequest, NextResponse } from "next/server";
import { PaymentSessionService } from "@/lib/paymentSessionService";

// POST - Clean up expired payment sessions
export async function POST(req: NextRequest) {
  try {
    const cleanedCount = await PaymentSessionService.cleanupExpiredSessions();
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired payment sessions`,
      cleanedCount
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({
      error: "Failed to cleanup expired sessions",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// GET - Get cleanup status
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Payment session cleanup endpoint",
    usage: "POST to this endpoint to clean up expired sessions"
  });
}
