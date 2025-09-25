const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.userId);
  
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  // Remove sensitive data
  const { password, ...userWithoutPassword } = user;

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userWithoutPassword
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user exists
    const existingUser = await req.convex.query('auth:getUserByEmail', { email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user in Convex
    await req.convex.mutation('createUser', {
      userId,
      email,
      name,
      password: hashedPassword,
      isEmailVerified: false,
      createdAt: Date.now(),
    });

    // Get the created user
    const user = await req.convex.query('getUserByEmail', { email });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await req.convex.query('getUserByEmail', { email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await req.convex.mutation('updateLastLogin', { userId: user.userId });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Google OAuth (only if credentials are provided)
// @route   GET /api/auth/google
// @access  Public
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
} else {
  router.get('/google', (req, res) => {
    console.log('Google OAuth not configured - redirecting to frontend');
    const frontendUrl = process.env.FRONTEND_URL || 'https://ticketr-yoloclub.in';
    res.redirect(`${frontendUrl}/auth?error=oauth_not_configured`);
  });
}

// @desc    Google OAuth callback (only if credentials are provided)
// @route   GET /api/auth/google/callback
// @access  Public
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'https://ticketr-yoloclub.in'}/auth?error=google_auth_failed`,
    session: false
  }), async (req, res) => {
    try {
      console.log('Google OAuth callback - User:', req.user);
      
      if (!req.user) {
        console.error('No user found in request');
        return res.redirect(`${process.env.FRONTEND_URL || 'https://ticketr-yoloclub.in'}/auth?error=no_user`);
      }
      
      const token = generateToken(req.user.userId);
      
      console.log('Generated token for user:', req.user.email);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'https://ticketr-yoloclub.in';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'https://ticketr-yoloclub.in';
      res.redirect(`${frontendUrl}/auth?error=callback_error`);
    }
  });
} else {
  router.get('/google/callback', (req, res) => {
    console.log('Google OAuth not configured - redirecting to frontend');
    const frontendUrl = process.env.FRONTEND_URL || 'https://ticketr-yoloclub.in';
    res.redirect(`${frontendUrl}/auth?error=oauth_not_configured`);
  });
}

// @desc    Facebook OAuth (disabled as per user request)
// @route   GET /api/auth/facebook
// @access  Public
router.get('/facebook', (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Facebook OAuth is disabled.'
  });
});

// @desc    Facebook OAuth callback (disabled as per user request)
// @route   GET /api/auth/facebook/callback
// @access  Public
router.get('/facebook/callback', (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Facebook OAuth is disabled.'
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await req.convex.query('getUserById', { userId: req.user.userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await req.convex.query('getUserByEmail', { email });
      if (existingUser && existingUser.userId !== req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    await req.convex.mutation('updateUser', {
      userId: req.user.userId,
      updates
    });

    // Get updated user
    const user = await req.convex.query('getUserById', { userId: req.user.userId });
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
router.get('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

module.exports = router;