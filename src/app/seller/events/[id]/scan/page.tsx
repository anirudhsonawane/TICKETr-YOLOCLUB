"use client";

import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import TicketScanner from "@/components/TicketScanner";
import { redirect } from "next/navigation";
import { isAuthorizedAdmin } from "@/lib/admin-config";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function ScanTicketsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { user } = useAuth();
  const { id } = use(params);
  const eventId = id as Id<"events">;
  
  const event = useQuery(api.events.getById, { eventId });

  if (!user) {
    redirect("/");
  }

  // Check if user is event owner OR authorized admin
  const isEventOwner = event && event.userId === user.id;
  const isAuthorizedUser = user.email && isAuthorizedAdmin(user.email);
  
  if (event && !isEventOwner && !isAuthorizedUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You can only scan tickets for your own events or if you're an authorized admin.</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <TicketScanner eventId={eventId} />
    </div>
  );
}