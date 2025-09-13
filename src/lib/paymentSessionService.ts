import connectDB from './mongodb';
import PaymentSession, { IPaymentSession } from '../models/PaymentSession';

export class PaymentSessionService {
  // Create a payment session
  static async createSession(sessionData: {
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
    metadata?: any;
  }): Promise<IPaymentSession> {
    await connectDB();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (30 * 60 * 1000)); // 30 minutes from now

    // Check if session already exists
    const existingSession = await PaymentSession.findOne({ sessionId: sessionData.sessionId });
    
    if (existingSession) {
      // Update existing session
      existingSession.status = 'pending';
      existingSession.createdAt = now;
      existingSession.expiresAt = expiresAt;
      existingSession.amount = sessionData.amount;
      existingSession.quantity = sessionData.quantity;
      existingSession.passId = sessionData.passId;
      existingSession.selectedDate = sessionData.selectedDate;
      existingSession.couponCode = sessionData.couponCode;
      existingSession.waitingListId = sessionData.waitingListId;
      existingSession.paymentMethod = sessionData.paymentMethod;
      existingSession.metadata = { ...existingSession.metadata, ...sessionData.metadata };
      
      await existingSession.save();
      return existingSession;
    }

    // Create new session
    const session = new PaymentSession({
      ...sessionData,
      status: 'pending',
      createdAt: now,
      expiresAt,
    });

    await session.save();
    return session;
  }

  // Get payment session by session ID
  static async getSession(sessionId: string): Promise<IPaymentSession | null> {
    await connectDB();

    const session = await PaymentSession.findOne({ sessionId });

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (session.expiresAt < new Date() && session.status === 'pending') {
      session.status = 'expired';
      await session.save();
      return session;
    }

    return session;
  }

  // Update payment session status
  static async updateSessionStatus(
    sessionId: string, 
    status: 'pending' | 'completed' | 'failed' | 'expired',
    metadata?: any
  ): Promise<IPaymentSession | null> {
    await connectDB();

    const session = await PaymentSession.findOne({ sessionId });

    if (!session) {
      return null;
    }

    session.status = status;
    if (metadata) {
      session.metadata = { ...session.metadata, ...metadata };
    }

    await session.save();
    return session;
  }

  // Get user's payment sessions
  static async getUserSessions(userId: string): Promise<IPaymentSession[]> {
    await connectDB();

    return await PaymentSession.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<number> {
    await connectDB();

    const now = new Date();
    const result = await PaymentSession.updateMany(
      { 
        expiresAt: { $lt: now },
        status: 'pending'
      },
      { status: 'expired' }
    );

    console.log(`Cleaned up ${result.modifiedCount} expired payment sessions`);
    return result.modifiedCount;
  }

  // Get payment session with event details (you'll need to implement event fetching)
  static async getSessionWithEvent(sessionId: string): Promise<any> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return null;
    }

    // Here you would typically fetch event details from your events collection
    // For now, we'll return the session with a placeholder for event
    return {
      ...session.toObject(),
      event: {
        name: 'Event Name', // You'll need to fetch this from your events collection
        // Add other event fields as needed
      }
    };
  }
}
