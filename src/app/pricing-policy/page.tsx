"use client";

import { ArrowLeft, DollarSign, CreditCard, Calculator, TrendingUp, Info, Shield } from "lucide-react";
import Link from "next/link";

export default function PricingPolicyPage() {
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
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-12 text-white text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <DollarSign className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Pricing Policy</h1>
            </div>
            <p className="text-green-100 text-lg">
              Transparent pricing for all ticket transactions
            </p>
            <p className="text-green-200 text-sm mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-green-600" />
                1. Pricing Overview
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  TICKETr operates on a transparent pricing model that ensures fair pricing for both 
                  event organizers and ticket buyers. All prices are displayed in Indian Rupees (INR) 
                  and include applicable taxes unless otherwise specified.
                </p>
              </div>
            </section>

            {/* Pricing Structure */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-green-600" />
                2. Pass Categories & Pricing
              </h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2.1 Pass Categories</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  YOLO CLUB offers various pass categories to suit different preferences and group sizes:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Individual Passes
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li><strong>Stag Female:</strong> ₹599 - Standard entry with basic amenities</li>
                      <li><strong>Couple Pass:</strong> ₹799 - Premium experience with exclusive perks</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Group Passes
                    </h4>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li><strong>Group of 5:</strong> ₹2,700 - At least one female required</li>
                      <li><strong>Group of 7:</strong> ₹3,600 - Best value for groups</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Seasonal Passes
                    </h4>
                    <ul className="space-y-2 text-sm text-purple-700">
                      <li><strong>Season Pass Couple:</strong> ₹3,999 - Valid for all days</li>
                      <li><strong>All Day Early Bird:</strong> Special pricing for early access</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Premium Categories
                    </h4>
                    <ul className="space-y-2 text-sm text-orange-700">
                      <li><strong>VIP Pass:</strong> Premium experience with priority access</li>
                      <li><strong>General Pass:</strong> Standard entry with full event access</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2.2 Service Fees</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">For Event Organizers:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                        <li>Platform fee: 2.5% per ticket sold</li>
                        <li>Payment processing fee: 1.5% per transaction</li>
                        <li>No setup or monthly fees</li>
                        <li>Free event listing and promotion</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">For Ticket Buyers:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                        <li>Convenience fee: ₹10 per ticket</li>
                        <li>Payment gateway charges: As per bank rates</li>
                        <li>No hidden charges</li>
                        <li>All fees displayed upfront</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Methods */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-green-600" />
                3. Payment Methods & Charges
              </h2>
              <div className="prose prose-gray max-w-none">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Processing Fee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Processing Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          UPI Payments
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹5 per transaction
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Instant
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Credit/Debit Cards
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2.5% of transaction value
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          1-2 business days
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Net Banking
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹10 per transaction
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Instant
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Wallets (Paytm, PhonePe)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹5 per transaction
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Instant
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Dynamic Pricing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                4. Dynamic Pricing
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Event organizers may implement dynamic pricing strategies:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li><strong>Early Bird Pricing:</strong> Discounted rates for early purchasers</li>
                  <li><strong>Tiered Pricing:</strong> Different prices for different seating sections</li>
                  <li><strong>Group Discounts:</strong> Special rates for bulk purchases</li>
                  <li><strong>Last-Minute Pricing:</strong> Dynamic adjustments based on demand</li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> All pricing changes are clearly communicated to users 
                    before purchase. Dynamic pricing is subject to organizer discretion and 
                    platform guidelines.
                  </p>
                </div>
              </div>
            </section>

            {/* Refund Pricing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                5. Refund Pricing
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Refund amounts are calculated based on the following:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Full refund of base ticket price</li>
                  <li>Convenience fees are non-refundable</li>
                  <li>Payment processing fees are non-refundable</li>
                  <li>Service fees are refunded only in case of event cancellation by organizer</li>
                </ul>
              </div>
            </section>

            {/* Price Guarantee */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                6. Price Guarantee
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  We guarantee that:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>All prices are displayed clearly before purchase</li>
                  <li>No hidden charges or surprise fees</li>
                  <li>Price changes are communicated in advance</li>
                  <li>Refund policies are clearly stated</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-green-600" />
                7. Questions About Pricing
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about our pricing policy, please contact us:
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-700">
                    <strong>Email:</strong> vinayak.parsewar55@gmail.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Phone:</strong> +91 9822028988
                  </p>
                  <p className="text-gray-700">
                    <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
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
