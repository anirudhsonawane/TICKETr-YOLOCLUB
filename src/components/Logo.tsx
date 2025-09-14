"use client";

import Image from "next/image";
import { useState } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ width = 200, height = 40, className = "" }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("/images/img.jpg");

  const handleError = () => {
    console.error('Logo image failed to load, trying fallback...');
    if (!imageError) {
      setImageError(true);
      setCurrentSrc("/logo.png");
    }
  };

  const handleLoad = () => {
    console.log('Logo image loaded successfully');
  };

  return (
    <Image
      src={currentSrc}
      alt="Ticketr Logo"
      width={width}
      height={height}
      priority
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}
