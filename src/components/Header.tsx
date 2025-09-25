"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "./SearchBar";
import { isAuthorizedAdmin } from "@/lib/admin-config";
import { Shield, User, LogOut, Menu, X, Ticket, Plus } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if user is authorized admin
  const isAdmin = user && isAuthorizedAdmin(user.email || '');

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

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
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Menu"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
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

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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

        {/* Mobile Menu */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="lg:hidden w-full bg-white border-t border-gray-200 shadow-lg mobile-menu-container">
            <div className="p-4 space-y-3">
              {/* Admin Panel Button - Only for authorized admins */}
              {isAdmin && (
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full bg-green-600 text-white px-4 py-3 text-sm rounded-lg hover:bg-green-700 transition flex items-center gap-3 justify-center">
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                </Link>
              )}
              
              <Link href="/seller/new-event" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full bg-blue-600 text-white px-4 py-3 text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-3 justify-center">
                  <Plus className="w-4 h-4" />
                  Sell Tickets
                </button>
              </Link>

              <Link href="/tickets" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full bg-gray-100 text-gray-800 px-4 py-3 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300 flex items-center gap-3 justify-center">
                  <Ticket className="w-4 h-4" />
                  My Tickets
                </button>
              </Link>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Header;