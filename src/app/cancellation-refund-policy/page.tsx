"use client";

import { ArrowLeft, RotateCcw, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function CancellationRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-800 px-8 py-12 text-white text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RotateCcw className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Cancellation & Refund Policy</h1>
            </div>
            <p className="text-orange-100 text-lg">
              Clear guidelines for cancellations and refunds
            </p>
            <p className="text-orange-200 text-sm mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-600" />
                1. Policy Overview
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  This Cancellation & Refund Policy outlines the terms and conditions for ticket 
                  cancellations and refunds on the TICKETr platform. Please read this policy 
                  carefully before making a purchase.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Important:</strong> Refund eligibility depends on the timing of 
                    cancellation and the event organizer's specific policies.
                  </p>
                </div>
              </div>
            </section>

            {/* Cancellation Timeframes */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-600" />
                2. Cancellation Timeframes
              </h2>
              <div className="prose prose-gray max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-800">Full Refund</h3>
                    </div>
                    <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                      <li>More than 48 hours before event</li>
                      <li>Event cancelled by organizer</li>
                      <li>Event postponed indefinitely</li>
                      <li>Venue change (if not acceptable)</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-yellow-800">Partial Refund</h3>
                    </div>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
                      <li>24-48 hours before event: 75% refund</li>
                      <li>12-24 hours before event: 50% refund</li>
                      <li>Event postponed with new date</li>
                      <li>Minor venue changes</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-800">No Refund</h3>
                    </div>
                    <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                      <li>Less than 12 hours before event</li>
                      <li>Event has already started</li>
                      <li>No-show without prior cancellation</li>
                      <li>Weather-related cancellations (outdoor events)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Special Cases</h3>
                    </div>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li>Medical emergencies: Case-by-case review</li>
                      <li>Force majeure events: Full refund</li>
                      <li>Technical issues: Full refund</li>
                      <li>Duplicate purchases: Full refund</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Process */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-orange-600" />
                3. Refund Process
              </h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3.1 How to Request a Refund</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Log into your TICKETr account</li>
                  <li>Go to "My Tickets" section</li>
                  <li>Select the ticket you want to cancel</li>
                  <li>Click "Request Refund" button</li>
                  <li>Provide reason for cancellation</li>
                  <li>Submit the request</li>
                </ol>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">3.2 Refund Processing Time</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Processing Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Refund Method
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          UPI Payments
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          1-2 business days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Original UPI account
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Credit/Debit Cards
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          5-7 business days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Original card
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Net Banking
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2-3 business days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Original bank account
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Wallets
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          1-2 business days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Original wallet
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Refund Amount Calculation */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-orange-600" />
                4. Refund Amount Calculation
              </h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.1 What's Included in Refund</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Base ticket price (100% refundable)</li>
                  <li>Service fees (refundable only in case of organizer cancellation)</li>
                  <li>Convenience fees (non-refundable)</li>
                  <li>Payment processing fees (non-refundable)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">4.2 Refund Calculation Examples</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Full Refund Scenario</h4>
                      <p className="text-sm text-gray-700">
                        Ticket Price: ₹500 + Convenience Fee: ₹10 + Service Fee: ₹15 = ₹525<br/>
                        <strong>Refund Amount: ₹500</strong> (Base ticket price only)
                      </p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Partial Refund Scenario (75%)</h4>
                      <p className="text-sm text-gray-700">
                        Ticket Price: ₹500 + Convenience Fee: ₹10 + Service Fee: ₹15 = ₹525<br/>
                        <strong>Refund Amount: ₹375</strong> (75% of base ticket price)
                      </p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-900">No Refund Scenario</h4>
                      <p className="text-sm text-gray-700">
                        Ticket Price: ₹500 + Convenience Fee: ₹10 + Service Fee: ₹15 = ₹525<br/>
                        <strong>Refund Amount: ₹0</strong> (No refund applicable)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Event Organizer Cancellations */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                5. Event Organizer Cancellations
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  When an event is cancelled by the organizer:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>All ticket holders will be notified via email and SMS</li>
                  <li>Full refunds will be processed automatically</li>
                  <li>Refunds include base ticket price and service fees</li>
                  <li>Convenience fees are non-refundable</li>
                  <li>Processing time: 3-5 business days</li>
                </ul>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-600" />
                6. Dispute Resolution
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  If you disagree with a refund decision:
                </p>
                <ol className="list-decimal list-inside text-gray-700 mt-4 space-y-2">
                  <li>Contact our customer support within 7 days</li>
                  <li>Provide detailed explanation and supporting documents</li>
                  <li>Our team will review your case within 48 hours</li>
                  <li>Final decision will be communicated via email</li>
                  <li>Escalation to senior management if needed</li>
                </ol>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-orange-600" />
                7. Contact for Refunds
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  For refund-related queries or assistance:
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-700">
                    <strong>Email:</strong> vinayak.parsewar55@gmail.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Phone:</strong> +91 9822028988
                  </p>
                  <p className="text-gray-700">
                    <strong>WhatsApp:</strong> +91 9822028988
                  </p>
                  <p className="text-gray-700">
                    <strong>Business Hours:</strong> Monday - Sunday, 9:00 AM - 9:00 PM IST
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
