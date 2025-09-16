"use client";

import Link  from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import SearchBar from "./SearchBar";

function Header() {
  const { isLoaded } = useUser();

  return (
    <div className="border-b relative z-40">
      <div className="flex flex-col lg:flex-row items-center gap-4 p-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="font-bold shrink-0">
            <div className="flex items-center justify-center relative">
              <img 
                src="/logo.png"
                alt="TICKETr Logo"
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain transition-all duration-200 hover:scale-105"
                loading="eager"
                onError={(e) => {
                  console.log('Logo failed to load, showing text fallback');
                  e.currentTarget.style.display = 'none';
                  const textFallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (textFallback && textFallback.style) {
                    textFallback.style.display = 'block';
                  }
                }}
                onLoad={() => console.log('Logo loaded successfully')}
              />
              <div className="hidden text-blue-600 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-wide">
                TICKETr
              </div>
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