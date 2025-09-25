import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedEvents = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if events already exist
    const existingEvents = await ctx.db.query("events").collect();
    if (existingEvents.length > 0) {
      return { message: "Events already exist", count: existingEvents.length };
    }

    // Sample events data
    const events = [
      {
        name: "Ghoomar Garba Night - Navratri Special",
        description: "Join us for an unforgettable night of traditional Garba and Dandiya with live music, delicious food, and amazing prizes! Experience the vibrant colors and energy of Navratri celebrations.",
        location: "YOLO Club Events Center, Mumbai",
        eventDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: Date.now() + (7 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000), // 4 hours duration
        eventType: "Cultural",
        price: 599,
        totalTickets: 500,
        userId: "admin_user_123", // You can change this to a real user ID
        is_cancelled: false,
        organizerUpiId: "yoloclub@paytm"
      },
      {
        name: "Bollywood Dance Workshop",
        description: "Learn the latest Bollywood dance moves from professional choreographers. Perfect for beginners and intermediate dancers. Includes refreshments and certificate of participation.",
        location: "Dance Studio, Andheri West, Mumbai",
        eventDate: Date.now() + (3 * 24 * 60 * 60 * 1000), // 3 days from now
        endDate: Date.now() + (3 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000), // 2 hours duration
        eventType: "Workshop",
        price: 799,
        totalTickets: 30,
        userId: "admin_user_123",
        is_cancelled: false,
        organizerUpiId: "dancestudio@paytm"
      },
      {
        name: "Fusion Music Concert",
        description: "Experience the magic of fusion music with renowned artists blending traditional Indian instruments with modern beats. A night of soulful melodies and energetic performances.",
        location: "NCPA, Nariman Point, Mumbai",
        eventDate: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days from now
        endDate: Date.now() + (14 * 24 * 60 * 60 * 1000) + (3 * 60 * 60 * 1000), // 3 hours duration
        eventType: "Concert",
        price: 1299,
        totalTickets: 200,
        userId: "admin_user_123",
        is_cancelled: false,
        organizerUpiId: "ncpa@paytm"
      },
      {
        name: "Food Festival - Street Delights",
        description: "Indulge in the best street food from across India. Live cooking demonstrations, food competitions, and unlimited tastings. Perfect for food lovers!",
        location: "Juhu Beach, Mumbai",
        eventDate: Date.now() + (10 * 24 * 60 * 60 * 1000), // 10 days from now
        endDate: Date.now() + (10 * 24 * 60 * 60 * 1000) + (6 * 60 * 60 * 1000), // 6 hours duration
        eventType: "Food Festival",
        price: 399,
        totalTickets: 300,
        userId: "admin_user_123",
        is_cancelled: false,
        organizerUpiId: "foodfest@paytm"
      },
      {
        name: "Comedy Night - Stand Up Special",
        description: "Laugh your heart out with India's top comedians. An evening filled with humor, wit, and entertainment. Includes dinner and drinks.",
        location: "Comedy Club, Bandra West, Mumbai",
        eventDate: Date.now() + (5 * 24 * 60 * 60 * 1000), // 5 days from now
        endDate: Date.now() + (5 * 24 * 60 * 60 * 1000) + (2.5 * 60 * 60 * 1000), // 2.5 hours duration
        eventType: "Comedy",
        price: 899,
        totalTickets: 80,
        userId: "admin_user_123",
        is_cancelled: false,
        organizerUpiId: "comedyclub@paytm"
      },
      {
        name: "Art Exhibition - Modern Masters",
        description: "Explore contemporary art from emerging and established artists. Interactive sessions, art workshops, and networking opportunities for art enthusiasts.",
        location: "Jehangir Art Gallery, Fort, Mumbai",
        eventDate: Date.now() + (21 * 24 * 60 * 60 * 1000), // 21 days from now
        endDate: Date.now() + (21 * 24 * 60 * 60 * 1000) + (8 * 60 * 60 * 1000), // 8 hours duration
        eventType: "Exhibition",
        price: 299,
        totalTickets: 150,
        userId: "admin_user_123",
        is_cancelled: false,
        organizerUpiId: "artgallery@paytm"
      },
      {
        name: "Tech Meetup - AI & Future",
        description: "Join industry experts for discussions on Artificial Intelligence, Machine Learning, and the future of technology. Networking session included.",
        location: "Tech Hub, Powai, Mumbai",
        eventDate: Date.now() + (12 * 24 * 60 * 60 * 1000), // 12 days from now
        endDate: Date.now() + (12 * 24 * 60 * 60 * 1000) + (3 * 60 * 60 * 1000), // 3 hours duration
        eventType: "Tech Meetup",
        price: 499,
        totalTickets: 100,
        userId: "admin_user_123",
        is_cancelled: false,
        organizerUpiId: "techhub@paytm"
      },
      {
        name: "Yoga & Meditation Retreat",
        description: "Rejuvenate your mind and body with guided yoga sessions, meditation, and wellness workshops. Includes healthy breakfast and lunch.",
        location: "Yoga Center, Goregaon East, Mumbai",
        eventDate: Date.now() + (18 * 24 * 60 * 60 * 1000), // 18 days from now
        endDate: Date.now() + (18 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000), // 4 hours duration
        eventType: "Wellness",
        price: 699,
        totalTickets: 50,
        userId: "admin_user_123",
        is_cancelled: false,
        organizerUpiId: "yogacenter@paytm"
      }
    ];

    const createdEvents = [];
    for (const event of events) {
      const eventId = await ctx.db.insert("events", event);
      createdEvents.push(eventId);
    }

    return { 
      message: "Events seeded successfully", 
      eventIds: createdEvents,
      count: createdEvents.length
    };
  },
});

