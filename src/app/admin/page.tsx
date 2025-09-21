"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isAuthorizedAdmin } from "@/lib/admin-config";
import AdminNavigation from "@/components/AdminNavigation";
import Link from "next/link";
import { 
  Shield, 
  Lock, 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  BarChart3
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Get all events for the admin
  const events = useQuery(api.events.getAll);
  const paymentStats = useQuery(api.paymentNotifications?.getStats);
  const allPendingPayments = useQuery(api.paymentNotifications?.getAllPending);

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

    // Real data for dashboard stats
    const dashboardStats = {
      totalEvents: events?.length || 0,
      pendingPayments: paymentStats?.pending || 0,
      verifiedPayments: paymentStats?.verified || 0,
      totalRevenue: paymentStats?.totalAmount || 0,
      rejectedPayments: paymentStats?.rejected || 0
    };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <AdminNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user.fullName || 'Admin'}!
                </h1>
                <p className="text-blue-100 text-lg">
                  Manage your UPI payment system and verify customer payments
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <Shield className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalEvents}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingPayments}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Payments</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.verifiedPayments}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Verification */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment Verification
                    </h3>
                    <p className="text-sm text-gray-600">
                      Verify UPI payments and create tickets
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  You have <span className="font-semibold text-yellow-600">{dashboardStats.pendingPayments} pending payments</span> waiting for verification.
                </p>
                <Link
                  href="/admin/payments"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify Payments
                </Link>
              </div>
            </div>

            {/* Events Management */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Events Management
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage all events and tickets
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  You have <span className="font-semibold text-blue-600">{dashboardStats.totalEvents} active events</span> in your system.
                </p>
                <Link
                  href="/admin/events"
                  className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Manage Events
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                  <p className="text-sm text-gray-600">
                    Latest payment verifications and ticket creations
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Mock recent activity */}
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Payment verified</p>
                    <p className="text-xs text-gray-600">John Doe - ₹750 - Event Ticket</p>
                  </div>
                  <span className="text-xs text-gray-500">2 minutes ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Payment pending</p>
                    <p className="text-xs text-gray-600">Jane Smith - ₹1500 - 2 Event Tickets</p>
                  </div>
                  <span className="text-xs text-gray-500">15 minutes ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Payment verified</p>
                    <p className="text-xs text-gray-600">Mike Johnson - ₹500 - Event Pass</p>
                  </div>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  Admin Panel Instructions
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Payment Verification:</strong> Check your bank/UPI app for incoming payments before creating tickets</li>
                  <li>• <strong>Customer Support:</strong> Respond to payment verification requests within 24 hours</li>
                  <li>• <strong>Security:</strong> Always verify payment details match customer information</li>
                  <li>• <strong>Records:</strong> Keep records of all verified payments for accounting purposes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
