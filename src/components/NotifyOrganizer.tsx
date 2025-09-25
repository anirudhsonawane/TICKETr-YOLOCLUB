"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X, CheckCircle, AlertCircle, Loader2, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

interface NotifyOrganizerProps {
  eventId: Id<"events">;
  eventName: string;
  amount: number;
  quantity: number;
  passId?: Id<"passes">;
  selectedDate?: string;
  organizerUpiId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function NotifyOrganizer({
  eventId,
  eventName,
  amount,
  quantity,
  passId,
  selectedDate,
  organizerUpiId,
  onSuccess,
  onError,
}: NotifyOrganizerProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    upiTransactionId: "",
    paymentMethod: "",
    additionalNotes: "",
    contactMethod: "whatsapp",
    contactInfo: "",
  });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const submitVerification = useMutation(api.paymentVerifications.submitPaymentVerification);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      setScreenshotFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("Please sign in to submit payment verification");
      return;
    }

    if (!formData.upiTransactionId.trim()) {
      setError("Please enter your UPI Transaction ID");
      return;
    }

    if (!formData.paymentMethod) {
      setError("Please select your payment method");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload screenshot if provided
      let screenshotStorageId: Id<"_storage"> | undefined;
      if (screenshotFile) {
        const uploadUrl = await generateUploadUrl();
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": screenshotFile.type },
          body: screenshotFile,
        });
        const { storageId } = await uploadResult.json();
        screenshotStorageId = storageId;
      }

      // Submit payment verification
      await submitVerification({
        eventId,
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress || "",
        userName: user.fullName || user.firstName || "Unknown",
        mobileNumber: formData.contactInfo || user.primaryPhoneNumber?.phoneNumber || "",
        uid: formData.upiTransactionId.trim(),
        amount,
        quantity,
        passId,
        selectedDate,
        paymentScreenshotStorageId: screenshotStorageId,
      });

      setIsSubmitted(true);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to submit payment verification:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit verification";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Verification Submitted!
            </h3>
            <p className="text-gray-600 mb-4">
              Your payment verification request has been submitted successfully. The organizer will review your payment details and create your tickets.
            </p>
            <p className="text-sm text-gray-500">
              You will be notified via {formData.contactMethod} once your tickets are approved and created.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">Notify Organizer About Payment</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Submit your payment details for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Event:</span>
                <span className="font-medium text-blue-900">{eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Amount:</span>
                <span className="font-medium text-blue-900">₹{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Quantity:</span>
                <span className="font-medium text-blue-900">{quantity} ticket{quantity > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* UPI Transaction ID */}
          <div className="space-y-2">
            <Label htmlFor="upiTransactionId" className="text-sm font-medium text-gray-700">
              UPI Transaction ID *
            </Label>
            <Input
              id="upiTransactionId"
              type="text"
              placeholder="e.g., TXN789012345 or UPI123456789"
              value={formData.upiTransactionId}
              onChange={(e) => handleInputChange("upiTransactionId", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500">
              You can find this in your UPI app transaction history
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
              Payment Method Used *
            </Label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            >
              <option value="">Select payment method</option>
              <option value="phonepe">PhonePe</option>
              <option value="paytm">Paytm</option>
              <option value="gpay">Google Pay</option>
              <option value="bhim">BHIM</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Payment Screenshot */}
          <div className="space-y-2">
            <Label htmlFor="screenshot" className="text-sm font-medium text-gray-700">
              Payment Screenshot (Optional)
            </Label>
            <div className="space-y-2">
              {!screenshotFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500">No file chosen</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <img
                      src={screenshotPreview || ""}
                      alt="Payment screenshot preview"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeScreenshot}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {screenshotFile.name}
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload a screenshot of your payment confirmation
            </p>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700">
              Additional Notes
            </Label>
            <textarea
              id="additionalNotes"
              rows={3}
              placeholder="Any additional payment details or notes..."
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Preferred Contact Method */}
          <div className="space-y-2">
            <Label htmlFor="contactMethod" className="text-sm font-medium text-gray-700">
              Preferred Contact Method
            </Label>
            <select
              id="contactMethod"
              value={formData.contactMethod}
              onChange={(e) => handleInputChange("contactMethod", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label htmlFor="contactInfo" className="text-sm font-medium text-gray-700">
              Contact Information
            </Label>
            <Input
              id="contactInfo"
              type="text"
              placeholder="Your WhatsApp number, email, or phone number"
              value={formData.contactInfo}
              onChange={(e) => handleInputChange("contactInfo", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Important Information */}
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="font-semibold text-yellow-800 mb-2">Important:</div>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Make sure you have completed the payment in your UPI app</li>
                <li>• Provide accurate transaction details for faster verification</li>
                <li>• The organizer will verify your payment before creating your ticket</li>
                <li>• You'll receive your ticket via email once verified</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Bell className="w-4 h-4 mr-2" />
                Notify Organizer
              </div>
            )}
          </Button>
        </form>
        </CardContent>
      </Card>
    </div>
  );
}
