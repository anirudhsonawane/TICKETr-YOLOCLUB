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
      
      // First, verify payment status for PhonePe payments
      if (orderId) {
        verifyPhonePePayment(orderId);
      } else {
        // For Razorpay payments, proceed with existing logic
        processRazorpayPayment(paymentIdentifier);
      }
    }
  }, [paymentId, orderId, ticketCreated, isLoading]);

  const verifyPhonePePayment = async (orderId: string) => {
    try {
      console.log('Verifying PhonePe payment for order:', orderId);
      
      // First, check if tickets already exist for this payment
      const existingTicketsResponse = await fetch(`/api/tickets/by-payment?paymentId=${orderId}`);
      const existingTicketsData = await existingTicketsResponse.json();
      
      if (existingTicketsData.success && existingTicketsData.tickets && existingTicketsData.tickets.length > 0) {
        // Tickets already exist, mark as created
        setTicketCreated(true);
        console.log('Tickets already exist:', existingTicketsData.tickets);
        return;
      }
      
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
      
      // Check if payment was actually successful
      if (verifyData.paymentStatus !== 'SUCCESS') {
        throw new Error(`Payment was not successful. Status: ${verifyData.paymentStatus}`);
      }
      
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
          setSessionError(ticketData.error || 'Failed to create ticket');
        }
      } else {
        console.log('Payment session not found, trying fallback ticket creation');
        // Payment session not found, but payment was successful
        // Try to create ticket with fallback method
        try {
          const fallbackResponse = await fetch('/api/create-ticket-fallback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderId,
              eventId: searchParams.get('eventId'), // Try to get from URL params
              userId: searchParams.get('userId'), // Try to get from URL params
              amount: searchParams.get('amount'), // Try to get from URL params
              quantity: searchParams.get('quantity') || 1,
            }),
          });
          
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.success) {
            setTicketCreated(true);
            console.log('Fallback ticket created:', fallbackData.ticketId);
          } else {
            console.error('Fallback ticket creation failed:', fallbackData.error);
            setSessionError('Payment successful but ticket creation failed. Please contact support with payment ID: ' + orderId);
          }
        } catch (fallbackError) {
          console.error('Fallback ticket creation error:', fallbackError);
          setSessionError('Payment successful but ticket creation requires manual intervention. Please contact support with payment ID: ' + orderId);
        }
      }
      
    } catch (error) {
      console.error('PhonePe payment verification failed:', error);
      setSessionError(error instanceof Error ? error.message : 'Payment verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const processRazorpayPayment = async (paymentId: string) => {
    try {
      console.log('Processing Razorpay payment for ID:', paymentId);
      
      // First, check if tickets already exist for this payment (webhook might have created them)
      const existingTicketsResponse = await fetch(`/api/tickets/by-payment?paymentId=${paymentId}`);
      const existingTicketsData = await existingTicketsResponse.json();
      
      if (existingTicketsData.success && existingTicketsData.tickets && existingTicketsData.tickets.length > 0) {
        // Tickets already exist, mark as created
        setTicketCreated(true);
        console.log('Tickets already exist:', existingTicketsData.tickets);
        return;
      }
      
      // Try to get payment session from database
      const sessionResponse = await fetch(`/api/payment-sessions?sessionId=${paymentId}`);
      const sessionData = await sessionResponse.json();
      
      if (sessionData.success && sessionData.session) {
        setPaymentSession(sessionData.session);
        
        // Create ticket using session data
        const ticketResponse = await fetch('/api/manual-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: paymentId,
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
          setSessionError(ticketData.error || 'Failed to create ticket');
        }
      } else {
        console.log('Payment session not found, trying fallback ticket creation');
        // Payment session not found, but payment was successful
        // Try to create ticket with fallback method
        try {
          const fallbackResponse = await fetch('/api/create-ticket-fallback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: paymentId,
              eventId: searchParams.get('eventId'), // Try to get from URL params
              userId: searchParams.get('userId'), // Try to get from URL params
              amount: searchParams.get('amount'), // Try to get from URL params
              quantity: searchParams.get('quantity') || 1,
            }),
          });
          
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.success) {
            setTicketCreated(true);
            console.log('Fallback ticket created:', fallbackData.ticketId);
          } else {
            console.error('Fallback ticket creation failed:', fallbackData.error);
            setSessionError('Payment successful but ticket creation failed. Please contact support with payment ID: ' + paymentId);
          }
        } catch (fallbackError) {
          console.error('Fallback ticket creation error:', fallbackError);
          setSessionError('Payment successful but ticket creation requires manual intervention. Please contact support with payment ID: ' + paymentId);
        }
      }
    } catch (error) {
      console.error('Failed to process Razorpay payment:', error);
      setSessionError(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine the UI state based on payment status
  const isPaymentSuccessful = ticketCreated && !sessionError;
  const isPaymentFailed = sessionError && !isLoading;
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
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {sessionError}
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

export default function PurchaseSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>}>
      <PurchaseSuccessContent />
    </Suspense>
  );
}