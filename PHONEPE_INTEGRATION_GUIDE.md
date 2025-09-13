# PhonePe Integration Guide

This guide provides comprehensive documentation for the PhonePe payment integration implemented in the TICKETr application.

## Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Configuration](#configuration)
4. [API Endpoints](#api-endpoints)
5. [Error Handling](#error-handling)
6. [Webhook Integration](#webhook-integration)
7. [Reconciliation](#reconciliation)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

## Overview

The PhonePe integration provides:
- Payment initiation using Standard Checkout
- SDK order creation for mobile apps
- Order status checking and reconciliation
- Refund processing
- Webhook validation and handling
- Comprehensive error handling
- Environment-specific configuration

## Installation & Setup

### 1. Install Dependencies

```bash
npm install pg-sdk-node
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required - PhonePe Credentials
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret

# Optional - Client Configuration
PHONEPE_CLIENT_VERSION=1.0
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pgsandbox

# Webhook Configuration
PHONEPE_WEBHOOK_USERNAME=your_webhook_username
PHONEPE_WEBHOOK_PASSWORD=your_webhook_password
PHONEPE_WEBHOOK_URL=https://yourdomain.com/api/webhooks/phonepe

# Feature Flags
BYPASS_PHONEPE=false
PHONEPE_ENABLE_LOGGING=true
PHONEPE_ENABLE_RECONCILIATION=true
PHONEPE_ENABLE_WEBHOOK_VALIDATION=true

# Reconciliation Settings
PHONEPE_MAX_RETRIES=10
PHONEPE_RETRY_DELAY=3000
PHONEPE_SCHEDULED_RECONCILIATION=false

# Security
PHONEPE_ALLOWED_ORIGINS=localhost:3000,yourdomain.com
```

### 3. Environment-Specific Configuration

#### Development
- Uses SANDBOX environment
- Bypass mode enabled by default
- Detailed logging enabled
- Reconciliation disabled

#### Staging
- Uses SANDBOX environment
- Bypass mode disabled
- Detailed logging enabled
- Reconciliation enabled

#### Production
- Uses PRODUCTION environment
- Bypass mode disabled
- Logging disabled
- Full reconciliation enabled

## Configuration

### Using the Configuration Manager

```typescript
import { phonePeConfig } from '@/lib/phonepe-config';

// Get full configuration
const config = phonePeConfig.getConfig();

// Check if feature is enabled
const isLoggingEnabled = phonePeConfig.isFeatureEnabled('enableLogging');

// Get environment settings
const envSettings = phonePeConfig.getEnvironmentSettings();
```

### Environment Detection

The system automatically detects the environment based on `NODE_ENV`:
- `development` → SANDBOX with bypass mode
- `staging` → SANDBOX with full features
- `production` → PRODUCTION with full features

## API Endpoints

### 1. Create Payment Order

**Endpoint:** `POST /api/create-phonepe-order`

**Request Body:**
```json
{
  "amount": 1000,
  "eventId": "event_123",
  "userId": "user_456",
  "quantity": 1,
  "passId": "pass_789",
  "couponCode": "DISCOUNT10",
  "selectedDate": "2024-01-15",
  "waitingListId": "wait_101"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "TICKET_1234567890_ABC123",
  "amount": 100000,
  "currency": "INR",
  "redirectUrl": "https://merchant.phonepe.com/checkout/...",
  "merchantOrderId": "TICKET_1234567890_ABC123",
  "state": "PENDING",
  "expireAt": 1640995200000,
  "metaInfo": {
    "eventId": "event_123",
    "userId": "user_456",
    "quantity": "1"
  }
}
```

### 2. Create SDK Order (Mobile)

**Endpoint:** `POST /api/phonepe/sdk-order`

**Request Body:**
```json
{
  "amount": 1000,
  "eventId": "event_123",
  "userId": "user_456",
  "redirectUrl": "https://yourapp.com/success"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "TICKET_1234567890_ABC123",
  "token": "sdk_token_123456789",
  "state": "PENDING",
  "expireAt": 1640995200000,
  "amount": 100000,
  "currency": "INR",
  "redirectUrl": "https://yourapp.com/success",
  "merchantOrderId": "TICKET_1234567890_ABC123"
}
```

### 3. Check Order Status

**Endpoint:** `GET /api/phonepe/order-status?merchantOrderId=TICKET_123&details=true`

**Response:**
```json
{
  "success": true,
  "orderId": "phonepe_order_123",
  "merchantOrderId": "TICKET_123",
  "state": "COMPLETED",
  "amount": 100000,
  "expireAt": 1640995200000,
  "isTerminal": true,
  "statusInfo": {
    "isPending": false,
    "isCompleted": true,
    "isFailed": false,
    "needsReconciliation": false
  }
}
```

### 4. Initiate Refund

**Endpoint:** `POST /api/phonepe/refund`

**Request Body:**
```json
{
  "originalMerchantOrderId": "TICKET_123",
  "amount": 50000,
  "merchantRefundId": "REFUND_456",
  "reason": "Customer requested refund"
}
```

**Response:**
```json
{
  "success": true,
  "refundId": "phonepe_refund_789",
  "merchantRefundId": "REFUND_456",
  "originalMerchantOrderId": "TICKET_123",
  "state": "PENDING",
  "amount": 50000,
  "reason": "Customer requested refund"
}
```

### 5. Check Refund Status

**Endpoint:** `GET /api/phonepe/refund?refundId=REFUND_456`

**Response:**
```json
{
  "success": true,
  "refundId": "phonepe_refund_789",
  "merchantRefundId": "REFUND_456",
  "state": "COMPLETED",
  "amount": 50000,
  "isTerminal": true
}
```

## Error Handling

### Error Types

The integration provides comprehensive error handling with the following error types:

- `CONFIGURATION_ERROR` - Missing or invalid configuration
- `AUTHENTICATION_ERROR` - Invalid credentials
- `VALIDATION_ERROR` - Invalid request parameters
- `API_ERROR` - PhonePe API errors
- `NETWORK_ERROR` - Network connectivity issues
- `TIMEOUT_ERROR` - Request timeout
- `RATE_LIMIT_ERROR` - API rate limiting
- `INSUFFICIENT_FUNDS_ERROR` - Insufficient funds
- `INVALID_AMOUNT_ERROR` - Invalid amount
- `ORDER_NOT_FOUND_ERROR` - Order not found
- `REFUND_NOT_FOUND_ERROR` - Refund not found
- `WEBHOOK_VALIDATION_ERROR` - Webhook validation failed

### Error Severity Levels

- `CRITICAL` - System cannot function
- `HIGH` - Major functionality affected
- `MEDIUM` - Some functionality affected
- `LOW` - Minor issues

### Using Error Handler

```typescript
import { phonePeErrorHandler, PhonePeIntegrationError } from '@/lib/phonepe-errors';

try {
  // PhonePe operation
} catch (error) {
  if (error instanceof PhonePeException) {
    const integrationError = phonePeErrorHandler.handlePhonePeException(error);
    // Handle based on error type and severity
  }
}
```

## Webhook Integration

### Webhook Endpoint

**Endpoint:** `POST /api/webhooks/phonepe`

The webhook automatically handles:
- Order completion notifications
- Order failure notifications
- Refund completion notifications
- Refund failure notifications
- Refund acceptance notifications

### Webhook Validation

The webhook validates incoming requests using:
- Authorization header verification
- Request body validation
- PhonePe SDK validation

### Webhook Security

1. **Authorization Header**: Must match SHA256(username:password)
2. **Request Validation**: Validates using PhonePe SDK
3. **Origin Validation**: Checks against allowed origins
4. **Rate Limiting**: Prevents abuse

### Webhook Response

```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "type": "CHECKOUT_ORDER_COMPLETED",
  "orderId": "phonepe_order_123",
  "state": "COMPLETED"
}
```

## Reconciliation

### Automatic Reconciliation

The system automatically reconciles pending transactions using PhonePe's recommended schedule:

1. **First 20-25 seconds**: Check every 3 seconds
2. **Next 30 seconds**: Check every 6 seconds
3. **Next 60 seconds**: Check every 10 seconds
4. **Next 60 seconds**: Check every 30 seconds
5. **After that**: Check every 1 minute until terminal state

### Manual Reconciliation

```typescript
import { reconcilePaymentOrder, reconcileRefundOrder } from '@/lib/phonepe-reconciliation';

// Reconcile payment order
const result = await reconcilePaymentOrder('TICKET_123', {
  maxRetries: 10,
  retryDelay: 3000
});

// Reconcile refund order
const refundResult = await reconcileRefundOrder('REFUND_456', {
  maxRetries: 5,
  retryDelay: 2000
});
```

### Batch Reconciliation

```typescript
import { batchReconcilePaymentOrders } from '@/lib/phonepe-reconciliation';

const results = await batchReconcilePaymentOrders([
  'TICKET_123',
  'TICKET_456',
  'TICKET_789'
]);
```

## Testing

### 1. UAT Sandbox Testing

For UAT testing, use the PhonePe Test App:

**Android:** Download from PhonePe
**iOS:** Request access from PhonePe integration team

### 2. Test Scenarios

#### Payment Testing
- **Success**: Use `success@ybl` as UPI ID
- **Failure**: Use `failed@ybl` as UPI ID
- **Pending**: Use `pending@ybl` as UPI ID

#### Card Testing
- **Credit Card**: 4208 5851 9011 6667 (Exp: 06/2027, CVV: 508)
- **Debit Card**: 4242 4242 4242 4242 (Exp: 12/2023, CVV: 936)

### 3. Mock Mode

Enable mock mode for development:

```env
BYPASS_PHONEPE=true
```

This returns mock responses without calling PhonePe APIs.

## Production Deployment

### 1. Environment Setup

```env
NODE_ENV=production
PHONEPE_CLIENT_ID=your_production_client_id
PHONEPE_CLIENT_SECRET=your_production_client_secret
PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg
BYPASS_PHONEPE=false
PHONEPE_ENABLE_LOGGING=false
```

### 2. Webhook Configuration

Configure webhook URL in PhonePe Business Dashboard:
- **URL**: `https://yourdomain.com/api/webhooks/phonepe`
- **Username**: Your webhook username
- **Password**: Your webhook password

### 3. Security Checklist

- [ ] Webhook validation enabled
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error monitoring setup
- [ ] Logging configured
- [ ] Reconciliation enabled

## Troubleshooting

### Common Issues

#### 1. Configuration Errors

**Error**: `PhonePe credentials are missing`

**Solution**: Ensure `PHONEPE_CLIENT_ID` and `PHONEPE_CLIENT_SECRET` are set.

#### 2. Webhook Validation Failures

**Error**: `Webhook validation failed`

**Solution**: 
- Check webhook credentials
- Verify authorization header format
- Ensure webhook URL is accessible

#### 3. Order Status Issues

**Error**: `Order not found`

**Solution**:
- Verify merchant order ID
- Check if order exists in PhonePe
- Ensure proper order creation

#### 4. Refund Failures

**Error**: `Refund amount exceeds order amount`

**Solution**:
- Verify refund amount
- Check original order amount
- Ensure refund is not already processed

### Debug Mode

Enable debug logging:

```env
PHONEPE_ENABLE_LOGGING=true
NODE_ENV=development
```

### Error Monitoring

Monitor errors using the error handler:

```typescript
import { phonePeErrorHandler } from '@/lib/phonepe-errors';

// Get error statistics
const stats = phonePeErrorHandler.getErrorStats();

// Get recent errors
const recentErrors = phonePeErrorHandler.getRecentErrors(10);
```

## Support

For additional support:
1. Check PhonePe documentation
2. Review error logs
3. Contact PhonePe integration team
4. Check this guide for common solutions

## Changelog

### Version 1.0.0
- Initial PhonePe integration
- Standard Checkout implementation
- SDK order creation
- Webhook handling
- Reconciliation system
- Error handling
- Configuration management
