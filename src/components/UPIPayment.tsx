"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Copy, QrCode, ExternalLink, CheckCircle, Smartphone } from "lucide-react";
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
  const [upiId, setUpiId] = useState(organizerUpiId || "9595961116@ptsbi");
  const [merchantName, setMerchantName] = useState("TICKETr");
  const [paymentNote, setPaymentNote] = useState(`Payment for ${eventName} ticket`);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [copied, setCopied] = useState(false);

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

  // Open UPI app directly
  const openUPIApp = () => {
    const upiLink = generateUPILink();
    if (!upiLink) return;

    // Try to open UPI app
    window.location.href = upiLink;
    
    // Show success message
    setTimeout(() => {
      toast.success("Opening UPI app... Please complete the payment.");
    }, 100);
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

        {/* Organizer's UPI Details */}
        <div className="space-y-4">
          <div>
            <Label>Pay to:</Label>
            <div className="p-3 bg-blue-50 rounded-lg border mt-1">
              <div className="font-medium text-blue-900">{upiId || "Organizer UPI ID"}</div>
              <div className="text-sm text-blue-700">TICKETr - {eventName}</div>
            </div>
          </div>
          
          <div>
            <Label>Payment Note:</Label>
            <div className="p-3 bg-gray-50 rounded-lg mt-1">
              <div className="text-sm text-gray-700">{paymentNote}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment Actions */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">
            Choose payment method:
          </div>

          {/* Direct UPI App */}
          <Button
            onClick={openUPIApp}
            disabled={!upiId || isLoading}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open UPI App
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

        {/* Payment Instructions */}
        <Alert>
          <AlertDescription className="text-sm">
            <strong>How to pay:</strong>
            <ol className="mt-2 space-y-1 text-xs">
              <li>1. Click "Open UPI App" or scan the QR code</li>
              <li>2. Verify amount and organizer details</li>
              <li>3. Complete payment in your UPI app</li>
              <li>4. After payment, contact the organizer with your payment screenshot</li>
            </ol>
          </AlertDescription>
        </Alert>

      </CardContent>
    </Card>
  );
}