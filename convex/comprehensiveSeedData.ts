import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addComprehensiveSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      events: [],
      passes: [],
      coupons: [],
      errors: []
    };

    try {
      // 1. Create Sample Events
      const sampleEvents = [
        {
          name: "Summer Music Festival 2024",
          description: "A spectacular 3-day music festival featuring top Indian and international artists. Experience live performances, food trucks, and amazing vibes under the stars.",
          location: "Mahalaxmi Race Course, Mumbai",
          eventDate: Date.now() + (15 * 24 * 60 * 60 * 1000), // 15 days from now
          endDate: Date.now() + (18 * 24 * 60 * 60 * 1000), // 3 days duration
          eventType: "Music Festival",
          price: 1500,
          totalTickets: 1000,
          userId: "admin_user_123",
          is_cancelled: false,
          organizerUpiId: "summerfest@paytm"
        },
        {
          name: "Tech Startup Pitch Competition",
          description: "Join us for an exciting startup pitch competition where innovative ideas meet potential investors. Network with industry leaders and fellow entrepreneurs.",
          location: "BSE Convention Centre, Mumbai",
          eventDate: Date.now() + (8 * 24 * 60 * 60 * 1000), // 8 days from now
          endDate: Date.now() + (8 * 24 * 60 * 60 * 1000) + (6 * 60 * 60 * 1000), // 6 hours duration
          eventType: "Business",
          price: 899,
          totalTickets: 200,
          userId: "admin_user_123",
          is_cancelled: false,
          organizerUpiId: "techpitch@paytm"
        },
        {
          name: "Yoga & Wellness Retreat",
          description: "Rejuvenate your mind, body, and soul with our comprehensive wellness retreat. Includes yoga sessions, meditation, healthy meals, and spa treatments.",
          location: "Alibaug Beach Resort, Maharashtra",
          eventDate: Date.now() + (20 * 24 * 60 * 60 * 1000), // 20 days from now
          endDate: Date.now() + (22 * 24 * 60 * 60 * 1000), // 2 days duration
          eventType: "Wellness",
          price: 2500,
          totalTickets: 50,
          userId: "admin_user_123",
          is_cancelled: false,
          organizerUpiId: "wellness@paytm"
        },
        {
          name: "Fashion Week - Designer Showcase",
          description: "Experience the latest in fashion with runway shows, designer meet & greets, and exclusive shopping opportunities. A must-attend for fashion enthusiasts.",
          location: "Grand Hyatt, Mumbai",
          eventDate: Date.now() + (12 * 24 * 60 * 60 * 1000), // 12 days from now
          endDate: Date.now() + (12 * 24 * 60 * 60 * 1000) + (8 * 60 * 60 * 1000), // 8 hours duration
          eventType: "Fashion",
          price: 1200,
          totalTickets: 300,
          userId: "admin_user_123",
          is_cancelled: false,
          organizerUpiId: "fashionweek@paytm"
        },
        {
          name: "Food & Wine Tasting Experience",
          description: "Indulge in a culinary journey with curated food and wine pairings from renowned chefs. Learn about wine selection and gourmet cooking techniques.",
          location: "Four Seasons Hotel, Mumbai",
          eventDate: Date.now() + (6 * 24 * 60 * 60 * 1000), // 6 days from now
          endDate: Date.now() + (6 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000), // 4 hours duration
          eventType: "Culinary",
          price: 1800,
          totalTickets: 80,
          userId: "admin_user_123",
          is_cancelled: false,
          organizerUpiId: "foodwine@paytm"
        }
      ];

      // Create events
      for (const eventData of sampleEvents) {
        const eventId = await ctx.db.insert("events", eventData);
        results.events.push({ id: eventId, name: eventData.name });
      }

      // 2. Create Sample Passes for each event
      const events = await ctx.db.query("events").collect();
      
      for (const event of events) {
        // Skip if passes already exist
        const existingPasses = await ctx.db
          .query("passes")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        if (existingPasses.length > 0) {
          continue;
        }

        let passes = [];
        
        // Create different pass types based on event type
        if (event.eventType === "Music Festival") {
          passes = [
            {
              eventId: event._id,
              name: "General Admission",
              description: "Access to all stages and general areas",
              price: 1500,
              totalQuantity: 600,
              soldQuantity: 0,
              benefits: ["3-day festival access", "Multiple stage access", "Food & drink vendors", "Merchandise discount"],
              category: "Standard"
            },
            {
              eventId: event._id,
              name: "VIP Experience",
              description: "Premium festival experience with exclusive perks",
              price: 3500,
              totalQuantity: 200,
              soldQuantity: 0,
              benefits: ["VIP area access", "Meet & greet opportunities", "Complimentary drinks", "Premium seating", "Artist backstage tours"],
              category: "VIP"
            },
            {
              eventId: event._id,
              name: "Weekend Pass",
              description: "Access to weekend events only",
              price: 999,
              totalQuantity: 200,
              soldQuantity: 0,
              benefits: ["Weekend access", "General admission areas", "Food vendors"],
              category: "Weekend"
            }
          ];
        } else if (event.eventType === "Business") {
          passes = [
            {
              eventId: event._id,
              name: "Standard Ticket",
              description: "Access to pitch competition and networking",
              price: 899,
              totalQuantity: 150,
              soldQuantity: 0,
              benefits: ["Event access", "Networking opportunities", "Lunch included", "Conference materials"],
              category: "Standard"
            },
            {
              eventId: event._id,
              name: "Investor Pass",
              description: "Premium access for investors and VCs",
              price: 1999,
              totalQuantity: 50,
              soldQuantity: 0,
              benefits: ["VIP seating", "Private networking session", "Pitch deck access", "Premium lunch", "One-on-one meetings"],
              category: "Investor"
            }
          ];
        } else if (event.eventType === "Wellness") {
          passes = [
            {
              eventId: event._id,
              name: "Standard Retreat",
              description: "Full wellness retreat experience",
              price: 2500,
              totalQuantity: 30,
              soldQuantity: 0,
              benefits: ["2-day retreat", "All yoga sessions", "Healthy meals", "Meditation sessions", "Accommodation"],
              category: "Standard"
            },
            {
              eventId: event._id,
              name: "Premium Retreat",
              description: "Luxury wellness experience with spa treatments",
              price: 4500,
              totalQuantity: 20,
              soldQuantity: 0,
              benefits: ["2-day luxury retreat", "All yoga sessions", "Gourmet meals", "Spa treatments", "Private sessions", "Premium accommodation"],
              category: "Premium"
            }
          ];
        } else if (event.eventType === "Fashion") {
          passes = [
            {
              eventId: event._id,
              name: "Fashion Show Access",
              description: "Access to runway shows and exhibitions",
              price: 1200,
              totalQuantity: 200,
              soldQuantity: 0,
              benefits: ["Runway show access", "Designer exhibitions", "Fashion networking", "Goodie bag"],
              category: "Standard"
            },
            {
              eventId: event._id,
              name: "VIP Fashion Experience",
              description: "Premium fashion week experience",
              price: 2500,
              totalQuantity: 100,
              soldQuantity: 0,
              benefits: ["VIP seating", "Designer meet & greets", "Exclusive shopping", "Champagne reception", "Fashion consultation"],
              category: "VIP"
            }
          ];
        } else if (event.eventType === "Culinary") {
          passes = [
            {
              eventId: event._id,
              name: "Tasting Experience",
              description: "Food and wine tasting with expert guidance",
              price: 1800,
              totalQuantity: 60,
              soldQuantity: 0,
              benefits: ["Food tasting", "Wine pairing", "Chef demonstrations", "Recipe cards", "Take-home samples"],
              category: "Standard"
            },
            {
              eventId: event._id,
              name: "Masterclass Experience",
              description: "Interactive cooking masterclass with renowned chefs",
              price: 2800,
              totalQuantity: 20,
              soldQuantity: 0,
              benefits: ["Interactive cooking", "Chef guidance", "Premium ingredients", "Wine tasting", "Certificate", "Chef's apron"],
              category: "Masterclass"
            }
          ];
        } else {
          // Default passes for other event types
          passes = [
            {
              eventId: event._id,
              name: "Standard Entry",
              description: "Standard entry to the event",
              price: event.price,
              totalQuantity: Math.floor(event.totalTickets * 0.7),
              soldQuantity: 0,
              benefits: ["Event access", "Basic amenities", "Food & drinks available"],
              category: "Standard"
            },
            {
              eventId: event._id,
              name: "Premium Entry",
              description: "Enhanced event experience",
              price: Math.floor(event.price * 1.5),
              totalQuantity: Math.floor(event.totalTickets * 0.3),
              soldQuantity: 0,
              benefits: ["Premium access", "Priority seating", "Complimentary refreshments", "Exclusive perks"],
              category: "Premium"
            }
          ];
        }

        // Create passes for this event
        for (const passData of passes) {
          const passId = await ctx.db.insert("passes", passData);
          results.passes.push({ id: passId, name: passData.name, event: event.name });
        }
      }

      // 3. Create Sample Coupon Codes
      const sampleCoupons = [
        {
          code: "WELCOME20",
          discountPercentage: 20,
          discountType: "percentage" as const,
          isActive: true,
          validFrom: Date.now(),
          validUntil: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 days
          maxUses: 500,
          description: "20% off for new users - Welcome discount"
        },
        {
          code: "SAVE100",
          discountAmount: 100,
          discountType: "flat" as const,
          isActive: true,
          validFrom: Date.now(),
          validUntil: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days
          maxUses: 1000,
          description: "₹100 off on any purchase above ₹500"
        },
        {
          code: "EARLYBIRD",
          discountPercentage: 15,
          discountType: "percentage" as const,
          isActive: true,
          validFrom: Date.now(),
          validUntil: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
          maxUses: 200,
          description: "15% early bird discount for advance bookings"
        },
        {
          code: "GROUP50",
          discountAmount: 50,
          discountType: "flat" as const,
          isActive: true,
          validFrom: Date.now(),
          validUntil: Date.now() + (45 * 24 * 60 * 60 * 1000), // 45 days
          maxUses: 300,
          description: "₹50 off for group bookings of 4+ people"
        },
        {
          code: "VIP2024",
          discountPercentage: 25,
          discountType: "percentage" as const,
          isActive: true,
          validFrom: Date.now(),
          validUntil: Date.now() + (120 * 24 * 60 * 60 * 1000), // 120 days
          maxUses: 100,
          description: "25% off VIP experiences - Limited time offer"
        },
        {
          code: "FESTIVAL",
          discountAmount: 200,
          discountType: "flat" as const,
          isActive: true,
          validFrom: Date.now(),
          validUntil: Date.now() + (15 * 24 * 60 * 60 * 1000), // 15 days
          maxUses: 150,
          description: "₹200 off festival tickets - Special promotion"
        },
        {
          code: "STUDENT10",
          discountPercentage: 10,
          discountType: "percentage" as const,
          isActive: true,
          validFrom: Date.now(),
          validUntil: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
          maxUses: 1000,
          description: "10% student discount - Valid with student ID"
        },
        {
          code: "FIRSTTIME",
          discountAmount: 150,
          discountType: "flat" as const,
          isActive: true,
          validFrom: Date.now(),
          validUntil: Date.now() + (180 * 24 * 60 * 60 * 1000), // 180 days
          maxUses: 500,
          description: "₹150 off for first-time users"
        }
      ];

      // Create coupons
      for (const couponData of sampleCoupons) {
        // Check if coupon already exists
        const existingCoupon = await ctx.db
          .query("coupons")
          .withIndex("by_code", (q) => q.eq("code", couponData.code))
          .first();

        if (!existingCoupon) {
          const couponId = await ctx.db.insert("coupons", {
            ...couponData,
            currentUses: 0,
            usedByUsers: [],
            usedByUserEvent: [],
            userId: undefined
          });
          results.coupons.push({ id: couponId, code: couponData.code, description: couponData.description });
        }
      }

      return {
        message: "Comprehensive sample data added successfully",
        summary: {
          eventsCreated: results.events.length,
          passesCreated: results.passes.length,
          couponsCreated: results.coupons.length
        },
        details: results
      };

    } catch (error) {
      results.errors.push(error.message);
      return {
        message: "Some errors occurred while adding sample data",
        summary: {
          eventsCreated: results.events.length,
          passesCreated: results.passes.length,
          couponsCreated: results.coupons.length,
          errors: results.errors.length
        },
        details: results
      };
    }
  },
});

