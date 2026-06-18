import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, ShieldCheck, HeartPulse, Award } from 'lucide-react';
import { FAQS } from '../data';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 lg:py-24 bg-white border-t border-neutral-100 font-sans text-neutral-800" id="home-faq-wrapper">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header copy */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-widest rounded-full px-4 py-1.5 font-bold inline-block">
            Clear Answers
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-neutral-900 uppercase">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-500 text-sm">
            Everything you need to know about starting your driving journey, operating controls, and securing licenses in Abuja FCT.
          </p>
        </div>

        {/* Interactive Accordion List */}
        <div className="space-y-4" id="faq-accordion-container">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl transition-all duration-350 overflow-hidden ${
                  isOpen 
                    ? 'bg-neutral-50 border-emerald-500/30 shadow-md' 
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 cursor-pointer focus:outline-hidden"
                  aria-expanded={isOpen}
                  id={`faq-btn-${idx}`}
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isOpen ? 'text-emerald-600' : 'text-neutral-400'}`} />
                    <span className="font-display font-bold text-sm sm:text-base text-neutral-900 leading-tight">
                      {faq.q}
                    </span>
                  </div>
                  <span className={`w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-emerald-50 text-emerald-700' : 'text-neutral-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {/* Animated collapse explanation */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="border-t border-neutral-150"
                    >
                      <div className="px-6 py-5 text-neutral-600 text-xs sm:text-sm leading-relaxed bg-white/50 text-left">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

        {/* Dynamic bottom action badge */}
        <div className="mt-12 p-6 sm:p-8 bg-neutral-900 text-white rounded-3xl border border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-6 text-left">
          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-base text-white">Still have more specific inquiries?</h4>
            <p className="text-xs text-neutral-400">Our customer desk operates 24/7 on WhatsApp responding to unique FCT scheduling needs.</p>
          </div>
          <a
            href="https://wa.me/2348028955522?text=Hello%20Falcon%20Driving%20School%2C%20I%20have%20another%20question..."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-sans font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 text-center"
            id="faq-whatsapp-cta"
          >
            Ask on WhatsApp
          </a>
        </div>

      </div>
    </section>
  );
}
