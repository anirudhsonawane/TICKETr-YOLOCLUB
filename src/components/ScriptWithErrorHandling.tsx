'use client';

import Script from 'next/script';

interface ScriptWithErrorHandlingProps {
  src: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  onError?: (e: any) => void;
  onLoad?: () => void;
}

export default function ScriptWithErrorHandling({ 
  src, 
  strategy = 'afterInteractive', 
  onError,
  onLoad 
}: ScriptWithErrorHandlingProps) {
  const handleError = (e: any) => {
    console.warn(`Script failed to load: ${src}`, e);
    onError?.(e);
  };

  const handleLoad = () => {
    console.log(`Script loaded successfully: ${src}`);
    onLoad?.();
  };

  return (
    <Script
      src={src}
      strategy={strategy}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}
