"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function DebugPage() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="p-8">Loading...</div>;
  }

  return <DebugContent />;
}

function DebugContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">Please sign in to see your user ID</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
        <div className="space-y-2">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.name}</p>
        </div>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Copy your User ID and add it to the AUTHORIZED_CREATORS array in:</p>
          <p className="text-sm font-mono">src/app/seller/new-event/page.tsx</p>
        </div>
      </div>
    </div>
  );
}