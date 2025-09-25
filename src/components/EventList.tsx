"use client";

import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import EventCard from "./EventCard";
import Spinner from "./Spinner";
import { CalendarDays, Ticket } from "lucide-react";

export default function EventList() {
  const events = useQuery(api.events.get);

  // Add error handling
  if (events === undefined) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (events === null) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600">Error loading events</h3>
          <p className="text-gray-600 mt-2">There was an error connecting to the database</p>
        </div>
      </div>
    );
  }

  // Simplified: show all events for now
  const allEvents = events.sort((a, b) => a.eventDate - b.eventDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="mt-2 text-gray-600">
            Discover & book tickets for amazing events
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">
              {allEvents.length} Events
            </span>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {allEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {allEvents.map((event) => (
            <EventCard key={event._id} eventId={event._id} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center mb-12">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No events found
          </h3>
          <p className="text-gray-600 mt-1">Check back later for new events</p>
        </div>
      )}
    </div>
  );
}