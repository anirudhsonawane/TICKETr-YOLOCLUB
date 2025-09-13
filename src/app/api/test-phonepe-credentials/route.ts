import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const credentials = {
      PHONEPE_CLIENT_ID: process.env.PHONEPE_CLIENT_ID ? 'SET' : 'MISSING',
      PHONEPE_CLIENT_SECRET: process.env.PHONEPE_CLIENT_SECRET ? 'SET' : 'MISSING',
      PHONEPE_CLIENT_VERSION: process.env.PHONEPE_CLIENT_VERSION || 'NOT_SET',
      PHONEPE_WEBHOOK_USERNAME: process.env.PHONEPE_WEBHOOK_USERNAME ? 'SET' : 'MISSING',
      PHONEPE_WEBHOOK_PASSWORD: process.env.PHONEPE_WEBHOOK_PASSWORD ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
      BYPASS_PHONEPE: process.env.BYPASS_PHONEPE || 'NOT_SET'
    };

    console.log("PhonePe credentials status:", credentials);

    return NextResponse.json({
      success: true,
      credentials,
      message: "Check console logs for detailed credential status"
    });
  } catch (error) {
    console.error("Error checking PhonePe credentials:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
