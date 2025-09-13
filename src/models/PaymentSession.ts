import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentSession extends Document {
  sessionId: string;
  userId: string;
  eventId: string;
  amount: number;
  quantity: number;
  passId?: string;
  selectedDate?: string;
  couponCode?: string;
  waitingListId?: string;
  paymentMethod: 'razorpay' | 'phonepe' | 'upi';
  status: 'pending' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  metadata?: any;
}

const PaymentSessionSchema = new Schema<IPaymentSession>({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  passId: {
    type: String,
    required: false
  },
  selectedDate: {
    type: String,
    required: false
  },
  couponCode: {
    type: String,
    required: false
  },
  waitingListId: {
    type: String,
    required: false
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'phonepe', 'upi'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
});

// Create indexes
PaymentSessionSchema.index({ sessionId: 1 });
PaymentSessionSchema.index({ userId: 1 });
PaymentSessionSchema.index({ eventId: 1 });
PaymentSessionSchema.index({ status: 1 });

// TTL index to automatically delete expired documents after 7 days
PaymentSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days

export default mongoose.models.PaymentSession || mongoose.model<IPaymentSession>('PaymentSession', PaymentSessionSchema);
