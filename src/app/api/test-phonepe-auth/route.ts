import { NextRequest, NextResponse } from "next/server";
import { getPhonePeClient } from "@/lib/phonepe";

export async function GET(req: NextRequest) {
  try {
    console.log("=== TESTING PHONEPE AUTHENTICATION ===");
    
    // Get the client to test authentication
    const client = getPhonePeClient();
    console.log("PhonePe client created successfully");
    
    // Try to get order status with a dummy order ID to test auth
    // This will fail but will show us the exact error
    try {
      await client.getOrderStatus("TEST_ORDER_123", false);
    } catch (authError: any) {
      console.log("Authentication test result:", {
        error: authError.message,
        type: authError.type,
        httpStatusCode: authError.httpStatusCode,
        code: authError.code
      });
      
      // If it's a 404 (order not found), that means auth worked
      if (authError.httpStatusCode === 404) {
        return NextResponse.json({
          success: true,
          message: "✅ Authentication successful! Credentials are working.",
          details: "Order not found (404) means auth passed, just order doesn't exist"
        });
      }
      
      // If it's 401, credentials are wrong
      if (authError.httpStatusCode === 401) {
        return NextResponse.json({
          success: false,
          message: "❌ Authentication failed - Invalid credentials",
          error: authError.message,
          recommendations: [
            "Check if production credentials are activated in PhonePe dashboard",
            "Verify CLIENT_ID and CLIENT_SECRET are correct",
            "Ensure you're using production credentials, not sandbox",
            "Check if merchant account is approved for production"
          ]
        });
      }
      
      // Other errors
      return NextResponse.json({
        success: false,
        message: "❌ Authentication test failed",
        error: authError.message,
        httpStatusCode: authError.httpStatusCode,
        code: authError.code
      });
    }
    
  } catch (error) {
    console.error("PhonePe authentication test error:", error);
    return NextResponse.json({
      success: false,
      message: "❌ Failed to create PhonePe client",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
