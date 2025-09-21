"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Eye, Download } from "lucide-react";
import { toast } from "sonner";

export default function PaymentVerificationsPage() {
  const [selectedVerification, setSelectedVerification] = useState<Id<"paymentVerifications"> | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const verifications = useQuery(api.paymentVerifications.getEventPaymentVerifications, {
    eventId: "skip" as any, // We'll need to get this from context or params
  });

  // Handle error states
  if (verifications === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payment Verifications</h1>
          <p className="text-gray-600">Review and approve UPI payment verifications</p>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Error loading payment verifications. Please try again later.</p>
        </div>
      </div>
    );
  }

  const approveVerification = useMutation(api.paymentVerifications.approvePaymentVerification);
  const rejectVerification = useMutation(api.paymentVerifications.rejectPaymentVerification);

  const handleApprove = async (verificationId: Id<"paymentVerifications">) => {
    setIsProcessing(true);
    try {
      await approveVerification({
        verificationId,
        reviewedBy: "admin", // TODO: Get from user context
        reviewNotes: reviewNotes.trim() || undefined,
      });
      toast.success("Payment verification approved and tickets created!");
      setSelectedVerification(null);
      setReviewNotes("");
    } catch (error) {
      toast.error("Failed to approve verification");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (verificationId: Id<"paymentVerifications">) => {
    setIsProcessing(true);
    try {
      await rejectVerification({
        verificationId,
        reviewedBy: "admin", // TODO: Get from user context
        reviewNotes: reviewNotes.trim() || undefined,
      });
      toast.success("Payment verification rejected");
      setSelectedVerification(null);
      setReviewNotes("");
    } catch (error) {
      toast.error("Failed to reject verification");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!verifications) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment Verifications</h1>
        <p className="text-gray-600">Review and approve UPI payment verifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification List */}
        <div className="lg:col-span-2 space-y-4">
          {verifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No payment verifications found</p>
              </CardContent>
            </Card>
          ) : (
            verifications.map((verification) => (
              <Card key={verification._id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedVerification(verification._id)}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{verification.userName}</h3>
                      <p className="text-sm text-gray-600">{verification.userEmail}</p>
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Event:</p>
                      <p className="font-medium">{verification.event?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount:</p>
                      <p className="font-medium">₹{verification.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">UID:</p>
                      <p className="font-medium">{verification.uid}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mobile:</p>
                      <p className="font-medium">{verification.mobileNumber}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    Submitted: {formatDate(verification.submittedAt)}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Verification Details */}
        <div className="lg:col-span-1">
          {selectedVerification ? (
            (() => {
              const verification = verifications.find(v => v._id === selectedVerification);
              if (!verification) return null;

              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Verification Details
                      {verification.status === "pending" && (
                        <Badge variant="secondary">Pending Review</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">User Information</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {verification.userName}</p>
                        <p><strong>Email:</strong> {verification.userEmail}</p>
                        <p><strong>Mobile:</strong> {verification.mobileNumber}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Payment Details</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Event:</strong> {verification.event?.name}</p>
                        <p><strong>Amount:</strong> ₹{verification.amount}</p>
                        <p><strong>Quantity:</strong> {verification.quantity}</p>
                        <p><strong>UID:</strong> {verification.uid}</p>
                      </div>
                    </div>

                    {verification.paymentScreenshotStorageId && (
                      <div>
                        <h4 className="font-medium mb-2">Payment Screenshot</h4>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Screenshot
                        </Button>
                      </div>
                    )}

                    {verification.status === "pending" && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add review notes (optional)"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                        />
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(verification._id)}
                            disabled={isProcessing}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(verification._id)}
                            disabled={isProcessing}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {verification.status !== "pending" && (
                      <div>
                        <h4 className="font-medium mb-2">Review Details</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Status:</strong> {verification.status}</p>
                          <p><strong>Reviewed:</strong> {verification.reviewedAt ? formatDate(verification.reviewedAt) : 'N/A'}</p>
                          <p><strong>Reviewed by:</strong> {verification.reviewedBy || 'N/A'}</p>
                          {verification.reviewNotes && (
                            <p><strong>Notes:</strong> {verification.reviewNotes}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Select a verification to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
