"use client";

import { useState } from "react";

export default function TestLogoPage() {
  const [testResults, setTestResults] = useState<any>(null);

  const testImages = async () => {
    const images = [
      "/images/img.jpg",
      "/logo.png",
      "/public/images/img.jpg", 
      "/public/logo.png"
    ];

    const results = await Promise.all(
      images.map(async (src) => {
        try {
          const response = await fetch(src);
          return {
            src,
            status: response.status,
            ok: response.ok,
            accessible: response.ok
          };
        } catch (error) {
          return {
            src,
            status: 'error',
            ok: false,
            accessible: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    setTestResults(results);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Logo Image Test</h1>
      
      <button 
        onClick={testImages}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
      >
        Test Image Accessibility
      </button>

      {testResults && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results:</h2>
          {testResults.map((result: any, index: number) => (
            <div key={index} className={`p-4 rounded border ${
              result.accessible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="font-mono text-sm">
                <strong>Path:</strong> {result.src}
              </div>
              <div className="font-mono text-sm">
                <strong>Status:</strong> {result.status}
              </div>
              <div className="font-mono text-sm">
                <strong>Accessible:</strong> {result.accessible ? '✅ Yes' : '❌ No'}
              </div>
              {result.error && (
                <div className="font-mono text-sm text-red-600">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Direct Image Tests:</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">/images/img.jpg</h3>
            <img 
              src="/images/img.jpg" 
              alt="Test img.jpg" 
              className="border w-full h-32 object-contain bg-gray-100"
              onError={(e) => {
                e.currentTarget.style.border = '2px solid red';
                e.currentTarget.alt = 'Failed to load img.jpg';
              }}
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">/logo.png</h3>
            <img 
              src="/logo.png" 
              alt="Test logo.png" 
              className="border w-full h-32 object-contain bg-gray-100"
              onError={(e) => {
                e.currentTarget.style.border = '2px solid red';
                e.currentTarget.alt = 'Failed to load logo.png';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
