import MongoDBService from './mongodb-service';

// This file provides MongoDB-based data fetching functions that can replace Convex queries
// We'll create React hooks that use these functions

export class MongoDBDataService {
  // Events
  static async getEvents() {
    return await MongoDBService.getEvents();
  }

  static async getEventById(eventId: string) {
    return await MongoDBService.getEventById(eventId);
  }

  static async getEventsByUserId(userId: string) {
    return await MongoDBService.getEventsByUserId(userId);
  }

  static async createEvent(eventData: any) {
    return await MongoDBService.createEvent(eventData);
  }

  static async updateEvent(eventId: string, updateData: any) {
    return await MongoDBService.updateEvent(eventId, updateData);
  }

  static async getEventAvailability(eventId: string) {
    return await MongoDBService.getEventAvailability(eventId);
  }

  static async checkAvailability(eventId: string) {
    return await MongoDBService.checkAvailability(eventId);
  }

  // Passes
  static async getEventPasses(eventId: string) {
    return await MongoDBService.getEventPasses(eventId);
  }

  static async getPassById(passId: string) {
    return await MongoDBService.getPassById(passId);
  }

  static async createPass(passData: any) {
    return await MongoDBService.createPass(passData);
  }

  static async updatePass(passId: string, updateData: any) {
    return await MongoDBService.updatePass(passId, updateData);
  }

  static async deletePass(passId: string) {
    return await MongoDBService.deletePass(passId);
  }

  // Tickets
  static async getUserTickets(userId: string) {
    return await MongoDBService.getUserTickets(userId);
  }

  static async getTicketById(ticketId: string) {
    return await MongoDBService.getTicketById(ticketId);
  }

  static async getUserTicketsForEvent(userId: string, eventId: string) {
    return await MongoDBService.getUserTicketsForEvent(eventId, userId);
  }

  static async getUserTicketForEvent(userId: string, eventId: string) {
    return await MongoDBService.getUserTicketForEvent(eventId, userId);
  }

  static async getEventTickets(eventId: string, ownerId: string) {
    return await MongoDBService.getEventTickets(eventId, ownerId);
  }

  static async getTicketStatus(ticketId: string) {
    return await MongoDBService.getTicketStatus(ticketId);
  }

  static async getTicketWithDetails(ticketId: string) {
    return await MongoDBService.getTicketWithDetails(ticketId);
  }

  static async scanTicket(ticketId: string, scannerId?: string) {
    return await MongoDBService.scanTicket(ticketId, scannerId || 'system');
  }

  // Waiting List
  static async getQueuePosition(eventId: string, userId: string) {
    return await MongoDBService.getQueuePosition(eventId, userId);
  }

  static async joinWaitingList(eventId: string, userId: string, passId?: string) {
    return await MongoDBService.joinWaitingList(eventId, userId, passId);
  }

  static async releaseTicket(eventId: string, waitingListId: string) {
    return await MongoDBService.releaseTicket(eventId, waitingListId);
  }

  // Users
  static async getUserById(userId: string) {
    return await MongoDBService.getUserById(userId);
  }

  static async updateUser(userId: string, name: string, email: string) {
    return await MongoDBService.updateUser(userId, name, email);
  }

  static async getUsersStripeConnectId(userId: string) {
    return await MongoDBService.getUsersStripeConnectId(userId);
  }

  // Coupons
  static async getCouponByCode(code: string) {
    return await MongoDBService.getCouponByCode(code);
  }

  static async validateCoupon(code: string) {
    return await MongoDBService.validateCoupon(code);
  }

  static async calculateDiscountedAmount(code: string, amount: number, userId?: string, eventId?: string) {
    return await MongoDBService.calculateDiscountedAmount(code, amount, userId, eventId);
  }

  static async ensureCouponExists(code: string, discountPercentage: number) {
    return await MongoDBService.createCoupon({
      code,
      discountPercentage,
      isActive: true,
      validFrom: Date.now(),
      validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000,
      maxUses: 1000,
      currentUses: 0,
      description: `${code} gives ${discountPercentage}% off`,
      usedByUsers: [],
      usedByUserEvent: []
    });
  }

  static async incrementCouponUsage(code: string, userId?: string, couponId?: string, eventId?: string) {
    return await MongoDBService.incrementCouponUsage(code, userId, couponId, eventId);
  }

  // Storage (placeholder - you might want to implement file storage differently)
  static async generateUploadUrl() {
    // This would need to be implemented based on your file storage solution
    return { uploadUrl: '/api/upload' };
  }

  static async getUrl(storageId: string) {
    // This would need to be implemented based on your file storage solution
    return `/api/files/${storageId}`;
  }
}
