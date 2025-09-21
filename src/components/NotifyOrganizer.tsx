"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
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
  onSuccess,
  onError,
}: NotifyOrganizerProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    uid: "",
    mobileNumber: "",
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

    if (!formData.uid.trim()) {
      setError("Please enter your UID");
      return;
    }

    if (!formData.mobileNumber.trim()) {
      setError("Please enter your mobile number");
      return;
    }

    if (!screenshotFile) {
      setError("Please attach a payment screenshot");
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
        mobileNumber: formData.mobileNumber.trim(),
        uid: formData.uid.trim(),
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
              Your payment verification has been submitted successfully. The organizer will review your payment and create your tickets.
            </p>
            <p className="text-sm text-gray-500">
              You will be notified once your tickets are approved and created.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Notify Organizer</CardTitle>
        <CardDescription className="text-center">
          Submit your payment details for verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="uid">UID (Unique ID)</Label>
            <Input
              id="uid"
              type="text"
              placeholder="Enter your UID"
              value={formData.uid}
              onChange={(e) => handleInputChange("uid", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Payment Screenshot</Label>
            <div className="space-y-2">
              {!screenshotFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload payment screenshot
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
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
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium mb-1">Event Details:</p>
            <p>Event: {eventName}</p>
            <p>Amount: ₹{amount}</p>
            <p>Quantity: {quantity} ticket{quantity > 1 ? 's' : ''}</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Notify Organizer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
