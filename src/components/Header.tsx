"use client";

import Link  from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import SearchBar from "./SearchBar";
import PaymentVerificationNotification from "./PaymentVerificationNotification";
import { isAuthorizedAdmin } from "@/lib/admin-config";
import { Shield } from "lucide-react";

function Header() {
  const { isLoaded, user } = useUser();
  
  // Check if user is authorized admin
  const isAdmin = user && isAuthorizedAdmin(user.emailAddresses[0]?.emailAddress || '');

  return (
    <div className="border-b relative z-40">
      <div className="flex flex-col lg:flex-row items-center gap-4 p-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="shrink-0 group">
            <div className="relative">
              {/* Light Gradient Logo */}
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide">
                <span className="inline-block transform transition-transform duration-500 ease-out bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent group-hover:from-rose-300 group-hover:via-fuchsia-400 group-hover:to-indigo-400 group-hover:scale-105 drop-shadow-sm group-hover:drop-shadow-md">
                  GHOOMAR GARBA
                </span>
              </div>
              <div className="mt-0.5 text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-700">By YOLO CLUB EVENTS</div>
            </div>
          </Link>

          {isLoaded && (
          <div className="lg:hidden flex items-center relative z-50">
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-gray-200 shadow-sm",
                    userButtonPopoverRootBox: "z-50"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        )}
        </div>

        {/* Search Bar - full width on mobile*/}
        <div className="w-full lg:max-w-2xl">
          <SearchBar />
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:block ml-auto">
          <SignedIn>
            <div className="flex items-center gap-3">
              <PaymentVerificationNotification />
              
              {/* Admin Panel Button - Only for authorized admins */}
              {isAdmin && (
                <Link href="/admin/payments">
                  <button className="bg-green-600 text-white px-3 py-1.5 text-sm rounded-lg
                  hover:bg-green-700 transition flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                </Link>
              )}
              
              <Link href="/seller/new-event">
                <button className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg
                hover:bg-blue-700 transition">
                  Sell Tickets
                </button>
              </Link>

            <Link href="/tickets">
              <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg
              hover:bg-gray-200 transition border border-gray-300">
                My Tickets
              </button>
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 border-2 border-gray-200 shadow-sm",
                  userButtonPopoverCard: "z-50",
                  userButtonPopoverRootBox: "z-50"
                }
              }}
            />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg
              hover:bg-gray-200 transition border border-gray-300">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Action Buttons */}
        <div className="lg:hidden w-full flex justify-center gap-3">
          <SignedIn>
            {/* Admin Panel Button - Only for authorized admins */}
            {isAdmin && (
              <Link href="/admin/payments" className="flex-1">
                <button className="w-full bg-green-600 text-white px-3 py-1.5 text-sm rounded-lg
                hover:bg-green-700 transition flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </button>
              </Link>
            )}
            
            <Link href="/seller/new-event" className="flex-1">
              <button className="w-full bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg
              hover:bg-blue-700 transition">
                Sell Tickets
              </button>
            </Link>

            <Link href="/tickets" className="flex-1">
              <button className="w-full bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg
              hover:bg-gray-200 transition border border-gray-300">
                My Tickets
              </button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default Header;