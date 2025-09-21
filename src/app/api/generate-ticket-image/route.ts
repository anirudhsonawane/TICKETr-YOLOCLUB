import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");
    
    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const convex = getConvexClient();
    
    // Get ticket data
    const ticket = await convex.query(api.tickets.getById, { ticketId });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Get event data
    const event = await convex.query(api.events.getById, { eventId: ticket.eventId });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get user data
    const user = await convex.query(api.users.getUserById, { userId: ticket.userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get pass data if exists
    const selectedPass = ticket.passId ? 
      await convex.query(api.passes.getPassById, { passId: ticket.passId }) : 
      null;

    // Generate QR code data
    const qrData = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/tickets/${ticketId}`;

    // Create ticket HTML (without footer)
    const ticketHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket - ${event.name}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
          }
          .ticket-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          }
          .ticket-header {
            position: relative;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 24px;
            text-align: center;
          }
          .ticket-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 8px 0;
          }
          .ticket-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
          }
          .ticket-content {
            padding: 24px;
          }
          .ticket-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .detail-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .detail-value {
            font-size: 16px;
            color: #1e293b;
            font-weight: 600;
          }
          .qr-section {
            text-align: center;
            padding: 24px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
          }
          .qr-code {
            width: 120px;
            height: 120px;
            margin: 0 auto 16px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #64748b;
          }
          .qr-text {
            font-size: 14px;
            color: #64748b;
            margin: 0;
          }
          .ticket-id {
            font-family: monospace;
            font-size: 12px;
            color: #64748b;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-header">
            <h1 class="ticket-title">${event.name}</h1>
            <p class="ticket-subtitle">Your Digital Ticket</p>
          </div>
          
          <div class="ticket-content">
            <div class="ticket-details">
              <div class="detail-item">
                <span class="detail-label">Date</span>
                <span class="detail-value">${new Date(event.eventDate).toLocaleDateString()}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Time</span>
                <span class="detail-value">${new Date(event.eventDate).toLocaleTimeString()}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Location</span>
                <span class="detail-value">${event.location}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Price</span>
                <span class="detail-value">₹${ticket.amount}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Pass Holder</span>
                <span class="detail-value">${user.name || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Pass Type</span>
                <span class="detail-value">${selectedPass?.name || 'General'}</span>
              </div>
            </div>
          </div>
          
          <div class="qr-section">
            <div class="qr-code">
              QR Code
            </div>
            <p class="qr-text">Present this ticket at the event</p>
            <div class="ticket-id">Ticket ID: ${ticketId}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // For now, return the HTML content
    // In production, you might want to use a service like Puppeteer to generate actual images
    return new NextResponse(ticketHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error("Error generating ticket image:", error);
    return NextResponse.json(
      { error: "Failed to generate ticket image" },
      { status: 500 }
    );
  }
}
