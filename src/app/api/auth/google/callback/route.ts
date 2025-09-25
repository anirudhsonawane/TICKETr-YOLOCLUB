import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../../convex/_generated/api";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=google_auth_failed`);
    }

    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=no_code`);
    }

    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=not_configured`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user info:', await userResponse.text());
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=user_info_failed`);
    }

    const googleUser = await userResponse.json();
    console.log('Google user data:', googleUser);

    // Check if user exists in our database
    const convex = getConvexClient();
    let user = await convex.query(api.auth.getUserByGoogleId, { googleId: googleUser.id });

    if (!user) {
      // Check if user exists by email
      user = await convex.query(api.auth.getUserByEmail, { email: googleUser.email });
      
      if (user) {
        // Update existing user with Google ID
        await convex.mutation(api.auth.updateUserGoogleId, {
          userId: user.userId,
          googleId: googleUser.id
        });
      } else {
        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await convex.mutation(api.auth.createGoogleUser, {
          userId,
          googleId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
          isEmailVerified: true,
          createdAt: Date.now(),
        });

        user = await convex.query(api.auth.getUserByGoogleId, { googleId: googleUser.id });
      }
    }

    if (!user) {
      console.error('Failed to create or retrieve user');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=user_creation_failed`);
    }

    // Update last login
    await convex.mutation(api.auth.updateLastLogin, { userId: user.userId });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    console.log('Generated token for user:', user.email);

    // Redirect to frontend with token
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=callback_error`);
  }
}
