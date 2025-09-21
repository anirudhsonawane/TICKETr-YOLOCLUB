"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";
import { QrCode, Smartphone, Copy, Check, ExternalLink, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import QRCodeLib from "qrcode";
import PaymentNotificationForm from "./PaymentNotificationForm";

interface UPIPaymentSimpleProps {
  eventId: Id<"events">;
  eventName: string;
  amount: number;
  quantity?: number;
  passId?: Id<"passes">;
  onPaymentInitiated?: () => void;
}

// You'll need to set your UPI ID here
const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "your-upi-id@bank"; // Replace with your actual UPI ID
const PAYEE_NAME = process.env.NEXT_PUBLIC_PAYEE_NAME || "T-System Tickets";

export default function UPIPaymentSimple({ 
  eventId, 
  eventName, 
  amount, 
  quantity = 1,
  passId,
  onPaymentInitiated 
}: UPIPaymentSimpleProps) {
  const { user } = useUser();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate UPI deep link
  const upiDeepLink = useMemo(() => {
    const note = `${quantity} ticket${quantity > 1 ? 's' : ''} for ${eventName}`;
    const encodedNote = encodeURIComponent(note);
    const encodedName = encodeURIComponent(PAYEE_NAME);
    
    return `upi://pay?pa=${UPI_ID}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;
  }, [amount, quantity, eventName]);

  // Generate QR code data (same as deep link)
  const qrCodeData = upiDeepLink;

  // Generate QR code when needed
  useEffect(() => {
    if (showQR && qrCodeData && canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, qrCodeData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error);
        } else {
          // Convert canvas to data URL for display
          const dataURL = canvasRef.current?.toDataURL();
          if (dataURL) {
            setQrCodeDataURL(dataURL);
          }
        }
      });
    }
  }, [showQR, qrCodeData]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(upiDeepLink);
      setCopied(true);
      toast.success("UPI link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const handlePaymentInitiated = () => {
    setPaymentInitiated(true);
    onPaymentInitiated?.();
    toast.success("Payment initiated! Please complete the payment in your UPI app.", {
      description: "Don't forget to take a screenshot of the payment for verification.",
      duration: 10000,
    });
  };

  const handleOpenUPI = () => {
    handlePaymentInitiated();
    
    // Check if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open PhonePe specifically on mobile
      const phonepeUrl = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${quantity} ticket${quantity > 1 ? 's' : ''} for ${eventName}`)}`;
      
      // Try PhonePe first
      const phonepeLink = document.createElement('a');
      phonepeLink.href = phonepeUrl;
      phonepeLink.click();
      
      // Fallback to generic UPI after a short delay
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = upiDeepLink;
        link.click();
      }, 1000);
      
      // Show instructions
      setTimeout(() => {
        toast.info("Opening PhonePe for payment. If PhonePe doesn't open, please open it manually and scan the QR code below.");
      }, 2000);
    } else {
      // For desktop, show QR code or generic UPI
      const link = document.createElement('a');
      link.href = upiDeepLink;
      link.click();
      
      setTimeout(() => {
        toast.info("Please scan the QR code with PhonePe or any UPI app to complete payment.");
      }, 2000);
    }
  };

  // Show payment notification form if requested
  if (showNotificationForm) {
    return (
      <PaymentNotificationForm
        eventId={eventId}
        eventName={eventName}
        amount={amount}
        quantity={quantity}
        passId={passId}
      />
    );
  }

  if (paymentInitiated) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-yellow-200">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900">
                Payment Initiated
              </h3>
              <p className="text-sm text-yellow-700">
                Complete payment in your UPI app
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800 mb-3 font-bold">
              Payment completed! Now notify the organizer about your payment for ticket verification.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-yellow-800">
                <strong>Amount:</strong> ₹{amount}
              </p>
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> {quantity} ticket{quantity > 1 ? 's' : ''} for {eventName}
              </p>
              <p className="text-sm text-yellow-800">
                <strong>UPI ID:</strong> {UPI_ID}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNotificationForm(true)}
            className="w-full bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Notify Organizer About Payment
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide' : 'Show'} QR Code
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          {showQR && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-3">Scan with any UPI app:</p>
                <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg">
                  <canvas 
                    ref={canvasRef} 
                    className="w-48 h-48"
                    style={{ display: qrCodeDataURL ? 'block' : 'none' }}
                  />
                  {!qrCodeDataURL && (
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <QrCode className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-sm">Generating QR...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                QR contains: {qrCodeData}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pay with UPI
            </h3>
            <p className="text-sm text-gray-600">
              Quick and secure payment
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="font-medium">₹{amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Quantity:</span>
              <span className="font-medium">{quantity} ticket{quantity > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Event:</span>
              <span className="font-medium text-right">{eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pay to:</span>
              <span className="font-medium">{UPI_ID}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleOpenUPI}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md flex items-center justify-center gap-2"
          >
            <Smartphone className="w-5 h-5" />
            Pay ₹{amount} with PhonePe
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide' : 'Show'} QR Code
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {showQR && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="mb-2">
              <p className="text-sm text-gray-600 mb-3">Scan with any UPI app:</p>
              <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg">
                <canvas 
                  ref={canvasRef} 
                  className="w-48 h-48"
                  style={{ display: qrCodeDataURL ? 'block' : 'none' }}
                />
                {!qrCodeDataURL && (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">Generating QR...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              QR contains: {qrCodeData}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>Recommended: PhonePe (opens automatically on mobile)</p>
          <p className="mt-1">Also works with: GPay, Paytm, BHIM, and other UPI apps</p>
          <p className="mt-1">After payment, contact the organizer with your payment screenshot</p>
        </div>
      </div>
    </div>
  );
}