export const seedPassesForEvents = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all events
    const events = await ctx.db.query("events").collect();
    
    if (events.length === 0) {
      return { message: "No events found. Please seed events first." };
    }

    const createdPasses = [];
    
    for (const event of events) {
      // Check if passes already exist for this event
      const existingPasses = await ctx.db
        .query("passes")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      if (existingPasses.length > 0) {
        continue; // Skip if passes already exist
      }

      // Create different types of passes based on event type
      let passes = [];
      
      if (event.eventType === "Cultural" || event.name.includes("Garba")) {
        passes = [
          {
            eventId: event._id,
            name: "Stag Female",
            description: "Standard entry to the event with basic amenities",
            price: 599,
            totalQuantity: 200,
            soldQuantity: 0,
            benefits: [
              "Full event access",
              "Discounted price",
              "Access to main venue",
              "All Day Early Bird"
            ],
            category: "Standard"
          },
          {
            eventId: event._id,
            name: "Couple Pass",
            description: "Premium experience with exclusive perks and priority access",
            price: 799,
            totalQuantity: 150,
            soldQuantity: 0,
            benefits: [
              "Event entry",
              "Discounted price",
              "Access to main venue",
              "Unlimited Fun"
            ],
            category: "Premium"
          },
          {
            eventId: event._id,
            name: "Season Pass Couple",
            description: "Limited time offer with discounted pricing",
            price: 3999,
            totalQuantity: 50,
            soldQuantity: 0,
            benefits: [
              "Event entry",
              "Access to main venue",
              "Valid For All Days",
              "All Day Early Bird",
              "Only Couple Entry"
            ],
            category: "Seasonal"
          }
        ];
      } else if (event.eventType === "Workshop") {
        passes = [
          {
            eventId: event._id,
            name: "Basic Workshop",
            description: "Standard workshop access with materials included",
            price: 799,
            totalQuantity: 20,
            soldQuantity: 0,
            benefits: [
              "Workshop access",
              "Materials included",
              "Certificate of participation",
              "Refreshments"
            ],
            category: "Standard"
          },
          {
            eventId: event._id,
            name: "Premium Workshop",
            description: "Enhanced workshop experience with personal guidance",
            price: 1299,
            totalQuantity: 10,
            soldQuantity: 0,
            benefits: [
              "Workshop access",
              "Premium materials",
              "Personal guidance",
              "Certificate of participation",
              "Refreshments",
              "Take-home kit"
            ],
            category: "Premium"
          }
        ];
      } else if (event.eventType === "Concert") {
        passes = [
          {
            eventId: event._id,
            name: "General Admission",
            description: "Standard concert access with great views",
            price: 1299,
            totalQuantity: 150,
            soldQuantity: 0,
            benefits: [
              "Concert access",
              "Great sound quality",
              "Food & drinks available",
              "Merchandise discount"
            ],
            category: "Standard"
          },
          {
            eventId: event._id,
            name: "VIP Experience",
            description: "Premium concert experience with exclusive perks",
            price: 2499,
            totalQuantity: 50,
            soldQuantity: 0,
            benefits: [
              "VIP seating",
              "Meet & greet opportunity",
              "Complimentary food & drinks",
              "Exclusive merchandise",
              "Backstage access"
            ],
            category: "VIP"
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
            benefits: [
              "Event access",
              "Basic amenities",
              "Food & drinks available"
            ],
            category: "Standard"
          },
          {
            eventId: event._id,
            name: "Premium Entry",
            description: "Enhanced event experience",
            price: Math.floor(event.price * 1.5),
            totalQuantity: Math.floor(event.totalTickets * 0.3),
            soldQuantity: 0,
            benefits: [
              "Premium access",
              "Priority seating",
              "Complimentary refreshments",
              "Exclusive perks"
            ],
            category: "Premium"
          }
        ];
      }

      // Create passes for this event
      for (const pass of passes) {
        const passId = await ctx.db.insert("passes", pass);
        createdPasses.push(passId);
      }
    }

    return { 
      message: "Passes seeded successfully", 
      passIds: createdPasses,
      count: createdPasses.length
    };
  },
});

export const seedAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // First seed events
    const eventsResult = await ctx.runMutation(api.seedData.seedEvents, {});
    
    // Then seed passes for those events
    const passesResult = await ctx.runMutation(api.seedData.seedPassesForEvents, {});
    
    return {
      message: "All data seeded successfully",
      events: eventsResult,
      passes: passesResult
    };
  },
});
