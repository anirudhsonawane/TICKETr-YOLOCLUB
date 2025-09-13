"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id"); // Razorpay
  const orderId = searchParams.get("orderId"); // PhonePe
  const [ticketCreated, setTicketCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const paymentIdentifier = paymentId || orderId;
    
    if (paymentIdentifier && !ticketCreated && !isLoading) {
      setIsLoading(true);
      
      // First, try to get payment session from database
      fetch(`/api/payment-sessions?sessionId=${paymentIdentifier}`)
        .then(res => res.json())
        .then(sessionData => {
          if (sessionData.success && sessionData.session) {
            setPaymentSession(sessionData.session);
            
            // Create ticket using session data
            return fetch('/api/manual-ticket', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: paymentIdentifier,
                eventId: sessionData.session.eventId,
                userId: sessionData.session.userId,
                quantity: sessionData.session.quantity,
                amount: sessionData.session.amount,
                passId: sessionData.session.passId,
                selectedDate: sessionData.session.selectedDate,
              }),
            });
          } else {
            throw new Error('Payment session not found');
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTicketCreated(true);
            console.log('Ticket created:', data.ticketId);
          } else {
            console.error('Failed to create ticket:', data.error);
            setSessionError(data.error || 'Failed to create ticket');
          }
        })
        .catch(err => {
          console.error('Failed to process payment:', err);
          setSessionError(err.message || 'Failed to process payment');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [paymentId, orderId, ticketCreated, isLoading]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your ticket purchase has been completed successfully.
          {ticketCreated && " Your ticket has been created!"}
          {isLoading && " Creating your ticket..."}
          {sessionError && (
            <span className="text-red-600 block mt-2">
              Error: {sessionError}
            </span>
          )}
        </p>
        
        {(paymentId || orderId) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">
              {paymentId ? 'Payment ID' : 'Order ID'}
            </p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {paymentId || orderId}
            </p>
          </div>
        )}

        {paymentSession && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Event Details</p>
            <p className="font-medium text-gray-900">{paymentSession.event?.name || 'Unknown Event'}</p>
            <p className="text-sm text-gray-600">
              {paymentSession.quantity} ticket{paymentSession.quantity > 1 ? 's' : ''} • ₹{paymentSession.amount}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <Link
            href="/tickets"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors block"
          >
            View My Tickets
          </Link>
          <Link
            href="/"
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors block"
          >
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>}>
      <PurchaseSuccessContent />
    </Suspense>
  );
}