"use client";

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign, Ticket, Upload } from "lucide-react";
import { toast } from "sonner";

interface UPIPaymentVerificationProps {
  eventId: Id<"events">;
}

interface PendingPayment {
  id: string;
  userId: string;
  eventId: string;
  amount: number;
  quantity: number;
  passId?: string;
  upiTransactionId?: string;
  paymentReference: string;
  notes?: string;
  createdAt: Date;
  userInfo?: {
    name: string;
    email: string;
  };
}

export default function UPIPaymentVerification({ eventId }: UPIPaymentVerificationProps) {
  const { user } = useUser();
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const event = useQuery(api.events.getById, { eventId });
  const isEventOwner = user?.id === event?.userId;

  // Mock data - in real implementation, this would come from a database
  // You'd store UPI payment details when users initiate payments
  const mockPendingPayments: PendingPayment[] = [
    {
      id: "1",
      userId: "user_123",
      eventId: eventId,
      amount: 750,
      quantity: 1,
      paymentReference: "UPI123456789",
      upiTransactionId: "TXN789012345",
      notes: "Payment screenshot uploaded",
      createdAt: new Date(),
      userInfo: {
        name: "John Doe",
        email: "john@example.com"
      }
    }
  ];

  const handleCreateTicket = async (payment: PendingPayment) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/manual-upi-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: payment.eventId,
          userId: payment.userId,
          paymentReference: payment.paymentReference,
          quantity: payment.quantity,
          amount: payment.amount,
          passId: payment.passId,
          upiTransactionId: payment.upiTransactionId,
          notes: payment.notes
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Ticket created successfully!");
        // Remove from pending payments
        setPendingPayments(prev => prev.filter(p => p.id !== payment.id));
        setSelectedPayment(null);
      } else {
        toast.error("Failed to create ticket: " + result.error);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = (payment: PendingPayment) => {
    // Remove from pending payments
    setPendingPayments(prev => prev.filter(p => p.id !== payment.id));
    setSelectedPayment(null);
    toast.success("Payment rejected");
  };

  if (!isEventOwner) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center text-gray-500">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Only event owners can verify payments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              UPI Payment Verification
            </h3>
            <p className="text-sm text-gray-600">
              Verify payments and create tickets manually
            </p>
          </div>
        </div>

        {mockPendingPayments.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No pending payments to verify</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Pending Payments ({mockPendingPayments.length})
            </h4>
            
            {mockPendingPayments.map((payment) => (
              <div
                key={payment.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPayment?.id === payment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        ₹{payment.amount} - {payment.quantity} ticket{payment.quantity > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.userInfo?.name || 'Unknown User'} • {payment.paymentReference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {payment.createdAt.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {payment.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {selectedPayment && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3">Payment Details</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{selectedPayment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{selectedPayment.quantity} ticket{selectedPayment.quantity > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Reference:</span>
                    <span className="font-medium">{selectedPayment.paymentReference}</span>
                  </div>
                  {selectedPayment.upiTransactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">UPI Transaction ID:</span>
                      <span className="font-medium">{selectedPayment.upiTransactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span className="font-medium">{selectedPayment.userInfo?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedPayment.userInfo?.email || 'Unknown'}</span>
                  </div>
                  {selectedPayment.notes && (
                    <div className="mt-2">
                      <span className="text-gray-600">Notes:</span>
                      <p className="text-sm text-gray-800 mt-1">{selectedPayment.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleCreateTicket(selectedPayment)}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Ticket className="w-4 h-4" />
                    {isProcessing ? 'Creating...' : 'Create Ticket'}
                  </button>
                  <button
                    onClick={() => handleRejectPayment(selectedPayment)}
                    disabled={isProcessing}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2">Instructions for Event Organizers</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Verify payments by checking your bank account or UPI app</li>
            <li>• Ask users to provide payment screenshots for verification</li>
            <li>• Match the payment amount and reference with the details shown</li>
            <li>• Only create tickets after confirming payment receipt</li>
            <li>• Keep records of all manual ticket creations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
