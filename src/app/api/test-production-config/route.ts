import { NextRequest, NextResponse } from "next/server";
import { getPhonePeConfig } from "@/lib/phonepe-config";

export async function GET(req: NextRequest) {
  try {
    const config = getPhonePeConfig();
    
    const status = {
      // Environment detection
      NODE_ENV: process.env.NODE_ENV,
      detectedEnvironment: config.nodeEnvironment,
      phonePeEnvironment: config.environment === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX',
      
      // Credentials status
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret,
      clientIdLength: config.clientId?.length || 0,
      clientSecretLength: config.clientSecret?.length || 0,
      
      // API Configuration
      baseUrl: config.baseUrl,
      webhookUrl: config.webhookUrl,
      
      // Feature flags
      bypassMode: config.bypassMode,
      enableLogging: config.enableLogging,
      enableReconciliation: config.enableReconciliation,
      
      // All PhonePe environment variables
      envVars: {
        PHONEPE_CLIENT_ID: process.env.PHONEPE_CLIENT_ID ? 'SET' : 'MISSING',
        PHONEPE_CLIENT_SECRET: process.env.PHONEPE_CLIENT_SECRET ? 'SET' : 'MISSING',
        PHONEPE_BASE_URL: process.env.PHONEPE_BASE_URL || 'NOT_SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT_SET'
      }
    };

    console.log("Production configuration check:", status);

    return NextResponse.json({
      success: true,
      message: "Production configuration loaded successfully",
      status,
      recommendations: getRecommendations(status)
    });
  } catch (error) {
    console.error("Error checking production configuration:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to load production configuration"
    }, { status: 500 });
  }
}

function getRecommendations(status: any): string[] {
  const recommendations = [];
  
  if (status.NODE_ENV !== 'production') {
    recommendations.push("⚠️ NODE_ENV should be set to 'production' for production mode");
  }
  
  if (status.phonePeEnvironment !== 'PRODUCTION') {
    recommendations.push("⚠️ PhonePe environment should be 'PRODUCTION' for live payments");
  }
  
  if (!status.hasClientId || !status.hasClientSecret) {
    recommendations.push("❌ PhonePe credentials are missing - set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET");
  }
  
  if (status.baseUrl !== 'https://api.phonepe.com/apis/hermes/') {
    recommendations.push("⚠️ Base URL should be 'https://api.phonepe.com/apis/hermes/' for production");
  }
  
  if (status.NEXT_PUBLIC_BASE_URL === 'NOT_SET' || !status.NEXT_PUBLIC_BASE_URL || status.NEXT_PUBLIC_BASE_URL.includes('localhost')) {
    recommendations.push("⚠️ NEXT_PUBLIC_BASE_URL should be your production domain");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("✅ Configuration looks good for production!");
  }
  
  return recommendations;
}
