"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  HelpCircle, 
  X, 
  Smartphone, 
  CreditCard, 
  MessageCircle,
  Phone,
  Mail
} from "lucide-react";

export default function QuickHelpPopup() {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!isLoaded || !user) {
    return null;
  }

  const helpItems = [
    {
      icon: Smartphone,
      title: "UPI Payment",
      description: "How to pay with UPI apps",
      action: () => {
        alert("UPI Payment Steps:\n\n1. Click 'Pay with UPI' button\n2. Your UPI app will open automatically\n3. Enter your UPI PIN\n4. Take a screenshot of payment confirmation\n5. Click 'Notify Organizer' and submit payment details\n6. Organizer will verify and create your ticket");
      }
    },
    {
      icon: CreditCard,
      title: "Payment Issues",
      description: "Troubleshooting payment problems",
      action: () => {
        alert("Common Payment Issues:\n\n• UPI app not opening: Copy the UPI link manually\n• Payment failed: Check your UPI balance\n• No confirmation: Take screenshot and contact organizer\n• Wrong amount: Contact organizer immediately\n• Payment not received: Wait 5-10 minutes and try again");
      }
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      description: "Get help from our team",
      action: () => {
        const message = "Hi! I need help with my ticket purchase.";
        const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with support team",
      action: () => {
        window.open('tel:+919876543210', '_self');
      }
    }
  ];

  return (
    <>
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
        {/* Help Menu Items */}
        <div className={`absolute bottom-16 left-0 mb-2 space-y-2 transition-all duration-300 max-h-[70vh] overflow-y-auto ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}>
          {helpItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="flex items-start gap-3 bg-white hover:bg-gray-50 text-gray-900 px-3 py-2 rounded-lg shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 border border-gray-200 min-w-[200px] md:min-w-[250px]"
                style={{
                  animationDelay: isOpen ? `${index * 0.05}s` : '0s',
                }}
              >
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-xs md:text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-600 hidden sm:block">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
          aria-label="Quick Help"
        >
          {isOpen ? (
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          ) : (
            <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
          )}
        </button>
      </div>

    </>
  );
}
