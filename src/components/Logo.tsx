"use client";

import { useState, useEffect } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ width = 200, height = 40, className = "" }: LogoProps) {
  const [currentSrc, setCurrentSrc] = useState("/images/img.jpg");
  const [errorCount, setErrorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // List of image sources to try in order
  const imageSources = [
    "/images/img.jpg",
    "/logo.png",
    "/api/logo?type=main",
    "/api/logo?type=fallback",
    "/public/images/img.jpg",
    "/public/logo.png"
  ];

  const handleError = () => {
    console.error(`Logo image failed to load: ${currentSrc}`);
    setErrorCount(prev => prev + 1);
    
    if (errorCount < imageSources.length - 1) {
      // Try next image source
      const nextIndex = errorCount + 1;
      setCurrentSrc(imageSources[nextIndex]);
      console.log(`Trying next image source: ${imageSources[nextIndex]}`);
    } else {
      console.error('All logo image sources failed to load');
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    console.log(`Logo image loaded successfully: ${currentSrc}`);
    setIsLoading(false);
  };

  // Reset error count when src changes
  useEffect(() => {
    setErrorCount(0);
    setIsLoading(true);
  }, [currentSrc]);

  // If all images failed, show text fallback
  if (errorCount >= imageSources.length) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gray-100 border border-gray-300 rounded`}
        style={{ width, height }}
      >
        <span className="text-gray-600 font-bold text-sm">Ticketr Logo</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`${className} flex items-center justify-center bg-gray-100 border border-gray-300 rounded animate-pulse`}
          style={{ width, height }}
        >
          <span className="text-gray-400 text-xs">Loading...</span>
        </div>
      )}
      <img
        src={currentSrc}
        alt="Ticketr Logo"
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}
