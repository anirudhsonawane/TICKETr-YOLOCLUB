'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UPIPayment from '@/components/UPIPayment';

export default function TestUPIPage() {
  const [testData, setTestData] = useState({
    amount: 100,
    eventName: 'Test Event',
    customerName: 'Test Customer',
    customerPhone: '9876543210',
  });

  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handleUPISuccess = (paymentId: string) => {
    console.log('UPI payment successful:', paymentId);
    setPaymentResult({
      success: true,
      paymentId,
      message: 'Payment completed successfully!',
    });
    alert(`Payment successful! Payment ID: ${paymentId}`);
  };

  const handleUPIError = (error: string) => {
    console.error('UPI payment error:', error);
    setPaymentResult({
      success: false,
      error,
      message: 'Payment failed',
    });
    alert(`Payment failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            UPI Payment Test
          </h1>
          <p className="text-gray-600">
            Test the UPI payment integration with different configurations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>
                  Configure test parameters for UPI payment
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
                      setTestData({
                        ...testData,
                        amount: Number(e.target.value),
                      })
                    }
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    type="text"
                    value={testData.eventName}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        eventName: e.target.value,
                      })
                    }
                    placeholder="Enter event name"
                  />
                </div>

                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    type="text"
                    value={testData.customerName}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        customerName: e.target.value,
                      })
                    }
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    type="text"
                    value={testData.customerPhone}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        customerPhone: e.target.value,
                      })
                    }
                    placeholder="Enter customer phone"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Result */}
            {paymentResult && (
              <Card>
                <CardHeader>
                  <CardTitle className={paymentResult.success ? 'text-green-600' : 'text-red-600'}>
                    Payment Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Status:</strong> {paymentResult.message}
                    </p>
                    {paymentResult.paymentId && (
                      <p className="text-sm">
                        <strong>Payment ID:</strong> {paymentResult.paymentId}
                      </p>
                    )}
                    {paymentResult.error && (
                      <p className="text-sm text-red-600">
                        <strong>Error:</strong> {paymentResult.error}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Test Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>1.</strong> Configure your UPI ID in environment variables</p>
                  <p><strong>2.</strong> Set test parameters above</p>
                  <p><strong>3.</strong> Use the UPI payment component on the right</p>
                  <p><strong>4.</strong> In development mode, use "Simulate Payment" button</p>
                  <p><strong>5.</strong> In production, test with actual UPI apps</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* UPI Payment Component */}
          <div>
            <UPIPayment
              amount={testData.amount}
              eventName={testData.eventName}
              customerName={testData.customerName}
              customerPhone={testData.customerPhone}
              onSuccess={handleUPISuccess}
              onError={handleUPIError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
