"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const [showContact, setShowContact] = useState(false);

  return (
    <footer className="relative w-full bg-white border-t border-gray-200 text-gray-800 py-10 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="Ticketr Logo"
            width={140}
            height={40}
            priority
          />
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4">
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

        {/* Contact Us Button */}
        <div className="relative">
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
      initial={{ opacity: 0, y: 20 }}   // start 20px below
      animate={{ opacity: 1, y: -0 }}   // slide up
      exit={{ opacity: 0, y: 20 }}      // slide back down when closing
      transition={{ duration: 0.3 }}
      className="absolute bottom-full mb-3 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-6"
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
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
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

      {/* Copyright */}
      <div className="mt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Ticketr. All rights reserved.
      </div>
    </footer>
  );
}
