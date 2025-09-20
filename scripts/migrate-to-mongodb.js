const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = "mongodb+srv://anirudhsonawane111_db_user:6BbViCSXEe3PRENm@cluster0.2vltlpi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "ticketr";

// Sample data to migrate (you can add your actual Convex data here)
const sampleData = {
  events: [
    {
      name: "Sample Event",
      description: "This is a sample event for testing",
      location: "Sample Location",
      eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      price: 100,
      totalTickets: 100,
      userId: "sample_user_id",
      is_cancelled: false
    }
  ],
  passes: [
    {
      eventId: null, // Will be set after event creation
      name: "General Pass",
      description: "General admission pass",
      price: 100,
      totalQuantity: 50,
      soldQuantity: 0,
      benefits: ["Entry to event", "Free parking"],
      category: "General"
    }
  ],
  users: [
    {
      userId: "sample_user_id",
      email: "test@example.com",
      name: "Test User"
    }
  ]
};

async function migrateToMongoDB() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Create collections with indexes
    console.log('📋 Creating collections and indexes...');
    
    // Events collection
    await db.collection('events').createIndex({ userId: 1 });
    await db.collection('events').createIndex({ eventDate: 1 });
    
    // Passes collection
    await db.collection('passes').createIndex({ eventId: 1 });
    
    // Tickets collection
    await db.collection('tickets').createIndex({ userId: 1 });
    await db.collection('tickets').createIndex({ eventId: 1 });
    await db.collection('tickets').createIndex({ paymentIntentId: 1 });
    await db.collection('tickets').createIndex({ userId: 1, eventId: 1 });
    
    // Waiting list collection
    await db.collection('waitingList').createIndex({ userId: 1, eventId: 1 });
    await db.collection('waitingList').createIndex({ eventId: 1, status: 1 });
    
    // Users collection
    await db.collection('users').createIndex({ userId: 1 });
    
    // Coupons collection
    await db.collection('coupons').createIndex({ code: 1 });
    
    // Email logs collection
    await db.collection('emailLogs').createIndex({ userId: 1 });
    await db.collection('emailLogs').createIndex({ userEmail: 1 });
    await db.collection('emailLogs').createIndex({ eventId: 1 });
    
    // UPI payments collection
    await db.collection('upi_payments').createIndex({ uid: 1 });
    
    console.log('✅ Collections and indexes created successfully');
    
    // Migrate sample data
    console.log('📦 Migrating sample data...');
    
    // Insert events
    const eventResult = await db.collection('events').insertMany(
      sampleData.events.map(event => ({
        ...event,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    console.log(`✅ Inserted ${eventResult.insertedCount} events`);
    
    // Update passes with event IDs
    const events = await db.collection('events').find({}).toArray();
    const eventId = events[0]._id;
    
    const passResult = await db.collection('passes').insertMany(
      sampleData.passes.map(pass => ({
        ...pass,
        eventId: eventId,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    console.log(`✅ Inserted ${passResult.insertedCount} passes`);
    
    // Insert users
    const userResult = await db.collection('users').insertMany(
      sampleData.users.map(user => ({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    console.log(`✅ Inserted ${userResult.insertedCount} users`);
    
    console.log('🎉 Migration completed successfully!');
    console.log('📊 Database summary:');
    console.log(`   - Events: ${await db.collection('events').countDocuments()}`);
    console.log(`   - Passes: ${await db.collection('passes').countDocuments()}`);
    console.log(`   - Users: ${await db.collection('users').countDocuments()}`);
    console.log(`   - Tickets: ${await db.collection('tickets').countDocuments()}`);
    console.log(`   - Waiting List: ${await db.collection('waitingList').countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run migration
migrateToMongoDB().catch(console.error);
