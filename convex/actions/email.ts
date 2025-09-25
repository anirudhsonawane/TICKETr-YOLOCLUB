"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import nodemailer from 'nodemailer';

// Create transporter with better error handling
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    console.log('🔧 Initializing email transporter...');
    console.log('📧 EMAIL_USER configured:', !!process.env.EMAIL_USER);
    console.log('🔑 EMAIL_PASS configured:', !!process.env.EMAIL_PASS);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }

    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add additional options for better reliability
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      rateDelta: 20000,
      rateLimit: 5,
    });

    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error);
      } else {
        console.log('✅ Email transporter verified successfully');
      }
    });
  }
  return transporter;
}

export const sendTicketEmailAction = action({
  args: {
    to: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
  },
  handler: async (ctx, { to, subject, htmlContent }) => {
    console.log('📧 Attempting to send email...');
    console.log('📧 To:', to);
    console.log('📝 Subject:', subject);
    console.log('📄 HTML Content length:', htmlContent.length);
    console.log('🔧 Environment check:');
    console.log('  - EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('  - EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

    try {
      const emailTransporter = getTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent,
      };

      console.log('📤 Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        htmlLength: mailOptions.html.length,
      });

      const result = await emailTransporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Response:', result.response);
      
      return { 
        success: true, 
        messageId: result.messageId,
        response: result.response 
      };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      } else if (typeof error === 'object' && error !== null) {
        console.error('❌ Error object:', JSON.stringify(error, null, 2));
        
        if ('response' in error) {
          console.error('❌ Nodemailer response error:', (error as any).response);
        }
        if ('responseCode' in error) {
          console.error('❌ Nodemailer response code:', (error as any).responseCode);
        }
        if ('code' in error) {
          console.error('❌ Error code:', (error as any).code);
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error 
      };
    }
  },
});