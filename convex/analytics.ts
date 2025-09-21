import { query } from "./_generated/server";
import { v } from "convex/values";

// Get overall analytics
export const getOverallAnalytics = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Get all events
      const events = await ctx.db.query("events").collect();
      
      // Get all tickets
      const tickets = await ctx.db.query("tickets").collect();
      
      // Get all payment notifications
      const paymentNotifications = await ctx.db.query("paymentNotifications").collect();
      
      // Get all users
      const users = await ctx.db.query("users").collect();
      
      // Calculate overall stats
      const totalEvents = events.length;
      const totalTickets = tickets.length;
      const totalUsers = users.length;
      const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.amount || 0), 0);
      
      // Payment notification stats
      const pendingPayments = paymentNotifications.filter(p => p.status === "pending").length;
      const verifiedPayments = paymentNotifications.filter(p => p.status === "verified").length;
      const rejectedPayments = paymentNotifications.filter(p => p.status === "rejected").length;
      
      // Get payment verifications (with error handling)
      let paymentVerifications = [];
      try {
        paymentVerifications = await ctx.db.query("paymentVerifications").collect();
      } catch (error) {
        console.error("Error fetching payment verifications:", error);
        paymentVerifications = [];
      }
      
      const verificationsRequested = paymentVerifications.length;
      const verificationsApproved = paymentVerifications.filter(v => v.status === "approved").length;
      const verificationsRejected = paymentVerifications.filter(v => v.status === "rejected").length;
      
      // Ticket status stats
      const scannedTickets = tickets.filter(t => t.isScanned).length;
      const unscannedTickets = tickets.filter(t => !t.isScanned).length;
      
      // Event status stats
      const activeEvents = events.filter(e => !e.is_cancelled).length;
      const cancelledEvents = events.filter(e => e.is_cancelled).length;
      
      return {
        totalEvents,
        totalTickets,
        totalUsers,
        totalRevenue,
        pendingPayments,
        verifiedPayments,
        rejectedPayments,
        verificationsRequested,
        verificationsApproved,
        verificationsRejected,
        scannedTickets,
        unscannedTickets,
        activeEvents,
        cancelledEvents,
      };
    } catch (error) {
      console.error("Error in getOverallAnalytics:", error);
      return {
        totalEvents: 0,
        totalTickets: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        verifiedPayments: 0,
        rejectedPayments: 0,
        verificationsRequested: 0,
        verificationsApproved: 0,
        verificationsRejected: 0,
        scannedTickets: 0,
        unscannedTickets: 0,
        activeEvents: 0,
        cancelledEvents: 0,
      };
    }
  },
});

// Get day-wise analytics for the last 30 days
export const getDayWiseAnalytics = query({
  args: {},
  handler: async (ctx) => {
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      // Get tickets created in last 30 days
      const recentTickets = await ctx.db
        .query("tickets")
        .filter((q) => q.gte(q.field("purchasedAt"), thirtyDaysAgo))
        .collect();
      
      // Get payment notifications from last 30 days
      const recentPayments = await ctx.db
        .query("paymentNotifications")
        .filter((q) => q.gte(q.field("_creationTime"), thirtyDaysAgo))
        .collect();
      
      // Get payment verifications from last 30 days (with error handling)
      let recentVerifications = [];
      try {
        recentVerifications = await ctx.db
          .query("paymentVerifications")
          .filter((q) => q.gte(q.field("_creationTime"), thirtyDaysAgo))
          .collect();
      } catch (error) {
        console.error("Error fetching payment verifications:", error);
        recentVerifications = [];
      }
    
    // Group by day
    const dayWiseData: { [key: string]: any } = {};
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dayWiseData[dateKey] = {
        date: dateKey,
        ticketsCreated: 0,
        ticketsScanned: 0,
        paymentsPending: 0,
        paymentsVerified: 0,
        paymentsRejected: 0,
        verificationsRequested: 0,
        verificationsApproved: 0,
        verificationsRejected: 0,
        revenue: 0,
        newUsers: 0,
      };
    }
    
    // Process tickets
    recentTickets.forEach(ticket => {
      const date = new Date(ticket.purchasedAt).toISOString().split('T')[0];
      if (dayWiseData[date]) {
        dayWiseData[date].ticketsCreated++;
        dayWiseData[date].revenue += ticket.amount || 0;
        if (ticket.isScanned) {
          dayWiseData[date].ticketsScanned++;
        }
      }
    });
    
    // Process payment notifications
    recentPayments.forEach(payment => {
      const date = new Date(payment._creationTime).toISOString().split('T')[0];
      if (dayWiseData[date]) {
        if (payment.status === "pending") {
          dayWiseData[date].paymentsPending++;
        } else if (payment.status === "verified") {
          dayWiseData[date].paymentsVerified++;
        } else if (payment.status === "rejected") {
          dayWiseData[date].paymentsRejected++;
        }
      }
    });
    
    // Process payment verifications
    recentVerifications.forEach(verification => {
      const date = new Date(verification._creationTime).toISOString().split('T')[0];
      if (dayWiseData[date]) {
        dayWiseData[date].verificationsRequested++;
        if (verification.status === "approved") {
          dayWiseData[date].verificationsApproved++;
        } else if (verification.status === "rejected") {
          dayWiseData[date].verificationsRejected++;
        }
      }
    });
    
    // Process users (approximate - using ticket creation as proxy for new users)
    const userFirstTicket: { [key: string]: number } = {};
    recentTickets.forEach(ticket => {
      if (!userFirstTicket[ticket.userId] || ticket.purchasedAt < userFirstTicket[ticket.userId]) {
        userFirstTicket[ticket.userId] = ticket.purchasedAt;
      }
    });
    
    Object.values(userFirstTicket).forEach(timestamp => {
      const date = new Date(timestamp).toISOString().split('T')[0];
      if (dayWiseData[date]) {
        dayWiseData[date].newUsers++;
      }
    });
    
      return Object.values(dayWiseData).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error("Error in getDayWiseAnalytics:", error);
      // Return empty data for last 30 days
      const dayWiseData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dayWiseData.push({
          date: dateKey,
          ticketsCreated: 0,
          ticketsScanned: 0,
          paymentsPending: 0,
          paymentsVerified: 0,
          paymentsRejected: 0,
          verificationsRequested: 0,
          verificationsApproved: 0,
          verificationsRejected: 0,
          revenue: 0,
          newUsers: 0,
        });
      }
      return dayWiseData;
    }
  },
});

