# PhonePe Payment Gateway Integration

This document describes the PhonePe payment gateway integration implemented in the TICKETr application.

## Overview

The PhonePe integration provides an alternative payment method alongside Razorpay, allowing users to pay for event tickets using PhonePe's secure payment platform.

## Features

- **Payment Initiation**: Create PhonePe payment orders
- **Payment Verification**: Verify payment status after completion
- **Webhook Handling**: Process payment callbacks securely
- **Refund Support**: Initiate and track refunds
- **UI Integration**: Seamless payment method selection in the purchase flow

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# PhonePe Configuration
PHONEPE_CLIENT_ID=your_phonepe_client_id
PHONEPE_CLIENT_SECRET=your_phonepe_client_secret
PHONEPE_CLIENT_VERSION=1.0

# Base URL for callbacks and redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## API Endpoints

### 1. Create PhonePe Order
- **Endpoint**: `POST /api/create-phonepe-order`
- **Purpose**: Initiates a PhonePe payment
- **Request Body**:
  ```json
  {
    "amount": 1000,
    "eventId": "event_id",
    "userId": "user_id",
    "quantity": 1,
    "passId": "pass_id",
    "couponCode": "DISCOUNT10",
    "selectedDate": "2024-01-01",
    "waitingListId": "waiting_list_id"
  }
  ```

### 2. Verify Payment
- **Endpoint**: `POST /api/phonepe/verify`
- **Purpose**: Verifies payment status
- **Request Body**:
  ```json
  {
    "merchantOrderId": "TICKET_1234567890_ABC123"
  }
  ```

### 3. Process Refund
- **Endpoint**: `POST /api/phonepe/refund`
- **Purpose**: Initiates a refund
- **Request Body**:
  ```json
  {
    "merchantOrderId": "TICKET_1234567890_ABC123",
    "refundId": "REFUND_1234567890_XYZ789",
    "amount": 1000,
    "reason": "Customer request"
  }
  ```

### 4. Webhook Handler
- **Endpoint**: `POST /api/webhooks/phonepe`
- **Purpose**: Handles payment callbacks from PhonePe
- **Note**: This endpoint automatically processes successful payments and creates tickets

## Components

### PhonePePayment Component
Located at `src/components/PhonePePayment.tsx`, this component provides the UI for PhonePe payments.

**Props**:
- `amount`: Payment amount in rupees
- `eventId`: Event ID
- `userId`: User ID
- `quantity`: Number of tickets
- `passId`: Pass ID (optional)
- `couponCode`: Coupon code (optional)
- `selectedDate`: Selected date (optional)
- `waitingListId`: Waiting list ID (optional)
- `onSuccess`: Success callback
- `onError`: Error callback

## Payment Flow

1. **User Selection**: User selects PhonePe as payment method
2. **Order Creation**: System creates PhonePe order via `/api/create-phonepe-order`
3. **Redirect**: User is redirected to PhonePe payment page
4. **Payment**: User completes payment on PhonePe
5. **Callback**: PhonePe sends webhook to `/api/webhooks/phonepe`
6. **Verification**: System verifies payment and creates tickets
7. **Success**: User is redirected to success page

## Security Features

- **Webhook Validation**: All webhooks are validated using PhonePe's signature verification
- **Idempotency**: Duplicate payments are prevented using order ID tracking
- **Error Handling**: Comprehensive error handling with proper logging
- **Environment Separation**: Different configurations for UAT and Production

## Testing

### UAT Environment
- Set `NODE_ENV=development` to use PhonePe UAT environment
- Use test credentials provided by PhonePe

### Production Environment
- Set `NODE_ENV=production` to use PhonePe production environment
- Use production credentials from PhonePe dashboard

## Error Handling

The integration includes comprehensive error handling for:
- Invalid credentials
- Network failures
- Payment failures
- Webhook validation failures
- Missing required fields

## Logging

All PhonePe operations are logged with appropriate levels:
- `console.log`: Normal operations
- `console.error`: Errors and failures
- `console.warn`: Warnings and edge cases

## Dependencies

- `pg-sdk-node`: Official PhonePe Node.js SDK
- `next`: Next.js framework
- `convex`: Backend-as-a-Service for data management

## Support

For issues related to PhonePe integration:
1. Check the console logs for detailed error messages
2. Verify environment variables are correctly set
3. Ensure PhonePe credentials are valid
4. Check webhook URL configuration in PhonePe dashboard

## Integration Checklist

- [ ] Set up PhonePe merchant account
- [ ] Configure environment variables
- [ ] Set up webhook URL in PhonePe dashboard
- [ ] Test payment flow in UAT environment
- [ ] Deploy to production
- [ ] Monitor webhook delivery
- [ ] Test refund functionality
