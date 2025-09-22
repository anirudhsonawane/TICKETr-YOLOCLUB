"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const [showContact, setShowContact] = useState(false);

  return (
    <footer className="relative w-full bg-white border-t border-gray-200 text-gray-800 py-10 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo - Left aligned */}
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <div className="">
            <div className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-rose-500 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
              GHOOMAR GARBA
            </div>
            <div className="text-xs font-medium text-gray-600">By YOLO CLUB EVENTS</div>
          </div>
        </div>

        {/* Middle section for Social Media (will be centered by justify-between around it) */}
        <div className="flex-grow flex justify-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="https://facebook.com" className="text-gray-400 hover:text-blue-600">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" className="text-gray-400 hover:text-sky-500">
              <Twitter size={20} />
            </a>
            <a href="https://instagram.com" className="text-gray-400 hover:text-pink-500">
              <Instagram size={20} />
            </a>
          </div>
        </div>

        {/* Contact Us Button - Right aligned */}
        <div className="relative mb-4 md:mb-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowContact(!showContact)}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-800 font-medium border border-gray-300 hover:bg-gray-200 transition-all shadow-sm"
          >
            Contact Us
          </motion.button>

          {/* Contact Card */}
          <AnimatePresence>
            {showContact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: -0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-6 z-50"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Write your message..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                  >
                    Send Message
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Policy Links */}
      <div className="mt-6 text-center">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <Link href="/about-us" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
            About Us
          </Link>
          <Link href="/terms-and-conditions" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
            Terms & Conditions
          </Link>
          <Link href="/pricing-policy" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
            Pricing Policy
          </Link>
          <Link href="/cancellation-refund-policy" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
            Cancellation & Refund Policy
          </Link>
          <Link href="/privacy-policy" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
            Privacy Policy
          </Link>
        </div>
        
        {/* Copyright */}
        <div className="text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Ticketr. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  );
}
