const express = require('express');
const passport = require('passport');
const router = express.Router();

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await req.convex.query('auth:getUserById', { userId: req.user.userId });
    
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
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await req.convex.query('auth:getUserByEmail', { email });
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

    await req.convex.mutation('auth:updateUser', {
      userId: req.user.userId,
      updates
    });

    // Get updated user
    const user = await req.convex.query('auth:getUserById', { userId: req.user.userId });
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;