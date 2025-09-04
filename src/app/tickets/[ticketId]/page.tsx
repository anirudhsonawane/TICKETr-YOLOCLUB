"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, MapPin, Ticket, User, CreditCard, Download, Printer } from "lucide-react";

export default function TicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { user } = useUser();
  const { ticketId } = use(params);
  const ticketIdTyped = ticketId as Id<"tickets">;
  
  const ticket = useQuery(api.tickets.getById, { ticketId: ticketIdTyped });
  const event = useQuery(api.events.getById, ticket?.eventId ? { eventId: ticket.eventId } : "skip");
  
  // Remove userTickets query to focus on single ticket
  
  if (!ticket || !event) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }
  
  // Use single ticket data
  const ticketCount = 1;
  const totalAmount = ticket.amount || 0;

  if (ticket.userId !== user?.id) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-red-600">Access denied</div>
    </div>;
  }

  const qrData = JSON.stringify({
    ticketId: ticket._id,
    eventId: ticket.eventId,
    userId: ticket.userId,
    timestamp: Date.now()
  });



  return (
    <>
      <style jsx global>{`
        @media print {
          body { margin: 0; background: white !important; }
          .no-print { display: none !important; }
          .print-ticket { 
            width: 100% !important; 
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 py-4 sm:py-8 px-4">
      <div className="w-full max-w-[450px] h-auto mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border-2 sm:border-4 border-orange-200 print-ticket">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 sm:p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 w-4 h-4 bg-yellow-300 rounded-full animate-pulse"></div>
            <div className="absolute top-4 right-6 w-3 h-3 bg-yellow-200 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-3 left-8 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
            <div className="absolute bottom-2 right-4 w-3 h-3 bg-yellow-300 rounded-full animate-pulse delay-500"></div>
          </div>
          <div className="relative z-10 text-center">
            <div className="text-3xl sm:text-4xl mb-2">🎭</div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">E-Ticket</h1>
            <h2 className="text-base sm:text-lg font-semibold">{event.name}</h2>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-4 sm:p-6 text-center bg-gradient-to-b from-orange-50 to-white">
          <div className="bg-white p-4 rounded-2xl inline-block shadow-lg border-2 border-orange-100 hover:shadow-xl transition-shadow duration-300">
            <QRCodeSVG value={qrData} size={120} className="sm:w-[150px] sm:h-[150px]" level="H" />
          </div>
          <p className="text-base text-orange-700 mt-3 font-medium">✨ Scan at venue entrance ✨</p>
        </div>

        {/* Ticket Details */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-orange-50 to-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-base mb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 h-20 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 font-medium text-sm">Tickets</span>
              </div>
              <p className="font-medium text-gray-800 text-sm">{ticketCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 h-20 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 font-medium text-sm">Event Date</span>
              </div>
              <p className="font-medium text-gray-800 text-sm">{new Date(event.eventDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100 h-auto min-h-20 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 font-medium text-sm">Location</span>
              </div>
              <p className="font-medium text-gray-800 text-xs leading-tight break-words">{event.location}</p>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100 h-auto min-h-20 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 font-medium text-sm">Holder</span>
              </div>
              <p className="font-medium text-gray-800 text-xs leading-tight break-words">{user?.fullName || user?.emailAddresses[0]?.emailAddress || 'N/A'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 h-20 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 font-medium text-sm">Amount</span>
              </div>
              <p className="font-medium text-gray-800 text-sm">₹{totalAmount}</p>
            </div>
          </div>
          
          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 font-medium">Status:</span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
              ticket.status === 'used' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {ticket.status === 'used' ? '✅ Scanned' : '❌ Not Scanned'}
            </span>
          </div>
          
          {/* Download/Print Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4 no-print">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Ticket
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Save as PDF
            </button>
          </div>


        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="fixed top-10 left-10 w-8 h-8 bg-yellow-300 rounded-full opacity-20 animate-bounce no-print"></div>
      <div className="fixed top-20 right-16 w-6 h-6 bg-orange-300 rounded-full opacity-30 animate-bounce delay-300 no-print"></div>
      <div className="fixed bottom-20 left-20 w-4 h-4 bg-red-300 rounded-full opacity-25 animate-bounce delay-700 no-print"></div>
      <div className="fixed bottom-32 right-12 w-5 h-5 bg-yellow-400 rounded-full opacity-20 animate-bounce delay-500 no-print"></div>
      </div>
    </>
      
  );
}