import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'Google OAuth is not configured. Please use email/password login.'
      }, { status: 400 });
    }

    // Construct Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'profile email',
      access_type: 'offline',
      prompt: 'consent'
    });

    googleAuthUrl.search = params.toString();

    // Redirect to Google OAuth
    return NextResponse.redirect(googleAuthUrl.toString());

  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error initiating Google OAuth'
    }, { status: 500 });
  }
}
