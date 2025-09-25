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
      console.error('Google OAuth not configured - missing CLIENT_ID or CLIENT_SECRET');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=not_configured`);
    }

    // Check if JWT is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=jwt_not_configured`);
    }

    console.log('Environment check passed:', {
      googleClientId: !!process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      jwtSecret: !!process.env.JWT_SECRET,
      jwtExpire: process.env.JWT_EXPIRE || '30d',
      convexUrl: !!process.env.CONVEX_URL
    });

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
    console.log('Checking for existing user with Google ID:', googleUser.id);
    let user = await convex.query(api.auth.getUserByGoogleId, { googleId: googleUser.id });

    if (!user) {
      console.log('No user found with Google ID, checking by email:', googleUser.email);
      // Check if user exists by email
      user = await convex.query(api.auth.getUserByEmail, { email: googleUser.email });
      
      if (user) {
        console.log('Found existing user by email, linking Google account');
        // Update existing user with Google ID
        await convex.mutation(api.auth.updateUserGoogleId, {
          userId: user.userId,
          googleId: googleUser.id
        });
      } else {
        console.log('Creating new user with Google account');
        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          const userData = {
            userId,
            googleId: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            isEmailVerified: true,
            createdAt: Date.now(),
          };
          
          console.log('Attempting to create user with data:', userData);
          
          await convex.mutation(api.auth.createGoogleUser, userData);

          user = await convex.query(api.auth.getUserByGoogleId, { googleId: googleUser.id });
          console.log('Successfully created new user:', user?.email);
        } catch (createError) {
          console.error('Error creating new user:', createError);
          console.error('User data that failed:', {
            userId,
            googleId: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            isEmailVerified: true,
            createdAt: Date.now(),
          });
          throw new Error(`Failed to create user: ${createError instanceof Error ? createError.message : String(createError)}`);
        }
      }
    } else {
      console.log('Found existing user with Google ID:', user.email);
    }

    if (!user) {
      console.error('Failed to create or retrieve user');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=user_creation_failed`);
    }

    // Update last login
    await convex.mutation(api.auth.updateLastLogin, { userId: user.userId });

    // Generate JWT token
    console.log('Generating JWT token for user:', user.email);
    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
    console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE || '30d');
    
    const token = jwt.sign(
      { id: user.userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    console.log('Successfully generated token for user:', user.email);

    // Redirect to frontend with token
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Missing',
      jwtExpire: process.env.JWT_EXPIRE ? 'Set' : 'Missing',
      convexUrl: process.env.CONVEX_URL ? 'Set' : 'Missing'
    });
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=callback_error`);
  }
}
