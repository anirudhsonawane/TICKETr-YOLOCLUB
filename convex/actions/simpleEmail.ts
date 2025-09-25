"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";

export const sendSimpleEmailAction = action({
  args: {
    to: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, { to, subject, message }) => {
    console.log('📧 Simple email action called');
    console.log('📧 To:', to);
    console.log('📝 Subject:', subject);
    console.log('📄 Message:', message);

    try {
      // For now, just log the email details
      // In production, you would integrate with your email service
      console.log('✅ Email would be sent to:', to);
      console.log('📝 Subject:', subject);
      console.log('📄 Message:', message);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { 
        success: true, 
        message: 'Email logged successfully (simple mode)',
        details: { to, subject, message }
      };
    } catch (error) {
      console.error('❌ Simple email action failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
});