export const clearAllSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      eventsDeleted: 0,
      passesDeleted: 0,
      couponsDeleted: 0
    };

    try {
      // Delete all events (this will cascade to passes due to foreign key relationships)
      const events = await ctx.db.query("events").collect();
      for (const event of events) {
        await ctx.db.delete(event._id);
        results.eventsDeleted++;
      }

      // Delete all passes
      const passes = await ctx.db.query("passes").collect();
      for (const pass of passes) {
        await ctx.db.delete(pass._id);
        results.passesDeleted++;
      }

      // Delete all coupons
      const coupons = await ctx.db.query("coupons").collect();
      for (const coupon of coupons) {
        await ctx.db.delete(coupon._id);
        results.couponsDeleted++;
      }

      return {
        message: "All sample data cleared successfully",
        results
      };
    } catch (error) {
      return {
        message: "Error clearing sample data",
        error: error.message,
        results
      };
    }
  },
});

export const getDataSummary = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const events = await ctx.db.query("events").collect();
      const passes = await ctx.db.query("passes").collect();
      const coupons = await ctx.db.query("coupons").collect();

      return {
        summary: {
          totalEvents: events.length,
          totalPasses: passes.length,
          totalCoupons: coupons.length
        },
        events: events.map(e => ({ id: e._id, name: e.name, type: e.eventType, tickets: e.totalTickets })),
        passes: passes.map(p => ({ id: p._id, name: p.name, price: p.price, quantity: p.totalQuantity })),
        coupons: coupons.map(c => ({ id: c._id, code: c.code, type: c.discountType, active: c.isActive }))
      };
    } catch (error) {
      return {
        message: "Error getting data summary",
        error: error.message
      };
    }
  },
});
