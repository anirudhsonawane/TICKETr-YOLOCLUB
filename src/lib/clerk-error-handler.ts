// Clerk Error Handler Utility
// This module handles Clerk loading errors and provides fallbacks

export interface ClerkErrorHandler {
  handleClerkError: (error: Error) => void;
  isClerkLoading: () => boolean;
  getClerkStatus: () => 'loading' | 'loaded' | 'error' | 'timeout';
}

class ClerkErrorHandlerImpl implements ClerkErrorHandler {
  private status: 'loading' | 'loaded' | 'error' | 'timeout' = 'loading';
  private errorCount = 0;
  private maxRetries = 3;
  private timeoutMs = 30000; // Increased to 30 seconds for better reliability
  private timeoutId: NodeJS.Timeout | null = null;
  private startTime = Date.now();

  constructor() {
    this.setupTimeout();
  }

  private setupTimeout() {
    // Clear any existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      if (this.status === 'loading') {
        this.status = 'timeout';
        const duration = Date.now() - this.startTime;
        console.warn(`Clerk loading timeout after ${duration}ms (${this.timeoutMs}ms limit) - continuing without authentication`);
        // Don't call handleClerkError for timeout, just mark as loaded to continue
        this.status = 'loaded';
      }
    }, this.timeoutMs);
  }

  handleClerkError(error: Error): void {
    this.errorCount++;
    this.status = 'error';
    
    // Enhanced error logging with more context
    console.error('Clerk error:', {
      message: error.message,
      errorCount: this.errorCount,
      maxRetries: this.maxRetries,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    });

    // Check if this is a configuration error
    if (this.isConfigurationError(error)) {
      console.warn('Clerk configuration error detected - continuing without authentication');
      // Don't show UI for configuration errors, just log and continue
      this.status = 'loaded'; // Mark as loaded to prevent further error handling
      return;
    }

    // If we haven't exceeded max retries, try to reload
    if (this.errorCount < this.maxRetries) {
      console.log(`Retrying Clerk load (${this.errorCount}/${this.maxRetries})`);
      this.retryClerkLoad();
    } else {
      console.warn('Clerk failed to load after maximum retries - continuing without authentication');
      this.status = 'loaded'; // Mark as loaded to prevent showing fallback UI
    }
  }

  private retryClerkLoad(): void {
    this.status = 'loading';
    this.startTime = Date.now();
    
    // Reset timeout for retry
    this.setupTimeout();
    
    console.log(`Retrying Clerk load (attempt ${this.errorCount}/${this.maxRetries})`);
    
    // Instead of reloading the page, try to reinitialize Clerk
    this.attemptClerkReinitialization();
  }

  private attemptClerkReinitialization(): void {
    // Try to reinitialize Clerk without page reload
    if (typeof window !== 'undefined') {
      // Check if Clerk script is still loading
      const clerkScript = document.querySelector('script[src*="clerk"]');
      if (clerkScript) {
        // Remove the old script and let it reload naturally
        clerkScript.remove();
      }
      
      // Try to trigger Clerk initialization again
      setTimeout(() => {
        // Dispatch a custom event to trigger Clerk reload
        window.dispatchEvent(new CustomEvent('clerk:retry'));
      }, 1000);
    }
  }

  private isConfigurationError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('publishable key') ||
      errorMessage.includes('invalid key') ||
      errorMessage.includes('configuration') ||
      errorMessage.includes('missing') ||
      errorMessage.includes('undefined') ||
      errorMessage.includes('null')
    );
  }

  private showConfigurationErrorUI(): void {
    if (typeof window !== 'undefined') {
      const configDiv = document.createElement('div');
      configDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #fef3c7;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            margin: 1rem;
            border-left: 4px solid #f59e0b;
          ">
            <div style="margin-bottom: 1rem;">
              <svg style="width: 48px; height: 48px; color: #f59e0b; margin: 0 auto;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Configuration Required</h2>
            <p style="color: #6b7280; margin-bottom: 1.5rem; text-align: left;">
              Clerk authentication is not properly configured. Please add the following environment variables to your <code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: monospace;">.env.local</code> file:
            </p>
            <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; text-align: left; font-family: monospace; font-size: 0.875rem;">
              <div style="margin-bottom: 0.5rem;">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</div>
              <div>CLERK_SECRET_KEY=sk_test_...</div>
            </div>
            <p style="color: #6b7280; margin-bottom: 1.5rem; font-size: 0.875rem;">
              Get these keys from your <a href="https://dashboard.clerk.com/" target="_blank" style="color: #2563eb; text-decoration: underline;">Clerk Dashboard</a>
            </p>
            <p style="color: #6b7280; font-size: 0.875rem; font-style: italic;">
              Once configured, restart your development server to apply the changes.
            </p>
          </div>
        </div>
      `;
      
      document.body.appendChild(configDiv);
    }
  }

  private showFallbackUI(): void {
    // Create a fallback UI for when Clerk fails to load
    if (typeof window !== 'undefined') {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #f3f4f6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            margin: 1rem;
          ">
            <div style="margin-bottom: 1rem;">
              <svg style="width: 48px; height: 48px; color: #6b7280; margin: 0 auto;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 style="color: #1f2937; margin-bottom: 1rem;">Authentication Service Unavailable</h2>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">
              We're experiencing temporary issues with our authentication service. The application will continue to work without authentication features.
            </p>
            <p style="color: #6b7280; font-size: 0.875rem; font-style: italic;">
              Please check your network connection and try again later.
            </p>
          </div>
        </div>
      `;
      
      document.body.appendChild(fallbackDiv);
    }
  }

  isClerkLoading(): boolean {
    return this.status === 'loading';
  }

  getClerkStatus(): 'loading' | 'loaded' | 'error' | 'timeout' {
    return this.status;
  }

  setClerkLoaded(): void {
    // Clear timeout since Clerk loaded successfully
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    this.status = 'loaded';
    const duration = Date.now() - this.startTime;
    console.log(`Clerk loaded successfully in ${duration}ms`);
  }

  // Method to clear timeout manually
  clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Method to reset handler status
  reset(): void {
    this.status = 'loading';
    this.errorCount = 0;
    this.startTime = Date.now();
    this.clearTimeout();
    this.setupTimeout();
  }
}

