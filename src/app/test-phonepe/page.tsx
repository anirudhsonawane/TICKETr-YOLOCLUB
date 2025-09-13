'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhonePePayment from '@/components/PhonePePayment';
import { Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestPhonePePage() {
  const [testData, setTestData] = useState({
    amount: 100,
    eventId: 'test-event-123',
    userId: 'test-user-456',
    quantity: 1,
    passId: 'test-pass-789',
    couponCode: '',
    selectedDate: '2024-01-01',
  });

  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleVerifyPayment = async () => {
    if (!orderId.trim()) {
      alert('Please enter an order ID to verify');
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch('/api/phonepe/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantOrderId: orderId,
        }),
      });

      const result = await response.json();
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        error: 'Verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhonePeSuccess = (orderId: string) => {
    console.log('PhonePe payment successful:', orderId);
    setOrderId(orderId);
    alert(`Payment successful! Order ID: ${orderId}`);
  };

  const handlePhonePeError = (error: string) => {
    console.error('PhonePe payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PhonePe Integration Test
          </h1>
          <p className="text-gray-600">
            Test the PhonePe payment gateway integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Test Configuration
              </CardTitle>
              <CardDescription>
                Configure test parameters for PhonePe payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={testData.amount}
                  onChange={(e) =>
                    setTestData({ ...testData, amount: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label htmlFor="eventId">Event ID</Label>
                <Input
                  id="eventId"
                  value={testData.eventId}
                  onChange={(e) =>
                    setTestData({ ...testData, eventId: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={testData.userId}
                  onChange={(e) =>
                    setTestData({ ...testData, userId: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={testData.quantity}
                  onChange={(e) =>
                    setTestData({ ...testData, quantity: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label htmlFor="passId">Pass ID</Label>
                <Input
                  id="passId"
                  value={testData.passId}
                  onChange={(e) =>
                    setTestData({ ...testData, passId: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                <Input
                  id="couponCode"
                  value={testData.couponCode}
                  onChange={(e) =>
                    setTestData({ ...testData, couponCode: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="selectedDate">Selected Date</Label>
                <Input
                  id="selectedDate"
                  type="date"
                  value={testData.selectedDate}
                  onChange={(e) =>
                    setTestData({ ...testData, selectedDate: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Test */}
          <div className="space-y-6">
            <PhonePePayment
              amount={testData.amount}
              eventId={testData.eventId}
              userId={testData.userId}
              quantity={testData.quantity}
              passId={testData.passId}
              couponCode={testData.couponCode}
              selectedDate={testData.selectedDate}
              onSuccess={handlePhonePeSuccess}
              onError={handlePhonePeError}
            />

            {/* Verification Test */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Verification</CardTitle>
                <CardDescription>
                  Verify a payment using order ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter PhonePe order ID"
                  />
                </div>

                <Button
                  onClick={handleVerifyPayment}
                  disabled={isVerifying || !orderId.trim()}
                  className="w-full"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Payment'}
                </Button>

                {verificationResult && (
                  <div className="mt-4 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      {verificationResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-semibold">
                        {verificationResult.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(verificationResult, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Environment Check */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Environment Check
            </CardTitle>
            <CardDescription>
              Verify PhonePe configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_PHONEPE_CLIENT_ID ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>PhonePe Client ID: {process.env.NEXT_PUBLIC_PHONEPE_CLIENT_ID ? 'Set' : 'Not Set'}</span>
              </div>
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_BASE_URL ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Base URL: {process.env.NEXT_PUBLIC_BASE_URL || 'Not Set'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
