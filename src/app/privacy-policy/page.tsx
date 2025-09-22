"use client";

import { ArrowLeft, Shield, Eye, Lock, Database, Users, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-12 text-white text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-purple-100 text-lg">
              How we collect, use, and protect your personal information
            </p>
            <p className="text-purple-200 text-sm mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-600" />
                1. Introduction
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  TICKETr ("we," "our," or "us") is committed to protecting your privacy and personal 
                  information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                  your information when you use our ticket booking platform.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By using our Service, you agree to the collection and use of information in accordance 
                  with this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-purple-600" />
                2. Information We Collect
              </h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                  <li>Date of birth and age verification</li>
                  <li>Profile pictures and preferences</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2.2 Usage Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage patterns and preferences</li>
                  <li>Event browsing and purchase history</li>
                  <li>Location data (with your consent)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2.3 Event-Related Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Event attendance records</li>
                  <li>Ticket purchase and cancellation history</li>
                  <li>Feedback and reviews</li>
                  <li>Communication with event organizers</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                3. How We Use Your Information
              </h2>
              <div className="prose prose-gray max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-3">Service Provision</h4>
                    <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                      <li>Process ticket purchases and payments</li>
                      <li>Send event confirmations and updates</li>
                      <li>Provide customer support</li>
                      <li>Manage your account and preferences</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-800 mb-3">Communication</h4>
                    <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                      <li>Send event notifications and reminders</li>
                      <li>Share promotional offers and updates</li>
                      <li>Respond to inquiries and support requests</li>
                      <li>Conduct surveys and feedback collection</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">Analytics & Improvement</h4>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
                      <li>Analyze usage patterns and trends</li>
                      <li>Improve our platform and services</li>
                      <li>Develop new features and functionality</li>
                      <li>Conduct research and analytics</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="font-semibold text-purple-800 mb-3">Legal & Security</h4>
                    <ul className="list-disc list-inside text-purple-700 space-y-1 text-sm">
                      <li>Comply with legal obligations</li>
                      <li>Prevent fraud and abuse</li>
                      <li>Enforce our terms and conditions</li>
                      <li>Protect user safety and security</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-purple-600" />
                4. Information Sharing and Disclosure
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. We may share 
                  your information only in the following circumstances:
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">4.1 Event Organizers</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Basic contact information for event management</li>
                  <li>Ticket purchase details and attendance records</li>
                  <li>Special requirements or dietary restrictions</li>
                  <li>Emergency contact information</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">4.2 Service Providers</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Payment processors for transaction processing</li>
                  <li>Email service providers for communications</li>
                  <li>Analytics providers for usage insights</li>
                  <li>Cloud storage providers for data hosting</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>When required by law or legal process</li>
                  <li>To protect our rights and property</li>
                  <li>To prevent fraud or illegal activities</li>
                  <li>In case of emergency or safety concerns</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                5. Data Security
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and databases</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                6. Your Rights and Choices
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
                </ul>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-purple-600" />
                7. Cookies and Tracking
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing Cookies:</strong> Deliver relevant advertisements</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You can control cookie settings through your browser preferences.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-purple-600" />
                8. Data Retention
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain security and prevent fraud</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Typically, we retain account information for 3 years after account closure, 
                  and transaction records for 7 years for tax and legal compliance.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                9. Children's Privacy
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Our Service is not intended for children under 13 years of age. We do not 
                  knowingly collect personal information from children under 13. If you are a 
                  parent or guardian and believe your child has provided us with personal 
                  information, please contact us immediately.
                </p>
              </div>
            </section>

            {/* Contact Us About Privacy */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us About Privacy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🛡️</span> Privacy Officer
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li><strong>Email:</strong> vinayak.parsewar55@gmail.com</li>
                    <li><strong>Phone:</strong> +91 9822028988</li>
                    <li><strong>Address:</strong> N9 A15 34/4 SHIVNERI COLONY CIDCO, Aurangabad, Maharashtra, India</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚖️</span> Data Protection Rights
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li><strong>Response Time:</strong> Within 30 days</li>
                    <li><strong>Complaints:</strong> Contact our Privacy Officer first</li>
                    <li><strong>Escalation:</strong> Data Protection Authority if unresolved</li>
                    <li><strong>Free Service:</strong> No charges for privacy requests</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-purple-600" />
                11. Contact Us
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-700">
                    <strong>Email:</strong> vinayak.parsewar55@gmail.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Phone:</strong> +91 9822028988
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> N9 A15 34/4 SHIVNERI COLONY CIDCO, Aurangabad, Maharashtra, India
                  </p>
                  <p className="text-gray-700">
                    <strong>Data Protection Officer:</strong> vinayak.parsewar55@gmail.com
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
