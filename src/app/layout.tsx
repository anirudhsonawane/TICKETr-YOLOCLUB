import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: "YOLO CLUB - Your ultimate event ticketing solution.",
  description: "YOLO CLUB helps you create, manage, and sell tickets for your events.",
  icons: {
    icon: "/softoria-logo.png",
    apple: "/softoria-logo.png",
    shortcut: "/softoria-logo.png",
  },
  other: {
    // Add meta tag to handle prefetch-src CSP issues
    'prefetch-src': "'self' https://api.phonepe.com https://mercury-t2.phonepe.com https://mercury.phonepe.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Add meta tag to handle prefetch-src CSP issues */}
        <meta name="prefetch-src" content="'self' https://api.phonepe.com https://mercury-t2.phonepe.com https://mercury.phonepe.com" />
        {/* Favicon / App Icon */}
        <link rel="icon" href="/softoria-logo.png" />
        <link rel="apple-touch-icon" href="/softoria-logo.png" />
      </head>
      <body className={geistSans.className}>
        <AuthProvider>
          <ConvexClientProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}