"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { isAuthorizedAdmin } from "@/lib/admin-config";
import AdminNavigation from "@/components/AdminNavigation";
import { Id } from "../../../../convex/_generated/dataModel";
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  X,
  Eye,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const { user, isLoaded } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Get all events for the admin
  const events = useQuery(api.events.getAll);
  
  // Get payment notifications
  const paymentNotifications = useQuery(api.paymentNotifications.getAllPending);
  const paymentStats = useQuery(api.paymentNotifications.getStats);
  
  // Mutations
  const updatePaymentStatus = useMutation(api.paymentNotifications.updateStatus);

  useEffect(() => {
    if (isLoaded && user) {
      const userEmail = user.emailAddresses[0]?.emailAddress || '';
      const authorized = isAuthorizedAdmin(userEmail);
      setIsAuthorized(authorized);
      setIsCheckingAuth(false);
    }
  }, [isLoaded, user]);

  // Show loading state
  if (!isLoaded || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized access message
  if (!isAuthorized || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the admin panel.
            </p>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Authorized admins only:</strong> This panel is restricted to verified administrators.
              </p>
            </div>
            {user && (
              <p className="text-sm text-gray-500 mt-4">
                Logged in as: {user.emailAddresses[0]?.emailAddress}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <AdminNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8" />
              <h2 className="text-2xl font-bold">
                Welcome to Admin Panel
              </h2>
            </div>
            <p className="text-blue-100 mb-4">
              Manage and verify UPI payments for all events. You have full access to payment verification and ticket creation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-medium">Payment Verification</span>
                </div>
                <p className="text-sm text-blue-100">
                  Verify UPI payments and create tickets
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Customer Support</span>
                </div>
                <p className="text-sm text-blue-100">
                  Handle payment disputes and issues
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                </div>
                <p className="text-sm text-blue-100">
                  Track payment success rates
                </p>
              </div>
            </div>
          </div>

          {/* Payment Statistics */}
          {paymentStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{paymentStats.pending}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{paymentStats.verified}</p>
                    <p className="text-sm text-gray-600">Verified</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{paymentStats.rejected}</p>
                    <p className="text-sm text-gray-600">Rejected</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{paymentStats.totalAmount}</p>
                    <p className="text-sm text-gray-600">Total Amount</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Payment Notifications */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Pending Payment Verifications
                </h3>
                {paymentNotifications && (
                  <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {paymentNotifications.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Verify UPI payments and create tickets for customers
              </p>
            </div>

            <div className="p-6">
              {!paymentNotifications ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payment notifications...</p>
                </div>
              ) : paymentNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending payment verifications</p>
                  <p className="text-sm text-gray-500 mt-1">All payments have been processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentNotifications.map((notification) => (
                    <PaymentNotificationCard 
                      key={notification._id} 
                      notification={notification}
                      onStatusUpdate={updatePaymentStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">
                  Admin Instructions
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <strong>Verify payments manually:</strong> Check your bank/UPI app for incoming payments</li>
                  <li>• <strong>Match details:</strong> Ensure amount, customer info, and event details match</li>
                  <li>• <strong>Create tickets:</strong> Only create tickets after confirming payment receipt</li>
                  <li>• <strong>Keep records:</strong> Maintain records of all verified payments</li>
                  <li>• <strong>Respond quickly:</strong> Verify payments within 24 hours of customer submission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment Notification Card Component
function PaymentNotificationCard({ 
  notification, 
  onStatusUpdate 
}: { 
  notification: any;
  onStatusUpdate: any;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: "verified" | "rejected") => {
    setIsUpdating(true);
    try {
      // Update payment notification status
      await onStatusUpdate({
        notificationId: notification._id,
        status,
        ticketCreated: status === "verified"
      });

      // If verified, create ticket
      if (status === "verified") {
        console.log("Creating ticket for verified payment:", notification);
        
        const ticketData = {
          eventId: notification.eventId,
          userId: notification.userId,
          paymentId: `UPI_${notification._id}`,
          quantity: notification.quantity,
          amount: notification.amount,
          passId: notification.passId
        };
        
        console.log("Ticket creation data:", ticketData);
        
        try {
          const ticketResponse = await fetch('/api/manual-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
          });

          console.log("Ticket creation response status:", ticketResponse.status);
          const ticketResult = await ticketResponse.json();
          console.log("Ticket creation result:", ticketResult);
          
          if (ticketResult.success) {
            toast.success(`Payment verified and ticket created successfully! Ticket ID: ${ticketResult.ticketId}`);
          } else {
            console.error("Failed to create ticket:", ticketResult.error);
            toast.error(`Payment verified but failed to create ticket: ${ticketResult.error}`);
          }
        } catch (ticketError) {
          console.error("Error creating ticket:", ticketError);
          toast.error(`Payment verified but failed to create ticket: ${ticketError instanceof Error ? ticketError.message : 'Unknown error'}`);
        }
      } else {
        toast.success(`Payment ${status} successfully!`);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-900">
              Payment Verification Request
            </h4>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              Pending
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600"><strong>Amount:</strong> ₹{notification.amount}</p>
              <p className="text-gray-600"><strong>Quantity:</strong> {notification.quantity} ticket{notification.quantity > 1 ? 's' : ''}</p>
              <p className="text-gray-600"><strong>Transaction ID:</strong> {notification.upiTransactionId}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Payee Name:</strong> {notification.payeeName}</p>
              <p className="text-gray-600"><strong>Mobile:</strong> {notification.payeeMobileNumber}</p>
              <p className="text-gray-600"><strong>Submitted:</strong> {new Date(notification._creationTime).toLocaleString()}</p>
            </div>
          </div>
          {notification.userInfo && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Customer Info:</strong> {notification.userInfo.name} ({notification.userInfo.email})
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleStatusUpdate("verified")}
          disabled={isUpdating}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          {isUpdating ? "Verifying..." : "Verify & Create Ticket"}
        </button>
        <button
          onClick={() => handleStatusUpdate("rejected")}
          disabled={isUpdating}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          {isUpdating ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
