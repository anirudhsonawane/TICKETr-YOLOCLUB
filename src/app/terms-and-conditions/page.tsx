"use client";

import { ArrowLeft, FileText, Shield, CreditCard, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function TermsAndConditionsPage() {
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 text-white text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Terms & Conditions</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Please read these terms carefully before using our ticket booking platform
            </p>
            <p className="text-blue-200 text-sm mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                1. Introduction
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Welcome to GHOOMAR DANDIYA, a comprehensive ticket booking platform operated by VINAYAK PARMOD PARSEWAR. 
                  These Terms and Conditions ("Terms") govern your use of our website, mobile application, 
                  and services (collectively, the "Service").
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
                  with any part of these terms, you may not access the Service.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
                2. Service Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  GHOOMAR DANDIYA provides a platform for event organizers to sell tickets and for customers to 
                  purchase tickets for various events including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Cultural events and festivals</li>
                  <li>Concerts and musical performances</li>
                  <li>Sports events and competitions</li>
                  <li>Conferences and seminars</li>
                  <li>Workshops and training sessions</li>
                  <li>Private parties and celebrations</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                3. User Responsibilities
              </h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3.1 Account Registration</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>You must be at least 18 years old to create an account and purchase tickets</li>
      </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">3.2 Prohibited Activities</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Using the Service for any unlawful purpose or in violation of any laws</li>
                  <li>Attempting to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Interfering with or disrupting the Service or servers connected to the Service</li>
                  <li>Creating fake accounts or providing false information</li>
                  <li>Reselling tickets without authorization from the event organizer</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
                4. Payment Terms
              </h2>
              <div className="prose prose-gray max-w-none">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>All payments must be made in Indian Rupees (INR)</li>
                  <li>We accept payments through UPI, credit cards, debit cards, and net banking</li>
                  <li>Payment processing is handled by secure third-party payment gateways</li>
                  <li>All prices are inclusive of applicable taxes unless otherwise specified</li>
                  <li>Refunds are subject to our Cancellation & Refund Policy</li>
                </ul>
              </div>
            </section>

            {/* Event Cancellation */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
                5. Event Cancellation & Changes
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Event organizers reserve the right to cancel, postpone, or modify events. In such cases:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>We will notify ticket holders via email and SMS</li>
                  <li>Refunds will be processed according to our Cancellation & Refund Policy</li>
                  <li>We are not responsible for any additional costs incurred by ticket holders</li>
                  <li>Event organizers are solely responsible for event content and execution</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                6. Limitation of Liability
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  GHOOMAR DANDIYA acts as an intermediary platform and is not responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Event content, quality, or execution</li>
                  <li>Venue conditions or accessibility</li>
                  <li>Weather conditions affecting outdoor events</li>
                  <li>Third-party services or products</li>
                  <li>Loss or damage to personal belongings at events</li>
      </ul>
              </div>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                7. Privacy & Data Protection
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy to understand 
                  how we collect, use, and protect your personal information.
                </p>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                8. Modifications to Terms
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of 
                  significant changes via email or through our Service. Continued use of the Service 
                  after such modifications constitutes acceptance of the updated Terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                9. Contact Information
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms and Conditions, please contact us:
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
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}