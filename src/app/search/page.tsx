"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import EventCard from "../../components/EventCard";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);

  const events = useQuery(api.events.getEvents);

  // Filter events based on search query
  const filteredEvents = events?.filter((event) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.category.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-600">
            Showing results for: <span className="font-semibold">"{query}"</span>
          </p>
        )}
      </div>

      {filteredEvents && filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-500">
            {query
              ? `No events match your search for "${query}"`
              : "Try searching for events"}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
