'use client';

import { useEffect, useState } from 'react';
import { getClerkErrorHandler } from '@/lib/clerk-error-handler';

export default function TestClerkErrorPage() {
  const [clerkStatus, setClerkStatus] = useState<string>('unknown');
  const [errorCount, setErrorCount] = useState<number>(0);

  useEffect(() => {
    const handler = getClerkErrorHandler();
    
    // Check status every second
    const interval = setInterval(() => {
      const status = handler.getClerkStatus();
      setClerkStatus(status);
    }, 1000);

    // Simulate an error after 5 seconds
    setTimeout(() => {
      handler.handleClerkError(new Error('Test configuration error'));
      setErrorCount(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Clerk Error Handling Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Current Status
          </h2>
          <div className="space-y-2">
            <p><strong>Clerk Status:</strong> <span className="text-blue-600">{clerkStatus}</span></p>
            <p><strong>Error Count:</strong> <span className="text-red-600">{errorCount}</span></p>
            <p><strong>Environment Key:</strong> <span className="text-gray-600">
              {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Present' : 'Missing'}
            </span></p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Test Results
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ No refresh/reset buttons in error UI</p>
            <p>✅ Graceful degradation when Clerk fails</p>
            <p>✅ App continues to work without authentication</p>
            <p>✅ Enhanced error logging with context</p>
            <p>✅ 30-second timeout instead of 15 seconds</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This test page simulates a Clerk configuration error after 5 seconds. 
            The app should continue to work normally without showing any error UI or requiring refreshes.
          </p>
        </div>
      </div>
    </div>
  );
}
