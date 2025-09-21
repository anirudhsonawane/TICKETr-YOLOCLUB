'use client';

import { useEffect } from 'react';
import { setupClerkErrorHandling, getClerkErrorHandler } from '@/lib/clerk-error-handler';

export default function ClerkErrorHandler() {
  useEffect(() => {
    setupClerkErrorHandling();
    
    // Monitor for Clerk loading completion
    const checkClerkStatus = () => {
      const handler = getClerkErrorHandler();
      
      // Check if Clerk is loaded by looking for Clerk elements
      const clerkElements = document.querySelectorAll('[data-clerk]');
      if (clerkElements.length > 0) {
        handler.setClerkLoaded();
      }
    };

    // Check immediately
    checkClerkStatus();

    // Set up interval to check for Clerk loading
    const statusInterval = setInterval(checkClerkStatus, 500);

    // Also listen for any Clerk-related events
    const handleClerkLoad = () => {
      const handler = getClerkErrorHandler();
      handler.setClerkLoaded();
    };

    // Listen for Clerk loaded events
    window.addEventListener('clerk:loaded', handleClerkLoad);
    document.addEventListener('clerk:loaded', handleClerkLoad);

    // Listen for Clerk retry events
    const handleClerkRetry = () => {
      console.log('Clerk retry event received, resetting status');
      const handler = getClerkErrorHandler();
      // Reset the handler status to loading
      handler.reset();
    };

    window.addEventListener('clerk:retry', handleClerkRetry);

    // Cleanup
    return () => {
      clearInterval(statusInterval);
      window.removeEventListener('clerk:loaded', handleClerkLoad);
      document.removeEventListener('clerk:loaded', handleClerkLoad);
      window.removeEventListener('clerk:retry', handleClerkRetry);
    };
  }, []);

  return null; // This component doesn't render anything
}
