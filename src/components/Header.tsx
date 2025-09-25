"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "./SearchBar";
import { isAuthorizedAdmin } from "@/lib/admin-config";
import { Shield, User, LogOut, Ticket, Plus } from "lucide-react";
import { useEffect, useState } from "react";

function Header() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="border-b">
        <div className="flex flex-col lg:flex-row items-center gap-4 p-4">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <Link href="/" className="shrink-0">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide">
                <span className="inline-block bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                  GHOOMAR GARBA
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <HeaderContent />;
}

function HeaderContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Check if user is authorized admin
  const isAdmin = user && isAuthorizedAdmin(user.email || '');

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen) {
        const target = event.target as Element;
        if (!target.closest('.profile-dropdown-container')) {
          setIsProfileOpen(false);
        }
      }
    };

    if (isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileOpen]);

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

          <div className="lg:hidden flex items-center gap-2 relative z-50 mobile-menu-container">
            {isAuthenticated ? (
              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:max-w-2xl">
          <SearchBar />
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:block ml-auto">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Admin Panel Button - Only for authorized admins */}
              {isAdmin && (
                <Link href="/admin">
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

              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/auth">
              <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg
              hover:bg-gray-200 transition border border-gray-300">
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Action Buttons - Always Visible */}
        {isAuthenticated && (
          <div className="lg:hidden w-full bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex flex-col gap-2">
              {/* Admin Panel Button - Only for authorized admins */}
              {isAdmin && (
                <Link href="/admin">
                  <button className="w-full bg-green-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-700 transition flex items-center gap-2 justify-center">
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                </Link>
              )}
              
              <div className="flex gap-2">
                <Link href="/seller/new-event" className="flex-1">
                  <button className="w-full bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center">
                    <Plus className="w-4 h-4" />
                    Sell Tickets
                  </button>
                </Link>

                <Link href="/tickets" className="flex-1">
                  <button className="w-full bg-gray-100 text-gray-800 px-3 py-2 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300 flex items-center gap-2 justify-center">
                    <Ticket className="w-4 h-4" />
                    My Tickets
                  </button>
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Header;