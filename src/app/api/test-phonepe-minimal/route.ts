import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("=== MINIMAL PHONEPE TEST ===");
    
    // Test 1: Basic import
    console.log("1. Testing PhonePe SDK import...");
    const phonepeSDK = require('phonepe-pg-sdk-node');
    console.log("SDK imported:", Object.keys(phonepeSDK));
    
    // Test 2: Check if StandardCheckoutPayRequest exists
    console.log("2. Checking StandardCheckoutPayRequest...");
    const { StandardCheckoutPayRequest } = phonepeSDK;
    console.log("StandardCheckoutPayRequest:", typeof StandardCheckoutPayRequest);
    
    if (!StandardCheckoutPayRequest) {
      throw new Error("StandardCheckoutPayRequest not found in SDK");
    }
    
    // Test 3: Check if builder method exists
    console.log("3. Checking builder method...");
    console.log("StandardCheckoutPayRequest.builder:", typeof StandardCheckoutPayRequest.builder);
    
    if (typeof StandardCheckoutPayRequest.builder !== 'function') {
      throw new Error("StandardCheckoutPayRequest.builder is not a function");
    }
    
    // Test 4: Try to create a minimal request
    console.log("4. Creating minimal request...");
    try {
      const builder = StandardCheckoutPayRequest.builder();
      console.log("Builder created:", typeof builder);
      
      const request = builder
        .merchantOrderId("TEST_123")
        .amount(100)
        .redirectUrl("https://example.com")
        .build();
      
      console.log("Request created successfully:", request);
      
      return NextResponse.json({
        success: true,
        message: "PhonePe SDK test successful",
        sdkKeys: Object.keys(phonepeSDK),
        requestType: typeof request
      });
      
    } catch (builderError) {
      console.error("Builder error details:", {
        message: builderError instanceof Error ? builderError.message : String(builderError),
        stack: builderError instanceof Error ? builderError.stack : undefined,
        name: builderError instanceof Error ? builderError.name : undefined
      });
      
      return NextResponse.json({
        success: false,
        error: "Builder failed",
        details: builderError instanceof Error ? builderError.message : String(builderError),
        stack: builderError instanceof Error ? builderError.stack : undefined
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("PhonePe SDK test error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: "SDK test failed",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
