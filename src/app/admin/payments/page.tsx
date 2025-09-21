"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
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
  BarChart3
} from "lucide-react";

export default function AdminPaymentsPage() {
  const { user, isLoaded } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Get all events for the admin
  const events = useQuery(api.events.getAll);

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

          {/* Events List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Events with Pending Payments
                </h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Select an event to verify payments and create tickets
              </p>
            </div>

            <div className="p-6">
              {!events ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No events found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <EventPaymentCard key={event._id} event={event} />
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

// Event Payment Card Component
function EventPaymentCard({ event }: { event: any }) {
  const [showPaymentTracker, setShowPaymentTracker] = useState(false);

  if (showPaymentTracker) {
    return (
      <div className="col-span-full">
        <div className="mb-4">
          <button
            onClick={() => setShowPaymentTracker(false)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Events
          </button>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Payment Verification for {event.name}</h3>
          <p className="text-gray-600">Payment verification interface will be implemented here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
         onClick={() => setShowPaymentTracker(true)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            {event.name}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {new Date(event.eventDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 line-clamp-2">
            {event.description}
          </p>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">₹{event.price}</span>
        <span className="text-blue-600 font-medium">View Payments →</span>
      </div>
    </div>
  );
}
