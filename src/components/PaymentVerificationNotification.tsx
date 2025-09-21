"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Bell } from "lucide-react";
import { Badge } from "./ui/badge";
import Link from "next/link";

export default function PaymentVerificationNotification() {
  const pendingCount = useQuery(api.paymentVerifications.getPendingVerificationsCount);

  // Handle loading and error states gracefully
  if (pendingCount === undefined) {
    return null; // Loading state
  }

  // Handle potential errors or null values
  if (pendingCount === null || pendingCount === 0) {
    return null; // No notifications or error state
  }

  return (
    <Link href="/seller/payment-verifications" className="relative">
      <Bell className="h-5 w-5 text-gray-600 hover:text-gray-900 transition-colors" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
      >
        {pendingCount}
      </Badge>
    </Link>
  );
}
