const express = require('express');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { getConvexClient } = require('./lib/convex');
require('dotenv').config();

const app = express();

// Initialize Convex client
const convex = getConvexClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Convex connection
console.log('Connected to Convex:', process.env.CONVEX_URL);

// Passport configuration
require('./config/passport')(passport, convex);

// Routes
app.use('/api/auth', (req, res, next) => {
  req.convex = convex;
  next();
}, require('./routes/auth'));

app.use('/api/user', (req, res, next) => {
  req.convex = convex;
  next();
}, require('./routes/user'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Authentication server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Authentication server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});