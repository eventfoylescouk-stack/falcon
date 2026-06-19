import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tool tip after 3 seconds for friendly engagement
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    window.open('https://wa.me/2348028955522?text=Hello%20Falcon%20Driving%20School%2C%20I%20want%20to%20inquire%20about%20your%20driving%20courses.', '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans">
      
      {/* Tooltip widget */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            className="bg-neutral-900 text-white rounded-2xl shadow-2xl p-4 max-w-xs border border-neutral-800 text-left relative flex flex-col gap-2"
            id="whatsapp-tooltip-popover"
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="absolute top-2 right-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-semibold text-xs text-neutral-400 uppercase tracking-widest leading-none">Falcon Online</span>
            </div>
            <p className="text-sm font-medium mt-1 pr-4">
              Get started today! Chat directly with our Abuja booking team for instant scheduling.
            </p>
            <button 
              onClick={handleClick}
              className="text-emerald-400 hover:underline hover:text-emerald-300 font-bold text-xs flex items-center gap-1.5 align-middle mt-1 cursor-pointer"
            >
              Chat on WhatsApp <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Green Button */}
      <button
        onClick={handleClick}
        id="floating-whatsapp-btn"
        className="relative bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group focus:outline-hidden flex items-center justify-center cursor-pointer"
        aria-label="Contact us on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
      >
        <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-30 animate-ping group-hover:hidden"></span>
        {/* Customized SVG representation resembling a cleaner modern message or real WhatsApp layout */}
        <MessageSquare className="w-7 h-7 relative z-10" />
      </button>
    </div>
  );
}
