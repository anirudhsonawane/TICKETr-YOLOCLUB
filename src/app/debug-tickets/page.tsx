"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function DebugTicketsPage() {
  const recentTickets = useQuery(api.tickets.getRecentTickets, { limit: 20 });

  if (!recentTickets) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Recent Tickets Debug</h1>
      <div className="space-y-4">
        {recentTickets.map((ticket, index) => (
          <div key={ticket._id} className="border p-4 rounded-lg">
            <h3 className="font-semibold">Ticket #{index + 1}</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <strong>Ticket ID:</strong> {ticket._id}
              </div>
              <div>
                <strong>Payment ID:</strong> {ticket.paymentIntentId}
              </div>
              <div>
                <strong>User ID:</strong> {ticket.userId}
              </div>
              <div>
                <strong>Event ID:</strong> {ticket.eventId}
              </div>
              <div>
                <strong>Pass ID:</strong> {ticket.passId || 'NULL/UNDEFINED'}
              </div>
              <div>
                <strong>Pass Info:</strong> {ticket.passInfo ? `${ticket.passInfo.name} (${ticket.passInfo.id})` : 'NO PASS INFO'}
              </div>
              <div>
                <strong>Amount:</strong> ₹{ticket.amount}
              </div>
              <div>
                <strong>Status:</strong> {ticket.status}
              </div>
              <div>
                <strong>Selected Date:</strong> {ticket.selectedDate || 'NONE'}
              </div>
              <div>
                <strong>Purchased At:</strong> {new Date(ticket.purchasedAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
