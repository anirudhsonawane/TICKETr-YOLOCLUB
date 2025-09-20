import { ObjectId } from 'mongodb';

export interface Event {
  _id?: ObjectId;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  endDate?: number;
  eventType?: string;
  price: number;
  totalTickets: number;
  userId: string;
  is_cancelled?: boolean;
  imageStorageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Pass {
  _id?: ObjectId;
  eventId: ObjectId;
  name: string;
  description: string;
  price: number;
  totalQuantity: number;
  soldQuantity: number;
  benefits: string[];
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Ticket {
  _id?: ObjectId;
  eventId: ObjectId;
  userId: string;
  uid?: string;
  purchasedAt: number;
  status: 'valid' | 'used' | 'refunded' | 'cancelled';
  paymentIntentId: string;
  amount: number;
  scannedAt?: number;
  passId?: ObjectId;
  ticketType?: string;
  ticketTier?: string;
  scanLimit?: number;
  selectedDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WaitingList {
  _id?: ObjectId;
  eventId: ObjectId;
  userId: string;
  status: 'waiting' | 'offered' | 'purchased' | 'expired';
  offerExpiresAt?: number;
  passId?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  _id?: ObjectId;
  userId: string;
  email: string;
  name: string;
  stripeConnectId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Coupon {
  _id?: ObjectId;
  userId?: string;
  code: string;
  discountPercentage?: number;
  isActive?: boolean;
  validFrom?: number;
  validUntil?: number;
  maxUses?: number;
  currentUses?: number;
  description?: string;
  usedByUsers?: string[];
  usedByUserEvent?: Array<{
    userId: string;
    eventId: ObjectId;
    usedAt: number;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailLog {
  _id?: ObjectId;
  userId: string;
  userEmail: string;
  ticketIds: ObjectId[];
  eventId: ObjectId;
  purchaseId: string;
  sentAt: number;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UPIPayment {
  _id?: ObjectId;
  uid: string;
  eventId: ObjectId;
  userId: string;
  amount: number;
  timestamp: number;
  createdAt?: Date;
  updatedAt?: Date;
}
