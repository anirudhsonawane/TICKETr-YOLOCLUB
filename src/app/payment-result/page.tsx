"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock, Bell, QrCode, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import NotifyOrganizer from "@/components/NotifyOrganizer";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [showNotifyOrganizer, setShowNotifyOrganizer] = useState(false);
  const [showNotifyForm, setShowNotifyForm] = useState(false);

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
      console.log('Verifying payment for order:', orderId);
      
      // Check if this is a UPI payment (starts with UPI_)
      if (orderId && orderId.startsWith('UPI_')) {
        console.log('UPI payment detected, checking status from URL params');
        
        // For UPI payments, use the status from URL parameters
        const urlStatus = searchParams.get("status");
        console.log('URL status:', urlStatus);
        
        if (urlStatus === 'COMPLETED') {
          setPaymentStatus('COMPLETED');
          
          // Create a mock payment session for UPI payments
          const mockPaymentSession = {
            id: orderId,
            eventId: searchParams.get("eventId") || "",
            userId: searchParams.get("userId") || "",
            amount: parseFloat(searchParams.get("amount") || "0"),
            quantity: parseInt(searchParams.get("quantity") || "1"),
            passId: searchParams.get("passId") || undefined,
            selectedDate: searchParams.get("selectedDate") || undefined,
            paymentMethod: 'upi',
            status: 'completed',
            event: {
              name: searchParams.get("eventName") || "Event",
              organizerUpiId: searchParams.get("organizerUpiId") || "9595961116@ptsbi"
            }
          };
          
          setPaymentSession(mockPaymentSession);
          setShowNotifyOrganizer(true);
          setIsLoading(false);
          return;
        } else {
          setPaymentStatus(urlStatus || 'FAILED');
          setIsLoading(false);
          return;
        }
      }
      
      // For non-UPI payments, verify with PhonePe API
      const verifyResponse = await fetch('/api/phonepe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantOrderId: orderId }),
      });
      
      const verifyData = await verifyResponse.json();
      console.log('PhonePe verification response:', verifyData);
      
      if (!verifyResponse.ok || !verifyData.success) {
        console.error('PhonePe verification failed:', {
          status: verifyResponse.status,
          response: verifyData
        });
        throw new Error(verifyData.details || 'Payment verification failed');
      }
      
      console.log('Payment status received:', verifyData.paymentStatus);
      setPaymentStatus(verifyData.paymentStatus);
      
      // If payment is successful, check if it's UPI payment or other payment method
      const isPaymentSuccessful = verifyData.paymentStatus === 'COMPLETED' || 
                                 verifyData.paymentStatus === 'SUCCESS' || 
                                 verifyData.paymentStatus === 'PAYMENT_SUCCESS';
      
      if (isPaymentSuccessful) {
        console.log('Payment is completed, checking payment method...');
        
        // Get payment session to determine payment method
        const sessionResponse = await fetch(`/api/payment-sessions?sessionId=${orderId}`);
        const sessionData = await sessionResponse.json();
        
        if (sessionData.success && sessionData.session) {
          setPaymentSession(sessionData.session);
          
          // If it's UPI payment, show notify organizer form instead of creating ticket
          if (sessionData.session.paymentMethod === 'upi') {
            console.log('UPI payment detected, showing notify organizer form');
            setShowNotifyOrganizer(true);
          } else {
            // For other payment methods (Razorpay, PhonePe), create ticket automatically
            console.log('Non-UPI payment detected, creating ticket automatically');
            await createTicket();
          }
        } else {
          console.log('Payment session not found, defaulting to ticket creation');
          await createTicket();
        }
      } else {
        console.log('Payment not completed, status:', verifyData.paymentStatus);
      }
      
    } catch (error) {
      console.error('Payment verification failed:', error);
      setError(error instanceof Error ? error.message : 'Payment verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async () => {
    try {
      console.log('Creating ticket for order:', orderId);
      
      // Get payment session and create ticket
      const sessionResponse = await fetch(`/api/payment-sessions?sessionId=${orderId}`);
      const sessionData = await sessionResponse.json();
      
      console.log('Payment session response:', sessionData);
      
      if (sessionData.success && sessionData.session) {
        setPaymentSession(sessionData.session);
        
        // Check if tickets already exist for this payment (webhook might have created them)
        const existingTicketsResponse = await fetch(`/api/tickets/by-payment?paymentId=${orderId}`);
        const existingTicketsData = await existingTicketsResponse.json();
        
        if (existingTicketsData.success && existingTicketsData.tickets && existingTicketsData.tickets.length > 0) {
          // Tickets already exist, mark as created
          setTicketCreated(true);
          console.log('✅ Tickets already exist:', existingTicketsData.tickets);
          return;
        }
        
        console.log('Creating ticket with session data:', {
          paymentId: orderId,
          eventId: sessionData.session.eventId,
          userId: sessionData.session.userId,
          quantity: sessionData.session.quantity,
          amount: sessionData.session.amount,
          passId: sessionData.session.passId,
          selectedDate: sessionData.session.selectedDate,
        });
        
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
        console.log('Ticket creation response:', ticketData);
        
        if (ticketData.success) {
          setTicketCreated(true);
          console.log('✅ Ticket created successfully:', ticketData.ticketId);
        } else {
          console.error('❌ Failed to create ticket:', ticketData.error);
          setError(ticketData.error || 'Failed to create ticket');
        }
      } else {
        console.log('Payment session not found, trying fallback ticket creation');
        // Payment session not found, but payment was successful
        // Try to get payment details from localStorage first
        let fallbackData = null;
        try {
          const storedData = localStorage.getItem('phonepe_payment_fallback');
          if (storedData) {
            fallbackData = JSON.parse(storedData);
            console.log('Found fallback data in localStorage:', fallbackData);
          }
        } catch (error) {
          console.warn('Error reading localStorage fallback data:', error);
        }
        
        // Try to create ticket with fallback method
        try {
          const fallbackResponse = await fetch('/api/create-ticket-fallback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderId,
              eventId: fallbackData?.eventId || searchParams.get('eventId'),
              userId: fallbackData?.userId || searchParams.get('userId'),
              amount: fallbackData?.amount || searchParams.get('amount'),
              quantity: fallbackData?.quantity || searchParams.get('quantity') || 1,
            }),
          });
          
          const fallbackResult = await fallbackResponse.json();
          
          if (fallbackResult.success) {
            setTicketCreated(true);
            console.log('✅ Fallback ticket created:', fallbackResult.ticketId);
            // Clear localStorage fallback data
            localStorage.removeItem('phonepe_payment_fallback');
          } else {
            console.error('❌ Fallback ticket creation failed:', fallbackResult.error);
            setError('Payment successful but ticket creation failed. Please contact support with payment ID: ' + orderId);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback ticket creation error:', fallbackError);
          setError('Payment successful but ticket creation requires manual intervention. Please contact support with payment ID: ' + orderId);
        }
      }
    } catch (error) {
      console.error('❌ Failed to create ticket:', error);
      setError(error instanceof Error ? error.message : 'Failed to create ticket');
    }
  };

  // Determine the UI state based on payment status
  const isPaymentSuccessful = (paymentStatus === 'COMPLETED' || 
                              paymentStatus === 'SUCCESS' || 
                              paymentStatus === 'PAYMENT_SUCCESS') && 
                             (ticketCreated || showNotifyOrganizer) && !error;
  const isPaymentFailed = (paymentStatus && 
                          paymentStatus !== 'COMPLETED' && 
                          paymentStatus !== 'SUCCESS' && 
                          paymentStatus !== 'PAYMENT_SUCCESS') || (error && !isPaymentSuccessful);
  const isPaymentPending = isLoading;

  // Show NotifyOrganizer component for UPI payments
  if (showNotifyOrganizer && paymentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Payment Success Header */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Payment completed!
                      </h1>
                      <p className="text-gray-600 mb-6">
                        If payment completed, then notify organizer to get your tickets.
                      </p>

          {/* Payment Details */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₹{paymentSession.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Note:</span>
                <span className="font-medium">{paymentSession.quantity} ticket for {paymentSession.event?.name || 'Event'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UPI ID:</span>
                <span className="font-medium">9595961116@ptsbi</span>
              </div>
            </div>
          </div>

          {/* Notify Organizer Button */}
          <button
            onClick={() => {
              setShowNotifyForm(true);
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center"
          >
            <Bell className="w-5 h-5 mr-2" />
            Notify Organizer About Payment
          </button>

          {/* QR Code and Copy Link buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center">
              <QrCode className="w-4 h-4 mr-2" />
              Show QR Code
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Secure UPI payment - Contact organizer after payment for ticket verification
          </p>
        </div>
      </div>
    );
  }

  // Show NotifyOrganizer form after clicking the button
  if (showNotifyForm && paymentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <NotifyOrganizer
          eventId={paymentSession.eventId}
          eventName={paymentSession.event?.name || 'Unknown Event'}
          amount={paymentSession.amount}
          quantity={paymentSession.quantity}
          passId={paymentSession.passId}
          selectedDate={paymentSession.selectedDate}
                      organizerUpiId={paymentSession.event?.organizerUpiId || "9595961116@ptsbi"}
          onSuccess={() => {
            setShowNotifyForm(false);
            setShowNotifyOrganizer(false);
          }}
          onError={(error) => {
            setError(error);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success State */}
        {isPaymentSuccessful && !showNotifyOrganizer && (
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
