import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Request body:", body);
    
    const { amount, eventId, userId, waitingListId, quantity = 1, passId, couponCode, selectedDate } = body;
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay credentials");
      return NextResponse.json({ 
        error: "Order creation failed", 
        details: "Missing Razorpay credentials"
      }, { status: 500 });
    }

    const Razorpay = require("razorpay");
    
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderData = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `ticket_${Date.now()}`,
      notes: {
        eventId: String(eventId),
        userId: String(userId),
        waitingListId: String(waitingListId),
        quantity: String(quantity),
        passId: passId ? String(passId) : undefined,
        couponCode: couponCode || "",
        selectedDate: selectedDate || "",
      },
    };
    
    console.log("Creating order:", orderData);
    const order = await razorpay.orders.create(orderData);
    console.log("Order created:", order.id);

    return NextResponse.json({ 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency 
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ 
      error: "Order creation failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}