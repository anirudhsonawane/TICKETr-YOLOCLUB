"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { 
  Plus, 
  X, 
  Shield, 
  Ticket, 
  DollarSign, 
  MessageCircle, 
  Settings,
  HelpCircle,
  User,
  Calendar
} from "lucide-react";
import { isAuthorizedAdmin } from "@/lib/admin-config";

export default function FloatingActionButton() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const isAdmin = user && isAuthorizedAdmin(user.emailAddresses[0]?.emailAddress || '');

  // Don't show on certain pages
  const hiddenPages = ['/admin', '/seller'];
  const shouldHide = hiddenPages.some(page => pathname.startsWith(page));

  if (!isLoaded || !user || shouldHide) {
    return null;
  }

  const menuItems = [
    {
      icon: Ticket,
      label: "My Tickets",
      action: () => router.push('/tickets'),
      color: "bg-blue-600 hover:bg-blue-700",
      show: true,
    },
    {
      icon: Calendar,
      label: "Create Event",
      action: () => router.push('/seller/new-event'),
      color: "bg-green-600 hover:bg-green-700",
      show: true,
    },
    {
      icon: Shield,
      label: "Admin Panel",
      action: () => router.push('/admin/payments'),
      color: "bg-purple-600 hover:bg-purple-700",
      show: isAdmin,
    },
    {
      icon: DollarSign,
      label: "Payment Help",
      action: () => router.push('/test-upi'),
      color: "bg-yellow-600 hover:bg-yellow-700",
      show: true,
    },
    {
      icon: MessageCircle,
      label: "Support",
      action: () => {
        // Open WhatsApp or email support
        const supportMessage = "Hi! I need help with my ticket purchase.";
        const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(supportMessage)}`;
        window.open(whatsappUrl, '_blank');
      },
      color: "bg-green-500 hover:bg-green-600",
      show: true,
    },
    {
      icon: HelpCircle,
      label: "FAQ",
      action: () => {
        // Scroll to FAQ section or open modal
        alert("FAQ: \n\n1. How to pay with UPI?\n2. How to get tickets?\n3. How to contact support?");
      },
      color: "bg-gray-600 hover:bg-gray-700",
      show: true,
    },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu Items */}
      <div className={`absolute bottom-16 right-0 mb-2 space-y-2 transition-all duration-300 ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`flex items-center space-x-3 ${item.color} text-white px-4 py-3 rounded-full shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105`}
              onClick={() => {
                item.action();
                setIsOpen(false);
              }}
              style={{
                animationDelay: isOpen ? `${index * 0.1}s` : '0s',
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium whitespace-nowrap">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-red-600 hover:bg-red-700 rotate-45' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label="Quick Actions"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
