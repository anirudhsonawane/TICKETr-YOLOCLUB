"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { 
  X, 
  Shield, 
  Ticket, 
  DollarSign, 
  MessageCircle, 
  HelpCircle,
  User,
  Calendar,
  Bell,
  CreditCard,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import { isAuthorizedAdmin } from "@/lib/admin-config";

export default function SmartFloatingButton() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [contactType, setContactType] = useState<'call' | 'whatsapp'>('call');
  
  const isAdmin = user && isAuthorizedAdmin(user.emailAddresses[0]?.emailAddress || '');

  // Don't show on certain pages
  const hiddenPages = ['/admin', '/seller'];
  const shouldHide = hiddenPages.some(page => pathname.startsWith(page));

  // Show notification after a delay (simulating new payment notification) - Only for admins
  useEffect(() => {
    if (isAdmin) {
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  if (!isLoaded || !user || shouldHide) {
    return null;
  }

  // Get page-specific menu items
  const getPageSpecificItems = () => {
    const baseItems = [
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
    ];

    // Add page-specific items
    if (pathname === '/') {
      baseItems.push({
        icon: DollarSign,
        label: "How to Pay",
        action: () => {
          alert("UPI Payment Steps:\n\n1. Click 'Pay with UPI'\n2. Select your UPI app\n3. Enter UPI PIN\n4. Take screenshot\n5. Notify organizer");
        },
        color: "bg-yellow-600 hover:bg-yellow-700",
        show: true,
      });
    }

    if (pathname.startsWith('/event/')) {
      baseItems.push({
        icon: CreditCard,
        label: "Payment Help",
        action: () => {
          alert("Need help with payment?\n\n1. Use any UPI app (GPay, PhonePe, Paytm)\n2. Take screenshot after payment\n3. Contact organizer with proof\n4. Get your ticket!");
        },
        color: "bg-indigo-600 hover:bg-indigo-700",
        show: true,
      });
    }

    // Add contact options
    baseItems.push(
      {
        icon: Phone,
        label: "Call Support",
        action: () => {
          setContactType('call');
          setShowContactPopup(true);
          setIsOpen(false);
        },
        color: "bg-green-500 hover:bg-green-600",
        show: true,
      },
      {
        icon: MessageCircle,
        label: "WhatsApp",
        action: () => {
          setContactType('whatsapp');
          setShowContactPopup(true);
          setIsOpen(false);
        },
        color: "bg-green-600 hover:bg-green-700",
        show: true,
      },
      {
        icon: Mail,
        label: "Email Support",
        action: () => {
          window.open('mailto:support@t-system.com?subject=Ticket Support', '_self');
        },
        color: "bg-gray-600 hover:bg-gray-700",
        show: true,
      }
    );

    return baseItems.filter(item => item.show);
  };

  const menuItems = getPageSpecificItems();

  return (
    <>
        {/* Notification Badge - Only show for admins */}
        {showNotification && isAdmin && (
          <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <Bell className="w-4 h-4" />
            <span className="text-sm">New payment notification!</span>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        {/* Menu Items */}
        <div className={`absolute bottom-16 right-0 mb-2 space-y-2 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`flex items-center space-x-2 ${item.color} text-white px-3 py-2 rounded-full shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 text-xs md:text-sm`}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                style={{
                  animationDelay: isOpen ? `${index * 0.05}s` : '0s',
                }}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-medium whitespace-nowrap hidden sm:block">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          aria-label="Quick Actions"
        >
          {isOpen ? (
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          ) : (
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
          )}
        </button>

      </div>

      {/* Contact Popup */}
      {showContactPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={() => setShowContactPopup(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 border-2 border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {contactType === 'call' ? '📞 Call Support' : '📱 WhatsApp Support'}
                </h3>
                <button
                  onClick={() => setShowContactPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Choose a number to {contactType === 'call' ? 'call' : 'message'}:
                </p>
                
                <button
                  onClick={() => {
                    window.open('tel:+919595961116', '_self');
                    setShowContactPopup(false);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">9595961116</span>
                </button>
                
                <button
                  onClick={() => {
                    if (contactType === 'call') {
                      window.open('tel:+918080977200', '_self');
                    } else {
                      const message = "Hi! I need help with my ticket purchase.";
                      const whatsappUrl = `https://wa.me/918080977200?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }
                    setShowContactPopup(false);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">8080977200</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
