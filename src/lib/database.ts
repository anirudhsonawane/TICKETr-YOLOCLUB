import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';
import { Event, Pass, Ticket, WaitingList, User, Coupon, EmailLog, UPIPayment } from './models';

export class DatabaseService {
  private db: any;

  constructor() {
    this.init();
  }

  private async init() {
    this.db = await getDatabase();
  }

  // Events
  async createEvent(eventData: Omit<Event, '_id'>): Promise<ObjectId> {
    const result = await this.db.collection('events').insertOne({
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result.insertedId;
  }

  async getEvent(eventId: string | ObjectId): Promise<Event | null> {
    const id = typeof eventId === 'string' ? new ObjectId(eventId) : eventId;
    return await this.db.collection('events').findOne({ _id: id });
  }

  async getEventsByUser(userId: string): Promise<Event[]> {
    return await this.db.collection('events').find({ userId }).toArray();
  }

  async updateEvent(eventId: string | ObjectId, updateData: Partial<Event>): Promise<boolean> {
    const id = typeof eventId === 'string' ? new ObjectId(eventId) : eventId;
    const result = await this.db.collection('events').updateOne(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // Passes
  async createPass(passData: Omit<Pass, '_id'>): Promise<ObjectId> {
    const result = await this.db.collection('passes').insertOne({
      ...passData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result.insertedId;
  }

  async getPass(passId: string | ObjectId): Promise<Pass | null> {
    const id = typeof passId === 'string' ? new ObjectId(passId) : passId;
    return await this.db.collection('passes').findOne({ _id: id });
  }

  async getPassesByEvent(eventId: string | ObjectId): Promise<Pass[]> {
    const id = typeof eventId === 'string' ? new ObjectId(eventId) : eventId;
    return await this.db.collection('passes').find({ eventId: id }).toArray();
  }

  async updatePass(passId: string | ObjectId, updateData: Partial<Pass>): Promise<boolean> {
    const id = typeof passId === 'string' ? new ObjectId(passId) : passId;
    const result = await this.db.collection('passes').updateOne(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // Tickets
  async createTicket(ticketData: Omit<Ticket, '_id'>): Promise<ObjectId> {
    const result = await this.db.collection('tickets').insertOne({
      ...ticketData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result.insertedId;
  }

  async getTicket(ticketId: string | ObjectId): Promise<Ticket | null> {
    const id = typeof ticketId === 'string' ? new ObjectId(ticketId) : ticketId;
    return await this.db.collection('tickets').findOne({ _id: id });
  }

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    return await this.db.collection('tickets').find({ userId }).toArray();
  }

  async getTicketsByEvent(eventId: string | ObjectId): Promise<Ticket[]> {
    const id = typeof eventId === 'string' ? new ObjectId(eventId) : eventId;
    return await this.db.collection('tickets').find({ eventId: id }).toArray();
  }

  async getTicketsByPaymentIntent(paymentIntentId: string): Promise<Ticket[]> {
    return await this.db.collection('tickets').find({ paymentIntentId }).toArray();
  }

  async updateTicket(ticketId: string | ObjectId, updateData: Partial<Ticket>): Promise<boolean> {
    const id = typeof ticketId === 'string' ? new ObjectId(ticketId) : ticketId;
    const result = await this.db.collection('tickets').updateOne(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // Waiting List
  async createWaitingListEntry(entryData: Omit<WaitingList, '_id'>): Promise<ObjectId> {
    const result = await this.db.collection('waitingList').insertOne({
      ...entryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result.insertedId;
  }

  async getWaitingListEntriesByUserAndEvent(userId: string, eventId: string | ObjectId): Promise<WaitingList[]> {
    const id = typeof eventId === 'string' ? new ObjectId(eventId) : eventId;
    return await this.db.collection('waitingList').find({ userId, eventId: id }).toArray();
  }

  async updateWaitingListEntry(entryId: string | ObjectId, updateData: Partial<WaitingList>): Promise<boolean> {
    const id = typeof entryId === 'string' ? new ObjectId(entryId) : entryId;
    const result = await this.db.collection('waitingList').updateOne(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // Users
  async createUser(userData: Omit<User, '_id'>): Promise<ObjectId> {
    const result = await this.db.collection('users').insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result.insertedId;
  }

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    return await this.db.collection('users').findOne({ userId: clerkId });
  }

  async updateUser(clerkId: string, updateData: Partial<User>): Promise<boolean> {
    const result = await this.db.collection('users').updateOne(
      { userId: clerkId },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // Coupons
  async getCouponByCode(code: string): Promise<Coupon | null> {
    return await this.db.collection('coupons').findOne({ code });
  }

  async updateCoupon(couponId: string | ObjectId, updateData: Partial<Coupon>): Promise<boolean> {
    const id = typeof couponId === 'string' ? new ObjectId(couponId) : couponId;
    const result = await this.db.collection('coupons').updateOne(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // Email Logs
  async createEmailLog(logData: Omit<EmailLog, '_id'>): Promise<ObjectId> {
    const result = await this.db.collection('emailLogs').insertOne({
      ...logData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result.insertedId;
  }

  // UPI Payments
  async createUPIPayment(paymentData: Omit<UPIPayment, '_id'>): Promise<ObjectId> {
    const result = await this.db.collection('upi_payments').insertOne({
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result.insertedId;
  }

  async getUPIPaymentByUid(uid: string): Promise<UPIPayment | null> {
    return await this.db.collection('upi_payments').findOne({ uid });
  }
}

// Export a singleton instance
export const db = new DatabaseService();
