"use client";

import Link from "next/link";
import { ArrowLeft, Users, HeartHandshake, Star, Rocket, Building2, MapPin, Phone, Mail } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">About Us</h1>
          <p className="mt-3 text-blue-100 max-w-3xl mx-auto">
            We create seamless, secure and delightful ticketing experiences for events you love.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Card: Our Story */}
        <section className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Our Story</h2>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <p className="text-gray-700 leading-relaxed">
                From intimate cultural evenings to large-format festivals, our platform powers
                modern event ticketing with reliability and speed. Organizers get robust tools
                for listings, payments, verifications and analytics; guests enjoy quick checkout,
                secure payments including UPI/PhonePe, and instant ticket delivery.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                We’re focused on transparency, fair pricing, and real-time support to make every
                event successful for both organizers and attendees.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 text-blue-800 font-medium">
                  <Rocket className="w-5 h-5" /> Mission
                </div>
                <p className="text-sm text-blue-900 mt-2">
                  Empower organizers and delight guests with a frictionless ticketing journey.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2 text-purple-800 font-medium">
                  <Star className="w-5 h-5" /> Vision
                </div>
                <p className="text-sm text-purple-900 mt-2">
                  Be the most trusted platform for cultural, entertainment and community events.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Card Grid: What we do */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
              <Building2 className="w-5 h-5 text-blue-600" /> For Organizers
            </div>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>Event creation and pass management</li>
              <li>PhonePe/UPI payments and verifications</li>
              <li>Analytics and day-wise insights</li>
              <li>Ticket emails and QR validation</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
              <Users className="w-5 h-5 text-green-600" /> For Guests
            </div>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>Fast checkout with UPI deep links</li>
              <li>Clear pricing and pass categories</li>
              <li>Inline payment notification to organizer</li>
              <li>My Tickets hub with secure access</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
              <HeartHandshake className="w-5 h-5 text-rose-600" /> Our Values
            </div>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>Transparency and fair pricing</li>
              <li>Reliability at peak demand</li>
              <li>Data privacy and security</li>
              <li>Responsive human support</li>
            </ul>
          </div>
        </section>

        {/* Card: Contact / Location */}
        <section className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Get in Touch</h2>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-blue-600 mt-1" />
              <div>
                <div className="font-medium text-gray-900">Email</div>
                <div>vinayak.parsewar55@gmail.com</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-blue-600 mt-1" />
              <div>
                <div className="font-medium text-gray-900">Phone</div>
                <div>+91 9822028988</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-blue-600 mt-1" />
              <div>
                <div className="font-medium text-gray-900">Address</div>
                <div>N9 A15 34/4 SHIVNERI COLONY CIDCO, Aurangabad, Maharashtra, India</div>
              </div>
            </div>
          </div>
          <div className="px-6 sm:px-8 pb-6">
            <p className="text-xs text-gray-500">
              Inspiration for structure and presentation was taken from the About page style at
              <a href="https://malangevents.com/about-us" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1">malangevents.com</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}


