"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../_generated/api";
// import { sendTicketEmailAction } from "../actions/email"; // Remove direct import

export const completePurchaseAndSendEmail = action({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    console.log("completePurchaseAndSendEmail action triggered for userId:", userId, "eventId:", eventId);
    // Mark purchase complete (this will still be a mutation)
    await ctx.runMutation(api.purchaseComplete.markPurchaseComplete, { eventId, userId });

    // Fetch user and event details to send email
    const user = await ctx.runQuery(api.users.getUserById, { userId });
    const event = await ctx.runQuery(api.events.getById, { eventId });

    if (user && event && user.email) {
      const subject = `Your Ticket for ${event.name}`;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ticketr.yoloclub.in';
      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">Your Ticket is Ready!</h1>
              <p style="margin: 0; opacity: 0.9; font-size: 16px;">Thank you for your purchase</p>
            </div>
            
            <div style="padding: 24px;">
              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">${event.name}</h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div>
                  <div style="font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date</div>
                  <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${new Date(event.eventDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Time</div>
                  <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${new Date(event.eventDate).toLocaleTimeString()}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Location</div>
                  <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${event.location}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Pass Holder</div>
                  <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${user.name || 'N/A'}</div>
                </div>
              </div>
              
              <div style="text-align: center; padding: 24px; background: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                <div style="width: 120px; height: 120px; margin: 0 auto 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b;">
                  QR Code
                </div>
                <p style="font-size: 14px; color: #64748b; margin: 0;">Present this ticket at the event</p>
              </div>
              
              <div style="text-align: center; margin-top: 24px;">
                <a href="${baseUrl}/tickets" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">View Your Tickets</a>
                <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">Click to access your tickets in your account</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 14px;">
            <p>We look forward to seeing you there!</p>
            <p>Best regards,<br>The Ticketr Team</p>
          </div>
        </div>
      `;

      await ctx.runAction(internal['actions/email'].sendTicketEmailAction, { // Use explicit path
        to: user.email,
        subject,
        htmlContent,
      });
    }
    return { success: true };
  },
});
