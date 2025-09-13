# MongoDB Setup for TICKETr

This document explains how to set up MongoDB for the TICKETr application's payment session management.

## Prerequisites

1. **MongoDB Database**: Either local MongoDB or MongoDB Atlas
2. **Node.js Dependencies**: mongoose and @types/mongoose

## Installation

```bash
npm install mongoose @types/mongoose
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ticketr
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticketr
```

## Database Schema

### PaymentSessions Collection

The `PaymentSessions` collection stores payment session data with the following schema:

```typescript
{
  sessionId: string,           // Unique identifier (orderId or paymentId)
  userId: string,              // User ID from Clerk
  eventId: string,             // Event ID
  amount: number,              // Payment amount
  quantity: number,            // Number of tickets
  passId?: string,             // Optional pass ID
  selectedDate?: string,       // Optional selected date
  couponCode?: string,         // Optional coupon code
  waitingListId?: string,      // Optional waiting list ID
  paymentMethod: string,       // 'razorpay', 'phonepe', or 'upi'
  status: string,              // 'pending', 'completed', 'failed', 'expired'
  createdAt: Date,             // Creation timestamp
  expiresAt: Date,             // Expiration timestamp (30 minutes)
  metadata: object             // Additional payment data
}
```

## Indexes

The following indexes are automatically created:

- `sessionId` (unique)
- `userId`
- `eventId`
- `status`
- `expiresAt` (TTL index - auto-deletes after 7 days)

## API Endpoints

### Payment Sessions

- `POST /api/payment-sessions` - Create payment session
- `GET /api/payment-sessions?sessionId=xxx` - Get payment session
- `PUT /api/payment-sessions` - Update payment session status

### Cleanup

- `POST /api/cleanup-sessions` - Clean up expired sessions
- `GET /api/cleanup-sessions` - Get cleanup endpoint info

## Usage Examples

### Create Payment Session

```javascript
const response = await fetch('/api/payment-sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'TICKET_1234567890_ABC123',
    userId: 'user_123',
    eventId: 'event_456',
    amount: 1000,
    quantity: 1,
    paymentMethod: 'phonepe',
    metadata: { orderId: 'phonepe_order_123' }
  })
});
```

### Get Payment Session

```javascript
const response = await fetch('/api/payment-sessions?sessionId=TICKET_1234567890_ABC123');
const data = await response.json();
console.log(data.session);
```

### Update Session Status

```javascript
const response = await fetch('/api/payment-sessions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'TICKET_1234567890_ABC123',
    status: 'completed',
    metadata: { ticketIds: ['ticket_1', 'ticket_2'] }
  })
});
```

## Service Class

The `PaymentSessionService` class provides methods for:

- `createSession()` - Create new payment session
- `getSession()` - Get session by ID
- `updateSessionStatus()` - Update session status
- `getUserSessions()` - Get user's payment history
- `cleanupExpiredSessions()` - Clean up expired sessions

## Automatic Cleanup

The database automatically deletes expired documents after 7 days using MongoDB's TTL (Time To Live) feature.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "details": "Detailed error message"
}
```

## Development vs Production

### Development
- Use local MongoDB: `mongodb://localhost:27017/ticketr`
- Enable detailed logging
- Manual cleanup as needed

### Production
- Use MongoDB Atlas or managed MongoDB
- Set up automated cleanup (cron job)
- Monitor database performance
- Set up proper backup strategies

## Troubleshooting

### Connection Issues
- Verify `MONGODB_URI` is correct
- Check network connectivity
- Ensure MongoDB is running

### Performance Issues
- Check index usage
- Monitor query performance
- Consider connection pooling

### Data Issues
- Verify schema validation
- Check for duplicate sessionIds
- Monitor TTL cleanup

## Security Considerations

1. **Connection String**: Store MongoDB URI in environment variables
2. **Network Access**: Restrict database access to application servers
3. **Authentication**: Use MongoDB authentication
4. **Data Validation**: Validate all input data
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Monitoring

Monitor the following metrics:

- Connection pool usage
- Query performance
- Index usage
- Document count and growth
- TTL cleanup frequency
- Error rates

## Backup Strategy

1. **Regular Backups**: Set up automated daily backups
2. **Point-in-Time Recovery**: Enable oplog for point-in-time recovery
3. **Cross-Region Replication**: For high availability
4. **Test Restores**: Regularly test backup restoration

This MongoDB setup provides a robust, scalable solution for managing payment sessions in the TICKETr application.
