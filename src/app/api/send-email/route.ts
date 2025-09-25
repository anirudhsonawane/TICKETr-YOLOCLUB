import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, subject, message, useSimple = false } = body;

    console.log("📧 Manual email sending request:", { email, subject, useSimple });

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    let result;
    
    if (useSimple) {
      // Use simple email action
      result = await convex.action(api.actions.simpleEmail.sendSimpleEmailAction, {
        to: email,
        subject: subject || "Test Email from Ticketr",
        message: message || "This is a test email to verify email functionality.",
      });
    } else {
      // Use full email action with HTML
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">📧 Test Email</h2>
          <p>This is a test email to verify email functionality.</p>
          <p><strong>Message:</strong> ${message || "No message provided"}</p>
          <p>If you receive this email, the email system is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            Sent from Ticketr Email System
          </p>
        </div>
      `;

      result = await convex.action(api.actions.email.sendTicketEmailAction, {
        to: email,
        subject: subject || "Test Email from Ticketr",
        htmlContent,
      });
    }

    console.log("📧 Email sending result:", result);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      result,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Email sending failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