// Get event-wise analytics
export const getEventAnalytics = query({
  args: {},
  handler: async (ctx) => {
    try {
      const events = await ctx.db.query("events").collect();
      const tickets = await ctx.db.query("tickets").collect();
      const paymentNotifications = await ctx.db.query("paymentNotifications").collect();
      
      return events.map(event => {
        const eventTickets = tickets.filter(t => t.eventId === event._id);
        const eventPayments = paymentNotifications.filter(p => p.eventId === event._id);
        
        const totalTickets = eventTickets.length;
        const scannedTickets = eventTickets.filter(t => t.isScanned).length;
        const totalRevenue = eventTickets.reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const pendingPayments = eventPayments.filter(p => p.status === "pending").length;
        const verifiedPayments = eventPayments.filter(p => p.status === "verified").length;
        const rejectedPayments = eventPayments.filter(p => p.status === "rejected").length;
        
        return {
          eventId: event._id,
          eventName: event.name,
          eventDate: event.eventDate,
          location: event.location,
          totalTickets,
          scannedTickets,
          totalRevenue,
          pendingPayments,
          verifiedPayments,
          rejectedPayments,
          isCancelled: event.is_cancelled,
        };
      }).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    } catch (error) {
      console.error("Error in getEventAnalytics:", error);
      return [];
    }
  },
});

// Get recent activity
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    try {
      const recentTickets = await ctx.db
        .query("tickets")
        .order("desc")
        .take(10)
        .collect();
      
      const recentPayments = await ctx.db
        .query("paymentNotifications")
        .order("desc")
        .take(10)
        .collect();
      
      const activities = [];
      
      // Add recent tickets
      for (const ticket of recentTickets) {
        try {
          const event = await ctx.db.get(ticket.eventId);
          
          if (event) {
            activities.push({
              type: "ticket_created",
              timestamp: ticket.purchasedAt,
              description: `Ticket purchased for ${event.name}`,
              amount: ticket.amount,
              eventName: event.name,
              userName: "Customer",
            });
          }
        } catch (error) {
          console.error("Error processing ticket:", error);
          // Continue with other tickets
        }
      }
      
      // Add recent payments
      for (const payment of recentPayments) {
        try {
          const event = await ctx.db.get(payment.eventId);
          
          if (event) {
            activities.push({
              type: "payment_" + payment.status,
              timestamp: payment._creationTime,
              description: `Payment ${payment.status} for ${event.name}`,
              amount: payment.amount,
              eventName: event.name,
              status: payment.status,
            });
          }
        } catch (error) {
          console.error("Error processing payment:", error);
          // Continue with other payments
        }
      }
      
      // Sort by timestamp and return latest 20
      return activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);
    } catch (error) {
      console.error("Error in getRecentActivity:", error);
      return [];
    }
  },
});
