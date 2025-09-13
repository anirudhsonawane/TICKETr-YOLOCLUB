# Environment Setup for TICKETr

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ticketr
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticketr

# PhonePe Configuration
# For Development/Testing (Sandbox)
PHONEPE_CLIENT_ID=your_phonepe_sandbox_client_id
PHONEPE_CLIENT_SECRET=your_phonepe_sandbox_client_secret
PHONEPE_CLIENT_VERSION=1.0
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox/
PHONEPE_WEBHOOK_USERNAME=your_webhook_username
PHONEPE_WEBHOOK_PASSWORD=your_webhook_password

# For Production (uncomment and use these instead of sandbox credentials)
# PHONEPE_CLIENT_ID=your_phonepe_production_client_id
# PHONEPE_CLIENT_SECRET=your_phonepe_production_client_secret
# PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes/

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
BYPASS_PHONEPE=false
PHONEPE_ENABLE_LOGGING=true
PHONEPE_ENABLE_RECONCILIATION=true
PHONEPE_ENABLE_WEBHOOK_VALIDATION=true

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use: `MONGODB_URI=mongodb://localhost:27017/ticketr`

### Option 2: MongoDB Atlas (Recommended for Production)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticketr`

## PhonePe Setup

1. Register at [PhonePe Developer Portal](https://developer.phonepe.com/)
2. Get your Client ID and Secret
3. Set up webhook credentials
4. Use sandbox URLs for testing

## Razorpay Setup

1. Register at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your Key ID and Secret
3. Set up webhooks

## Clerk Setup

1. Register at [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Get your publishable key and secret key

## Testing

After setting up the environment variables:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test the payment flow:
   - Create an event
   - Purchase tickets
   - Check "My Tickets" section

3. Test webhooks:
   - Use PhonePe/Razorpay test webhooks
   - Verify ticket creation

## Production Deployment

1. Set up MongoDB Atlas
2. Configure production PhonePe credentials
3. Set up proper webhook URLs
4. Update `NEXT_PUBLIC_BASE_URL` to your domain
5. Deploy to Vercel/Netlify

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Check network connectivity
- Ensure MongoDB is running

### PhonePe Issues
- Verify credentials are correct
- Check webhook URLs
- Test with sandbox environment

### Build Issues
- Run `npm install` to install dependencies
- Check for missing environment variables
- Verify all imports are correct
