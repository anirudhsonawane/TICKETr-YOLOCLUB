"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";
import { Smartphone, CheckCircle, AlertCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentNotificationFormProps {
  eventId: Id<"events">;
  eventName: string;
  amount: number;
  quantity: number;
  passId?: Id<"passes">;
}

export default function PaymentNotificationForm({ 
  eventId, 
  eventName, 
  amount, 
  quantity,
  passId 
}: PaymentNotificationFormProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    upiTransactionId: "",
    payeeName: "",
    payeeMobileNumber: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit payment notification");
      return;
    }

    if (!formData.upiTransactionId || !formData.payeeName || !formData.payeeMobileNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create payment notification record
      const response = await fetch('/api/payment-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          userId: user.id,
          amount,
          quantity,
          passId,
          upiTransactionId: formData.upiTransactionId,
          payeeName: formData.payeeName,
          payeeMobileNumber: formData.payeeMobileNumber,
          userInfo: {
            name: user.fullName,
            email: user.emailAddresses[0]?.emailAddress
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsSubmitted(true);
        toast.success("Payment notification submitted! The organizer will verify your payment shortly.");
      } else {
        toast.error("Failed to submit payment notification: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting payment notification:", error);
      toast.error("Failed to submit payment notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  if (isSubmitted) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Payment Notification Sent!
          </h3>
          <p className="text-green-700 mb-4">
            Your payment notification has been submitted successfully. The event organizer will verify your payment and create your ticket shortly.
          </p>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-green-800 space-y-1 text-left">
              <li>• Organizer will verify your payment in their bank/UPI app</li>
              <li>• They will confirm the amount and details match</li>
              <li>• Your ticket will be created and sent to you</li>
              <li>• You'll receive confirmation via email</li>
            </ul>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Contact Info:</strong> You can also contact the organizer directly at the event contact details for faster verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Notify Organizer About Payment
            </h3>
            <p className="text-sm text-gray-600">
              Submit your payment details for verification
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Payment Summary</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Event:</span>
              <span className="font-medium">{eventName}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">₹{amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span className="font-medium">{quantity} ticket{quantity > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UID / Transaction ID (required field) *
            </label>
            <input
              type="text"
              name="upiTransactionId"
              value={formData.upiTransactionId}
              onChange={handleInputChange}
              placeholder="e.g., TXN789012345 or UPI123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can find this in your UPI app transaction history
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payee Name (required field) *
            </label>
            <input
              type="text"
              name="payeeName"
              value={formData.payeeName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payee Mobile Number (required field) *
            </label>
            <input
              type="tel"
              name="payeeMobileNumber"
              value={formData.payeeMobileNumber}
              onChange={handleInputChange}
              placeholder="Enter your mobile number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="space-y-1">
                  <li>• Make sure you have completed the payment in your UPI app</li>
                  <li>• Provide accurate UPI Transaction ID for faster verification</li>
                  <li>• The organizer will verify your payment before creating your ticket</li>
                  <li>• You'll receive your ticket via email once verified</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Notify Organizer
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
