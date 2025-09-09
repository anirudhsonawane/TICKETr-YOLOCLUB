import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import Header from "../components/Header";
import SyncUserWithConvex from "../components/SyncUserWithConvex";
import Footer from "../components/Footer";

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: "Ticketr - Your ultimate event ticketing solution.",
  description: "Ticketr helps you create, manage, and sell tickets for your events.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={geistSans.className}>
          <ConvexClientProvider>
            <ClerkProvider>
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
            </ClerkProvider>
          </ConvexClientProvider>

          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </body>
      </html>
    </ClerkProvider>
  );
}
