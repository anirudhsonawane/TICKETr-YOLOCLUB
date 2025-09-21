"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";
import { Upload, CheckCircle, AlertCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface PaymentProofSubmissionProps {
  eventId: Id<"events">;
  eventName: string;
  amount: number;
  quantity: number;
  passId?: Id<"passes">;
}

export default function PaymentProofSubmission({ 
  eventId, 
  eventName, 
  amount, 
  quantity,
  passId 
}: PaymentProofSubmissionProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    upiTransactionId: "",
    paymentMethod: "",
    notes: "",
    contactMethod: "",
    contactInfo: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit payment proof");
      return;
    }

    if (!formData.upiTransactionId && !formData.notes) {
      toast.error("Please provide either UPI Transaction ID or payment details");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, this would save to a database
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast.success("Payment proof submitted successfully! The organizer will verify your payment shortly.");
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      toast.error("Failed to submit payment proof. Please try again.");
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
            Payment Proof Submitted!
          </h3>
          <p className="text-green-700 mb-4">
            Your payment proof has been submitted successfully. The event organizer will verify your payment and create your ticket shortly.
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
          <p className="text-sm text-green-600 mt-4">
            If you don't receive your ticket within 24 hours, please contact the organizer directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Submit Payment Proof
            </h3>
            <p className="text-sm text-gray-600">
              Provide payment details for verification
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
              UPI Transaction ID (Optional)
            </label>
            <input
              type="text"
              name="upiTransactionId"
              value={formData.upiTransactionId}
              onChange={handleInputChange}
              placeholder="e.g., TXN789012345 or UPI123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can find this in your UPI app transaction history
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method Used
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select payment method</option>
              <option value="gpay">Google Pay</option>
              <option value="phonepe">PhonePe</option>
              <option value="paytm">Paytm</option>
              <option value="bhim">BHIM</option>
              <option value="other">Other UPI App</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Details / Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Provide any additional payment details, reference numbers, or notes that might help verify your payment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include any reference numbers, payment confirmation details, or screenshots description
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method
            </label>
            <select
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select contact method</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              placeholder="Your email, phone number, or WhatsApp number"
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
                  <li>• Take a screenshot of your payment confirmation</li>
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
                <Upload className="w-4 h-4" />
                Submit Payment Proof
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
