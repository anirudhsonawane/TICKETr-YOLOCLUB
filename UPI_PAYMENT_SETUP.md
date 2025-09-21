# UPI Payment Integration Setup

This document describes how to set up UPI payments for the TICKETr application.

## Overview

The UPI integration allows users to pay for event tickets using UPI deep links and QR codes. This is a simple, direct payment method that doesn't require a payment gateway.

## Features

- **UPI Deep Links**: Generate clickable UPI payment links
- **QR Code Generation**: Create QR codes for easy payment scanning
- **Multiple UPI Apps Support**: Works with GPay, PhonePe, Paytm, BHIM, and other UPI apps
- **Payment Session Tracking**: Track payment sessions in the database
- **Development Mode**: Simulate payments for testing

## Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
# UPI Configuration
NEXT_PUBLIC_UPI_ID=yourname@bank
```

### UPI ID Examples

```bash
# For Paytm
NEXT_PUBLIC_UPI_ID=yourname@paytm

# For PhonePe
NEXT_PUBLIC_UPI_ID=yourname@ybl

# For GPay
NEXT_PUBLIC_UPI_ID=yourname@okaxis

# For BHIM
NEXT_PUBLIC_UPI_ID=yourname@upi
```

## How It Works

### 1. UPI Deep Link Generation

The system generates UPI deep links in the format:
```
upi://pay?pa=your-vpa@bank&pn=Merchant%20Name&am=750&cu=INR&tn=Payment%20Note
```

Parameters:
- `pa` – Your UPI ID (VPA)
- `pn` – Payee name (URL-encoded)
- `am` – Amount
- `cu` – Currency (INR)
- `tn` – Payment note/description

### 2. QR Code Generation

The same UPI link is encoded into a QR code that users can scan with any UPI app.

### 3. Payment Flow

1. User clicks "Pay via UPI" or scans QR code
2. UPI app opens with pre-filled payment details
3. User completes payment in their UPI app
4. Payment is processed directly to your bank account

## API Endpoints

### Create UPI Payment
- **Endpoint**: `POST /api/create-upi-payment`
- **Purpose**: Generates UPI payment link and creates payment session
- **Request Body**:
  ```json
  {
    "amount": 750,
    "eventId": "event_id",
    "userId": "user_id",
    "quantity": 1,
    "passId": "pass_id",
    "customerName": "Customer Name",
    "customerPhone": "9876543210",
    "upiId": "yourname@bank"
  }
  ```

### Get Payment Details
- **Endpoint**: `GET /api/create-upi-payment?paymentId=payment_id`
- **Purpose**: Retrieves payment session details

## Components

### UPIPayment Component

Located at `src/components/UPIPayment.tsx`, this component provides the UI for UPI payments.

**Props**:
- `amount`: Payment amount in rupees
- `eventName`: Name of the event
- `customerName`: Customer's name (optional)
- `customerPhone`: Customer's phone number (optional)
- `onSuccess`: Success callback
- `onError`: Error callback

**Features**:
- UPI ID configuration
- Deep link generation
- QR code display
- Copy to clipboard functionality
- Payment instructions

## Payment Verification

Since UPI payments are direct bank transfers, verification must be done manually:

1. Check your bank account for incoming payments
2. Match payment amount and reference note
3. Manually update payment status in the system
4. Generate tickets for verified payments

## Security Considerations

- **UPI ID Only**: Never share UPI PIN or passwords
- **Amount Verification**: Always verify payment amounts manually
- **Session Tracking**: Use payment sessions to track transactions
- **Expiration**: Payment sessions expire after 30 minutes

## Development Mode

In development mode (`NODE_ENV=development`), the component includes a "Simulate Payment" button for testing without actual payments.

## Supported UPI Apps

- Google Pay (GPay)
- PhonePe
- Paytm
- BHIM
- Amazon Pay
- Any UPI-enabled app

## Troubleshooting

### Common Issues

1. **UPI ID Not Working**: Ensure the UPI ID is correctly formatted and active
2. **QR Code Not Scanning**: Check if the UPI link is properly generated
3. **Payment Not Opening**: Verify UPI app is installed and default for UPI links

### Testing

1. Set `NODE_ENV=development`
2. Use the "Simulate Payment" button
3. Test with different UPI apps
4. Verify QR code generation

## Production Deployment

1. Set `NEXT_PUBLIC_UPI_ID` to your actual UPI ID
2. Remove development mode features
3. Set up manual payment verification process
4. Monitor payment sessions for completion

## Manual Payment Verification Process

Since there's no automatic webhook for UPI payments, implement a manual verification process:

1. **Admin Dashboard**: Create an admin panel to view pending payments
2. **Bank Reconciliation**: Regular bank statement checks
3. **Payment Matching**: Match payments by amount and timestamp
4. **Status Updates**: Update payment status and generate tickets
5. **Notifications**: Notify customers of successful payments
