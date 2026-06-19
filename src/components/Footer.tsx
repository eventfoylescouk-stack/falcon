import React from 'react';
import { Phone, MapPin, Instagram, Clock, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export function Footer({ setCurrentPage }: FooterProps) {
  const handleLinkClick = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-900 text-neutral-350 pt-16 pb-8 border-t border-neutral-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm text-neutral-400">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleLinkClick('home')}>
              <div className="flex flex-col gap-1 bg-neutral-950 p-1.5 rounded-full border border-neutral-800 shadow-xs w-8 items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg tracking-wider text-white uppercase leading-none">
                  Falcon
                </span>
                <span className="font-sans font-semibold text-[10px] tracking-widest text-neutral-500 uppercase leading-none mt-1">
                  Driving School
                </span>
              </div>
            </div>
            <p className="text-neutral-400 leading-relaxed mt-4">
              Providing premium, professional and licensed driving lessons across Wuye, Abuja. We are dedicated to nurturing safe drivers, nervous beginners, and defensive experts using state-of-the-art virtual simulators and patient practical training.
            </p>
            <div className="flex items-center gap-3 pt-2 text-white">
              <span className="text-xs text-neutral-500 font-mono">CONNECT:</span>
              <a 
                href="https://instagram.com/falcondrivingschoolng" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors bg-neutral-800 p-2 rounded-full text-neutral-300 hover:scale-105 transform inline-block"
                id="footer-ig-link"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6 font-display tracking-wide uppercase border-l-2 border-emerald-500 pl-3">
              Explore Our Site
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Home Page', id: 'home' },
                { label: 'Programs & Prices', id: 'programs' },
                { label: 'Registration / Sign-Up', id: 'signup' },
                { label: 'Lock in Payments', id: 'payment' },
                { label: 'Success Gallery & Reviews', id: 'gallery' },
                { label: 'About Our Instructors', id: 'about' },
                { label: 'Contact & Google Maps', id: 'contact' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    className="hover:text-emerald-400 transition-all text-neutral-400 font-medium hover:translate-x-1 transform flex items-center gap-2 cursor-pointer text-left"
                  >
                    <span className="text-amber-500 text-xs">➔</span> {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs Highlight */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6 font-display tracking-wide uppercase border-l-2 border-red-500 pl-3">
              Popular Training
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>2-Week Beginners Course (with License support)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>1-Week Intensive Refresher Course</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Defensive Driving & Accident Prevention</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Special Home & Corporate Executive Training</span>
              </li>
            </ul>
          </div>

          {/* Location & Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6 font-display tracking-wide uppercase border-l-2 border-amber-500 pl-3">
              Visit Wuye Academy
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <span>Suite B8, AYM Shafa Petrol Station, Wuye, Abuja, Nigeria</span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-white font-bold text-base">0802-895-5522</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Call or WhatsApp 24/7</p>
                </div>
              </li>
              <li className="flex gap-3 text-neutral-400">
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold text-neutral-350">Mon - Sat: 7:00 AM - 6:00 PM</p>
                  <p className="text-xs text-neutral-500">Flexible weekend slots by arrangement</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* SEO Keywords Highlight Panel */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 leading-relaxed text-center sm:text-left">
            Keywords: Driving school in Abuja | Driving lessons Wuye Abuja | Federal Road Safety Corps certified school | Automatic driving academy Nigeria | Manual gear transmission coaching | Defensive driving workshops Abuja | Driver's licence processing certificate | Affordable driving training program Abuja FCT.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-neutral-800 text-xs text-neutral-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Falcon Driving School Ltd. All Rights Reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed to absolute Abuja safety standards. <span className="text-red-500">★</span> <span className="text-amber-500">★</span> <span className="text-emerald-500">★</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
