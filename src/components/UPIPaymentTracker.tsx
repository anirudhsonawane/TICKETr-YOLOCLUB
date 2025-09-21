"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign, Ticket, Upload, Eye } from "lucide-react";
import { toast } from "sonner";

interface UPIPaymentTrackerProps {
  eventId: Id<"events">;
}

// Use the actual Convex data model instead of interface

export default function UPIPaymentTracker({ eventId }: UPIPaymentTrackerProps) {
  const { user } = useUser();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const event = useQuery(api.events.getById, { eventId });
  const isEventOwner = user?.id === event?.userId;

  // Get real payment notifications from Convex database
  const paymentNotifications = useQuery(api.paymentNotifications?.getByEvent, { eventId });

  const updateNotificationStatus = useMutation(api.paymentNotifications?.updateStatus);

  const handleVerifyPayment = async (notification: any) => {
    setIsProcessing(true);
    try {
      // Call your manual UPI ticket creation API
      const response = await fetch('/api/manual-upi-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: notification.eventId,
          userId: notification.userId,
          paymentReference: `UPI-${notification._id}`,
          quantity: notification.quantity,
          amount: notification.amount,
          passId: notification.passId,
          upiTransactionId: notification.upiTransactionId,
          notes: notification.notes
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update notification status to verified in Convex
        await updateNotificationStatus?.({
          notificationId: notification._id,
          status: 'verified',
          ticketCreated: true
        });
        
        setSelectedPayment(null);
        toast.success("Payment verified and ticket created!");
      } else {
        toast.error("Failed to verify payment: " + result.error);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Failed to verify payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async (notification: any) => {
    try {
      await updateNotificationStatus?.({
        notificationId: notification._id,
        status: 'rejected'
      });
      
      setSelectedPayment(null);
      toast.success("Payment rejected");
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error("Failed to reject payment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'verified': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
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

  if (!paymentNotifications) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment notifications...</p>
        </div>
      </div>
    );
  }

  const pendingPayments = paymentNotifications.filter(p => p.status === 'pending');
  const verifiedPayments = paymentNotifications.filter(p => p.status === 'verified');
  const rejectedPayments = paymentNotifications.filter(p => p.status === 'rejected');

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingPayments.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Verified</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{verifiedPayments.length}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">{rejectedPayments.length}</p>
          </div>
        </div>

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Pending Payments ({pendingPayments.length})</h4>
            
            {pendingPayments.map((payment) => (
              <div
                key={payment._id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPayment?._id === payment._id
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
                        {payment.userInfo?.name || 'Unknown User'} • {new Date(payment._creationTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPayment(payment);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Details */}
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
                <span className="text-gray-600">User:</span>
                <span className="font-medium">{selectedPayment.userInfo?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{selectedPayment.userInfo?.email || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Time:</span>
                <span className="font-medium">{new Date(selectedPayment._creationTime).toLocaleString()}</span>
              </div>
              {selectedPayment.paymentProof && (
                <div className="mt-2">
                  <span className="text-gray-600">Payment Proof:</span>
                  <p className="text-sm text-gray-800 mt-1">{selectedPayment.paymentProof}</p>
                </div>
              )}
              {selectedPayment.notes && (
                <div className="mt-2">
                  <span className="text-gray-600">Notes:</span>
                  <p className="text-sm text-gray-800 mt-1">{selectedPayment.notes}</p>
                </div>
              )}
            </div>

            {selectedPayment.status === 'pending' && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleVerifyPayment(selectedPayment)}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Ticket className="w-4 h-4" />
                  {isProcessing ? 'Verifying...' : 'Verify & Create Ticket'}
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
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2">Payment Verification Instructions</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check your bank account or UPI app for incoming payments</li>
            <li>• Verify the amount, sender details, and payment reference</li>
            <li>• Match the payment with the customer's information</li>
            <li>• Only verify payments after confirming receipt in your account</li>
            <li>• Keep records of all verified payments for accounting</li>
          </ul>
        </div>

        {/* Recent Activity */}
        {(verifiedPayments.length > 0 || rejectedPayments.length > 0) && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Recent Activity</h4>
            <div className="space-y-2">
              {[...verifiedPayments, ...rejectedPayments]
                .sort((a, b) => b._creationTime - a._creationTime)
                .slice(0, 5)
                .map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(payment.status)}
                    <span className="text-sm">
                      {payment.userInfo?.name || 'Unknown User'} - ₹{payment.amount}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
