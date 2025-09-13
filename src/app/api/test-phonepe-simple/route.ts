import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("Testing PhonePe SDK import...");
    
    // Test basic import
    const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = require('phonepe-pg-sdk-node');
    console.log("PhonePe SDK imported successfully");
    console.log("StandardCheckoutPayRequest:", typeof StandardCheckoutPayRequest);
    console.log("StandardCheckoutPayRequest.builder:", typeof StandardCheckoutPayRequest.builder);
    
    // Test basic builder
    try {
      const testRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId("TEST_123")
        .amount(100)
        .redirectUrl("https://example.com")
        .build();
      
      console.log("Test request created successfully:", testRequest);
      
      return NextResponse.json({
        success: true,
        message: "PhonePe SDK test successful",
        testRequest: testRequest
      });
    } catch (builderError) {
      console.error("Builder error:", builderError);
      return NextResponse.json({
        success: false,
        error: "Builder failed",
        details: builderError instanceof Error ? builderError.message : String(builderError)
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("PhonePe SDK test error:", error);
    return NextResponse.json({
      success: false,
      error: "SDK import failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
