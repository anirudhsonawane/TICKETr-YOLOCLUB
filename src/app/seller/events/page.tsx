"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import SellerEventList from "@/components/SellerEventList";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

// Authorized event creators (add developer-approved email addresses here)
const AUTHORIZED_CREATOR_EMAILS: string[] = [
  'anirudhsonawane111@gmail.com',
  'gauravbhagwat999@gmail.com',
  // Add more authorized creator emails here
];

export default function SellerEventsPage() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return <SellerEventsContent />;
}

function SellerEventsContent() {
  const { user } = useAuth();
  
  if (!user) {
    redirect("/");
  }
  
  if (!AUTHORIZED_CREATOR_EMAILS.includes(user.email?.toLowerCase() || '')) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerEventList />
    </div>
  );
}