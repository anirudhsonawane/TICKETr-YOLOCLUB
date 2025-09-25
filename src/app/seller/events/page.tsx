"use client";

import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import SellerEventList from "@/components/SellerEventList";

export default function SellerEventsPage() {
  const { user } = useAuth();
  
  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerEventList />
    </div>
  );
}