// Singleton instance
let clerkErrorHandler: ClerkErrorHandlerImpl | null = null;

export const getClerkErrorHandler = (): ClerkErrorHandler => {
  if (!clerkErrorHandler) {
    clerkErrorHandler = new ClerkErrorHandlerImpl();
  }
  return clerkErrorHandler;
};

// Global error handler for Clerk
export const setupClerkErrorHandling = () => {
  if (typeof window === 'undefined') return;

  const handler = getClerkErrorHandler();

  // Handle unhandled promise rejections from Clerk
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('Clerk') || 
         event.reason.message.includes('clerk'))) {
      console.warn('Clerk unhandled rejection:', event.reason);
      handler.handleClerkError(event.reason);
      event.preventDefault();
    }
  });

  // Handle global errors from Clerk
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        (event.error.message.includes('Clerk') || 
         event.error.message.includes('clerk'))) {
      console.warn('Clerk global error:', event.error);
      handler.handleClerkError(event.error);
    }
  });

  // Monitor Clerk script loading
  const clerkScript = document.querySelector('script[src*="clerk"]');
  if (clerkScript) {
    clerkScript.addEventListener('error', (event) => {
      console.error('Clerk script failed to load:', event);
      handler.handleClerkError(new Error('Clerk script failed to load'));
    });

    clerkScript.addEventListener('load', () => {
      console.log('Clerk script loaded successfully');
      handler.setClerkLoaded();
    });
  }
};

// Utility to check if Clerk is properly configured
export const validateClerkConfiguration = (): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for Clerk publishable key
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required');
  } else if (!publishableKey.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should start with "pk_"');
  }

  // Check for Clerk secret key (for server-side)
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    warnings.push('CLERK_SECRET_KEY is recommended for server-side operations');
  } else if (!secretKey.startsWith('sk_')) {
    warnings.push('CLERK_SECRET_KEY should start with "sk_"');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
