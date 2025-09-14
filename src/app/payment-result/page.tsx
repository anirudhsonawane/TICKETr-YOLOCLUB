"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      verifyPaymentStatus();
    } else {
      setError("No order ID provided");
      setIsLoading(false);
    }
  }, [orderId]);

  const verifyPaymentStatus = async () => {
    try {
      console.log('Verifying PhonePe payment for order:', orderId);
      
      // Verify payment status with PhonePe
      const verifyResponse = await fetch('/api/phonepe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantOrderId: orderId }),
      });
      
      const verifyData = await verifyResponse.json();
      console.log('PhonePe verification response:', verifyData);
      
      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.details || 'Payment verification failed');
      }
      
      setPaymentStatus(verifyData.paymentStatus);
      
      // If payment is successful, create ticket
      if (verifyData.paymentStatus === 'SUCCESS') {
        await createTicket();
      }
      
    } catch (error) {
      console.error('PhonePe payment verification failed:', error);
      setError(error instanceof Error ? error.message : 'Payment verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async () => {
    try {
      // Get payment session and create ticket
      const sessionResponse = await fetch(`/api/payment-sessions?sessionId=${orderId}`);
      const sessionData = await sessionResponse.json();
      
      if (sessionData.success && sessionData.session) {
        setPaymentSession(sessionData.session);
        
        // Create ticket using session data
        const ticketResponse = await fetch('/api/manual-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: orderId,
            eventId: sessionData.session.eventId,
            userId: sessionData.session.userId,
            quantity: sessionData.session.quantity,
            amount: sessionData.session.amount,
            passId: sessionData.session.passId,
            selectedDate: sessionData.session.selectedDate,
          }),
        });
        
        const ticketData = await ticketResponse.json();
        
        if (ticketData.success) {
          setTicketCreated(true);
          console.log('Ticket created:', ticketData.ticketId);
        } else {
          console.error('Failed to create ticket:', ticketData.error);
          setError(ticketData.error || 'Failed to create ticket');
        }
      } else {
        throw new Error('Payment session not found');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      setError(error instanceof Error ? error.message : 'Failed to create ticket');
    }
  };

  // Determine the UI state based on payment status
  const isPaymentSuccessful = paymentStatus === 'SUCCESS' && ticketCreated && !error;
  const isPaymentFailed = (paymentStatus && paymentStatus !== 'SUCCESS') || error;
  const isPaymentPending = isLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success State */}
        {isPaymentSuccessful && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your ticket purchase has been completed successfully. Your ticket has been created!
            </p>
          </>
        )}

        {/* Failed State */}
        {isPaymentFailed && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment {paymentStatus === 'CANCELLED' ? 'Cancelled' : 'Failed'}
            </h1>
            <p className="text-gray-600 mb-6">
              {paymentStatus === 'CANCELLED' 
                ? 'Your payment was cancelled. No charges have been made.'
                : error || 'Payment could not be completed.'}
            </p>
          </>
        )}

        {/* Pending State */}
        {isPaymentPending && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment...
            </h1>
            <p className="text-gray-600 mb-6">
              Please wait while we verify your payment status.
            </p>
          </>
        )}

        {/* Order Details */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {orderId}
            </p>
          </div>
        )}

        {/* Payment Session Details */}
        {paymentSession && isPaymentSuccessful && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Event Details</p>
            <p className="font-medium text-gray-900">{paymentSession.event?.name || 'Unknown Event'}</p>
            <p className="text-sm text-gray-600">
              {paymentSession.quantity} ticket{paymentSession.quantity > 1 ? 's' : ''} • ₹{paymentSession.amount}
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {isPaymentSuccessful && (
            <>
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
            </>
          )}
          
          {isPaymentFailed && (
            <>
              <Link
                href="/"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors block"
              >
                Try Again
              </Link>
              <Link
                href="/tickets"
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors block"
              >
                View My Tickets
              </Link>
            </>
          )}
          
          {isPaymentPending && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Please do not close this page while verification is in progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentResult() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
