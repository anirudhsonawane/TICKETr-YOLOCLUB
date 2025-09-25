"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isAuthorizedAdmin } from "@/lib/admin-config";
import AdminNavigation from "@/components/AdminNavigation";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Lock, BarChart3 } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { user, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      const userEmail = user.email || '';
      const authorized = isAuthorizedAdmin(userEmail);
      setIsAuthorized(authorized);
      setIsCheckingAuth(false);
    }
  }, [isLoading, user]);

  // Show loading state
  if (isLoading || isCheckingAuth) {
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
              You don't have permission to access the analytics panel.
            </p>
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
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8" />
              <h1 className="text-3xl font-bold">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-blue-100 text-lg">
              Comprehensive analytics and insights for your ticket sales and payments
            </p>
          </div>

          {/* Analytics Dashboard */}
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );
}
