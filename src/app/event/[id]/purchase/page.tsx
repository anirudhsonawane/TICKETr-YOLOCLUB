"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useState,  useMemo } from "react";
import { ArrowLeft, Plus, Minus, Tag, Check } from "lucide-react";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import CouponInput from "@/components/CouponInput";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PurchasePage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const eventId = params.id as Id<"events">;
  const passId = searchParams.get("passId") as Id<"passes">;
  const urlSelectedDates = searchParams.get("selectedDates");

  const event = useQuery(api.events.getById, { eventId });
  const pass = useQuery(api.passes.getEventPasses, { eventId });
  
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>(urlSelectedDates ? urlSelectedDates.split(',') : []);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
    finalAmount: number;
    couponId?: string;
  } | null>(null);
  const [showUpiPayment, setShowUpiPayment] = useState(false);
  const [uidInput, setUidInput] = useState("");

  const createUpiPayment = useMutation(api.upi.createUpiPayment);

  const selectedPass = pass?.find(p => p._id === passId);
  
  // Debug: Log pass details
  console.log("Selected Pass:", selectedPass?.name, "Category:", selectedPass?.category);
  console.log("All Passes:", pass?.map(p => ({ name: p.name, category: p.category })));
  
  // Remove all seasonal pass date multipliers from calculations
  const getOriginalAmount = () => {
    if (!selectedPass) return 0;
    return selectedPass.price * quantity;
  };
  
  const originalAmount = getOriginalAmount();
  const totalAmount = useMemo(() => {
    return appliedCoupon ? appliedCoupon.finalAmount : originalAmount;
  }, [appliedCoupon, originalAmount]);
  const availableQuantity = selectedPass ? selectedPass.totalQuantity - selectedPass.soldQuantity : 0;
  
  // Removed initial coupon seeding to avoid calling a non-deployed Convex function

  if (!event || !pass || !selectedPass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    const maxAllowed = Math.min(availableQuantity, 10);
    if (newQuantity >= 1 && newQuantity <= maxAllowed) {
      setQuantity(newQuantity);
    }
  };

  // Remove seasonal pass date validation from purchase handler
  const handlePurchase = async () => {
    if (!user || !event || !selectedPass) return;
  
    // Removed date validation check
    setShowUpiPayment(true);
    return;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Passes
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600">
            {event.name}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Selected Pass Info */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selectedPass.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {selectedPass.description}
                </p>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{selectedPass.price.toFixed(2)} per ticket
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {selectedPass.totalQuantity} / {availableQuantity} available
                </div>
                {(selectedPass.category === "Seasonal Pass" || selectedPass.name?.toLowerCase().includes("seasonal")) && selectedDates.length > 1 && (
                  <div className="text-sm text-blue-600 mt-1">
                    Total: ₹{(selectedPass.price * selectedDates.length).toFixed(2)} for {selectedDates.length} dates
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            {selectedPass.benefits.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  What's included:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPass.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Selector for Seasonal Pass 
          {(selectedPass?.category === "Seasonal Pass" || selectedPass?.name?.toLowerCase().includes("seasonal")) && (
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <DateSelector
                selectedDates={selectedDates}
                onDateChange={setSelectedDates}
                disabled={isLoading}
              />
            </div>
          )} */}

          {/* Quantity Selector */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Quantity</h4>
                <p className="text-sm text-gray-600">
                  Select number of tickets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= Math.min(availableQuantity, 10)}
                  className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <CouponInput
              originalAmount={originalAmount}
              eventId={eventId}
              onCouponApplied={(discountInfo) => setAppliedCoupon(discountInfo)}
              onCouponRemoved={() => setAppliedCoupon(null)}
            />
          </div>

          {/* Total & Purchase */}
          <div className="p-4 sm:p-6">
            <div className="space-y-3 mb-6">
              {/* Show breakdown for Seasonal Pass with multiple dates */}
              {(selectedPass?.category === "Seasonal Pass" || selectedPass?.name?.toLowerCase().includes("seasonal")) && selectedDates.length > 1 ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Pass Price (×{quantity}):
                    </span>
                    <span className="text-gray-900">
                      ₹{(selectedPass.price * quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Dates Selected (×{selectedDates.length}):
                    </span>
                    <span className="text-gray-900">
                      ₹{(selectedPass.price * quantity * selectedDates.length).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-600 font-medium">
                      Subtotal:
                    </span>
                    <span className="text-gray-900 font-medium">
                      ₹{originalAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Subtotal:
                  </span>
                  <span className="text-gray-900">
                    ₹{originalAmount.toFixed(2)}
                  </span>
                </div>
              )}
              
              {appliedCoupon && (
                <div className="flex justify-between items-center text-green-600">
                  <span>
                    Discount ({appliedCoupon.discountPercentage}%):
                  </span>
                  <span>
                    -₹{appliedCoupon.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-lg font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {showUpiPayment ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Complete your UPI Payment</h3>
                  <Image
                    src="/event-images/qr-code.jpg"
                    alt="UPI QR Code"
                    width={200}
                    height={200}
                    className="mb-4"
                  />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    UPI ID: 7218343929-7@ybl
                  </p>
                  <p className="text-gray-600 text-center mb-4">
                    Scan the QR code or use the UPI ID above to make your payment.
                    Then, enter the 12-digit UPI Transaction ID (UID) below.
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 12-digit UPI Transaction ID"
                    value={uidInput}
                    onChange={(e) => setUidInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                    maxLength={12}
                  />
                  <Button
                    onClick={async () => {
                      if (!user || !event || !selectedPass || uidInput.length !== 12) return;
                      setIsLoading(true);
                      try {
                        await createUpiPayment({
                          uid: uidInput,
                          eventId: eventId,
                          userId: user.id,
                          amount: totalAmount,
                        });
                        router.push(`/tickets/purchase-success?payment_id=${uidInput}`); // Use UID as payment_id for now
                      } catch (error) {
                        console.error("Error submitting UPI payment:", error);
                        alert("Failed to submit UPI payment. Please try again.");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={uidInput.length !== 12 || isLoading || !user || !event || !selectedPass}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-lg mt-4 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Submitting UID..." : "Submit UPI Transaction ID"}
                  </Button>
                  <Button
                    onClick={() => setShowUpiPayment(false)}
                    variant="ghost"
                    className="w-full text-gray-600 mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => setShowUpiPayment(true)}
                  disabled={isLoading || !user || availableQuantity === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-4 rounded-lg text-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Processing Payment..."
                    : !user
                    ? "Sign in to Purchase"
                    : availableQuantity === 0
                    ? "Sold Out"
                    : `Pay ₹${totalAmount.toFixed(2)} with UPI/Card`}
                </Button>

                {user && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Secure payment powered by Razorpay
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    
    );
}