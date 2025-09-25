const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const { api } = require('../convex/_generated/api');

module.exports = function(passport, convex) {
  // JWT Strategy
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
  }, async (payload, done) => {
    try {
      const user = await convex.query(api.auth.getUserById, { userId: payload.id });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));

  // Local Strategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await convex.query(api.auth.verifyPassword, { email, password });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password' });
      }
    } catch (error) {
      return done(error, false);
    }
  }));

  // Google Strategy (only if credentials are provided)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth strategy - Profile:', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });
      
      // Check if user already exists with this Google ID
      let user = await convex.query(api.auth.getUserByGoogleId, { googleId: profile.id });
      
      if (user) {
        console.log('Found existing user with Google ID:', user.email);
        // Update last login
        await convex.mutation(api.auth.updateLastLogin, { userId: user.userId });
        return done(null, user);
      }

      // Check if user exists with same email
      user = await convex.query(api.auth.getUserByEmail, { email: profile.emails[0].value });
      
      if (user) {
        console.log('Found existing user with email, linking Google account:', user.email);
        // Link Google account to existing user
        await convex.mutation(api.auth.updateUser, {
          userId: user.userId,
          updates: {
            googleId: profile.id,
            avatar: profile.photos[0]?.value || user.avatar,
          }
        });
        await convex.mutation(api.auth.updateLastLogin, { userId: user.userId });
        return done(null, user);
      }

      console.log('Creating new user for Google OAuth');
      // Create new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await convex.mutation(api.auth.createUser, {
        userId,
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0]?.value || '',
        isEmailVerified: true, // Google emails are pre-verified
        lastLogin: Date.now(),
      });
      
      // Get the created user
      user = await convex.query(api.auth.getUserByGoogleId, { googleId: profile.id });
      console.log('Successfully created new user:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth strategy error:', error);
      return done(error, false);
    }
  }));
  } else {
    console.log('Google OAuth credentials not provided, skipping Google strategy');
  }

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.userId);
  });

  // Deserialize user from session
  passport.deserializeUser(async (userId, done) => {
    try {
      const user = await convex.query(api.auth.getUserById, { userId });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};