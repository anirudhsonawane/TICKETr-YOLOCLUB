import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Header from "../components/Header";
import SyncUserWithConvex from "../components/SyncUserWithConvex";
import Footer from "../components/Footer";
import { validateClerkConfiguration } from "../lib/clerk-error-handler";
import ClerkErrorHandler from "../components/ClerkErrorHandler";
import ClerkTimeoutHandler from "../components/ClerkTimeoutHandler";
import ScriptWithErrorHandling from "../components/ScriptWithErrorHandling";

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: "Ticketr - Your ultimate event ticketing solution.",
  description: "Ticketr helps you create, manage, and sell tickets for your events.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Validate Clerk configuration
  const clerkValidation = validateClerkConfiguration();
  if (!clerkValidation.isValid) {
    console.error('Clerk configuration validation failed:', clerkValidation.errors);
  }

  // Get Clerk publishable key with fallback
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // If no publishable key, render without Clerk
  if (!clerkPublishableKey) {
    console.warn('Clerk publishable key not found. Rendering without authentication.');
    return (
      <html lang="en">
        <body className={geistSans.className}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPublishableKey}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#2563eb',
        },
      }}
      localization={{
        locale: 'en',
      }}
      fallbackRedirectUrl="/"
      forceRedirectUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      // Disable telemetry to improve loading performance
      telemetry={{
        disabled: true,
      }}
      // Add error boundary for better error handling
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <html lang="en">
        <body className={geistSans.className}>
          <ClerkTimeoutHandler>
            <ConvexClientProvider>
              
                <SyncUserWithConvex />

                {/* 🔄 Show skeleton while Clerk is loading */}
                <ClerkLoading>
                  <div className="flex flex-col items-center justify-center h-screen space-y-4">
                    {/* Skeleton Header */}
                    <div className="w-3/4 h-12 bg-gray-300 animate-pulse rounded-lg" />
                    {/* Skeleton Content */}
                    <div className="w-5/6 h-64 bg-gray-200 animate-pulse rounded-xl" />
                  </div>
                </ClerkLoading>

                {/* ✅ Load Header + Main Content together */}
                <ClerkLoaded>
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                </ClerkLoaded>

                <Toaster />
              
            </ConvexClientProvider>
          </ClerkTimeoutHandler>

          <ScriptWithErrorHandling 
            src="https://checkout.razorpay.com/v1/checkout.js" 
            strategy="afterInteractive"
          />
          
          {/* Setup Clerk error handling */}
          <ClerkErrorHandler />
        </body>
      </html>
    </ClerkProvider>
  );
}
