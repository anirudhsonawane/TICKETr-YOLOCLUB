"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Copy, QrCode, ExternalLink, CheckCircle, Smartphone, Bell } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface UPIPaymentProps {
  amount: number;
  eventName: string;
  customerName?: string;
  customerPhone?: string;
  organizerUpiId?: string; // Organizer's UPI ID
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export default function UPIPayment({
  amount,
  eventName,
  customerName,
  customerPhone,
  organizerUpiId,
  onSuccess,
  onError,
}: UPIPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [upiId, setUpiId] = useState(
    organizerUpiId || 
    process.env.NEXT_PUBLIC_UPI_ID || 
    "9595961116@ptsbi"
  );
  const [merchantName, setMerchantName] = useState(
    process.env.NEXT_PUBLIC_PAYEE_NAME || 
    "TICKETR Events"
  );
  const [paymentNote, setPaymentNote] = useState(`Payment for ${eventName} ticket`);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Generate UPI deep link
  const generateUPILink = () => {
    if (!upiId) {
      onError?.("UPI ID is required");
      return "";
    }

    const params = new URLSearchParams({
      pa: upiId,
      pn: merchantName,
      am: amount.toString(),
      cu: "INR",
      tn: paymentNote,
    });

    // Add optional parameters
    if (customerName) {
      params.append("pn", customerName);
    }
    if (customerPhone) {
      params.append("pa", `${upiId}@${customerPhone}`);
    }

    // Use UPI deep link that opens PhonePe/Paytm
    return `upi://pay?${params.toString()}`;
  };

  // Generate QR code for UPI payment
  const generateQRCode = async () => {
    const upiLink = generateUPILink();
    if (!upiLink) return;

    try {
      const qrDataURL = await QRCode.toDataURL(upiLink, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataURL(qrDataURL);
      setShowQRCode(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      onError?.("Failed to generate QR code");
    }
  };

  // Copy UPI link to clipboard
  const copyToClipboard = async () => {
    const upiLink = generateUPILink();
    if (!upiLink) return;

    try {
      await navigator.clipboard.writeText(upiLink);
      setCopied(true);
      toast.success("UPI payment link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy link");
    }
  };

  // Open PhonePe app directly
  const openUPIApp = () => {
    const upiLink = generateUPILink();
    if (!upiLink) return;

    // Set payment initiated to show notification buttons
    setPaymentInitiated(true);

    // Check if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open PhonePe specifically on mobile
      const phonepeUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentNote)}`;
      
      try {
        window.location.href = phonepeUrl;
        toast.success("Opening PhonePe... Please complete the payment.");
      } catch (error) {
        console.log("PhonePe not available");
        toast.error("PhonePe app not found. Please install PhonePe or scan the QR code below.");
      }
    } else {
      // For desktop, show QR code only
      toast.info("Please scan the QR code with PhonePe to complete payment.");
    }
  };


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Pay with UPI
        </CardTitle>
        <p className="text-sm text-gray-600">Quick and secure payment</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">₹{amount}</div>
          <div className="text-sm text-gray-600 mt-1">{eventName}</div>
        </div>

        {/* Payment Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">₹{amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-medium">1 ticket</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Event:</span>
            <span className="font-medium text-right flex-1 ml-2">{eventName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pay to:</span>
            <span className="font-medium">{upiId || "Organizer UPI ID"}</span>
          </div>
        </div>

        <Separator />

        {/* Payment Actions */}
        {!paymentInitiated && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Choose payment method:
            </div>

            {/* Direct UPI App */}
            <Button
              onClick={openUPIApp}
              disabled={!upiId || isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Pay ₹{amount} with PhonePe
            </Button>

            {/* Copy Link */}
            <Button
              onClick={copyToClipboard}
              variant="outline"
              disabled={!upiId || isLoading}
              className="w-full"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Payment Link"}
            </Button>

            {/* Generate QR Code */}
            <Button
              onClick={generateQRCode}
              variant="outline"
              disabled={!upiId || isLoading}
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Show QR Code
            </Button>
          </div>
        )}

        {/* QR Code Display */}
        {showQRCode && qrCodeDataURL && (
          <div className="text-center space-y-4">
            <Separator />
            <div>
              <h3 className="font-medium mb-2">Scan QR Code</h3>
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <img
                  src={qrCodeDataURL}
                  alt="UPI Payment QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Scan with any UPI app (GPay, PhonePe, Paytm, BHIM, etc.)
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowQRCode(false)}
              className="w-full"
            >
              Hide QR Code
            </Button>
          </div>
        )}

        {/* Payment Initiated Section */}
        {paymentInitiated && (
          <div className="space-y-4">
            <Separator />
            
            {/* Payment Initiated Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Smartphone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-green-800">Payment Initiated</div>
                  <div className="text-sm text-green-600">Complete payment in your UPI app</div>
                </div>
              </div>
              
                          <div className="bg-green-100 rounded-lg p-3 mt-3">
                            <div className="text-sm text-green-800">
                              If payment completed, then notify organizer to get your tickets.
                            </div>
                
                {/* Payment Details */}
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Amount:</span>
                    <span className="font-medium text-green-800">₹{amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Note:</span>
                    <span className="font-medium text-green-800">1 ticket for {eventName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">UPI ID:</span>
                    <span className="font-medium text-green-800">{upiId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  // Call the onSuccess callback to redirect to payment result page
                  const paymentId = `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  onSuccess?.(paymentId);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notify Organizer About Payment
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={generateQRCode}
                  variant="outline"
                  className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR Code
                </Button>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Supported Apps */}
        <div className="text-center text-sm text-gray-500">
          Supported apps: GPay, PhonePe, Paytm, BHIM, and more
        </div>

        {/* Payment Instructions */}
        <div className="text-center text-sm text-gray-500">
          After payment, contact the organizer with your payment screenshot
        </div>

      </CardContent>
    </Card>
  );
}