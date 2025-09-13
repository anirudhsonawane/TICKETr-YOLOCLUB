// Test script to verify payment flow creates tickets in MongoDB
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://anirudhsonawane111_db_user:6BbViCSXEe3PRENm@cluster0.2vltlpi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "ticketr";

async function testPaymentFlow() {
  console.log("🧪 Testing Payment Flow → MongoDB Integration");
  
  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    
    console.log("✅ Connected to MongoDB");
    
    // Check current tickets count
    const ticketsBefore = await db.collection('tickets').countDocuments();
    console.log(`📊 Current tickets in database: ${ticketsBefore}`);
    
    // Simulate a successful payment webhook call
    const testPaymentData = {
      eventId: "test_event_id",
      userId: "test_user_123",
      paymentId: "test_payment_" + Date.now(),
      quantity: 2,
      amount: 200,
      passId: null,
      selectedDate: null
    };
    
    console.log("💳 Simulating payment webhook call...");
    
    // Make API call to create ticket
    const response = await fetch('http://localhost:3000/api/mongodb-ticket-creation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentData)
    });
    
    const result = await response.json();
    console.log("📝 API Response:", result);
    
    if (result.success) {
      // Check tickets count after
      const ticketsAfter = await db.collection('tickets').countDocuments();
      console.log(`📊 Tickets after payment: ${ticketsAfter}`);
      console.log(`✅ Successfully created ${ticketsAfter - ticketsBefore} tickets`);
      
      // Show the created ticket
      const newTicket = await db.collection('tickets').findOne({
        paymentIntentId: testPaymentData.paymentId
      });
      
      if (newTicket) {
        console.log("🎫 Created ticket details:");
        console.log(`   - Ticket ID: ${newTicket._id}`);
        console.log(`   - User ID: ${newTicket.userId}`);
        console.log(`   - Amount: ₹${newTicket.amount}`);
        console.log(`   - Status: ${newTicket.status}`);
        console.log(`   - Payment ID: ${newTicket.paymentIntentId}`);
      }
    } else {
      console.log("❌ Failed to create ticket:", result.error);
    }
    
    await client.close();
    console.log("🔌 MongoDB connection closed");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testPaymentFlow();
