import React, { useState } from 'react';
import { Menu, X, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'programs', label: 'Programs & Pricing' },
    { id: 'about', label: 'About Us' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'payment', label: 'Payment' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs">
      {/* Top micro-bar for emergency urgency or contact info */}
      <div className="bg-neutral-900 text-white text-xs py-1.5 px-4 font-sans flex justify-between items-center sm:px-6 md:px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>FRSC & VIO Certified Driving Academy, Abuja</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="tel:08028955522" className="hover:text-amber-400 transition-colors flex items-center gap-1">
            <Phone className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Call Us:</span> 0802-895-5522
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo with vertical traffic light stack */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-3 cursor-pointer group"
            id="brand-logo-container"
          >
            {/* Elegant vertical traffic light icon */}
            <div className="flex flex-col gap-1 bg-neutral-905 p-1.5 rounded-full border border-neutral-800 shadow-sm w-8 items-center justify-center bg-zinc-900">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
            </div>
            
            <div className="flex flex-col">
              <span className="font-display font-black text-lg tracking-wider text-neutral-900 group-hover:text-emerald-600 transition-colors leading-none uppercase">
                Falcon
              </span>
              <span className="font-sans font-semibold text-[10px] tracking-widest text-neutral-500 uppercase leading-none mt-1">
                Driving School
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-${item.id}`}
                  className={`px-4 py-2 rounded-lg font-sans font-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            <button
              onClick={() => handleNavClick('signup')}
              id="header-cta-signup"
              className="ml-4 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-sans font-semibold text-sm rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 border border-transparent duration-300 cursor-pointer hover:border-emerald-500"
            >
              Get Started
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 p-2 rounded-lg focus:outline-hidden transition-colors"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-t border-gray-100 bg-white"
            id="mobile-nav-drawer"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-sans font-medium text-base transition-colors ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50 font-bold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              
              <div className="pt-2">
                <button
                  onClick={() => handleNavClick('signup')}
                  className="w-full text-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-base rounded-lg shadow-sm transition-all duration-300"
                >
                  Sign Up / Register Today
                </button>
                <div className="mt-4 flex flex-col gap-1 items-center justify-center text-xs text-neutral-500 font-sans">
                  <p>Suite B8, AYM Shafa Petrol Station, Wuye, Abuja</p>
                  <p className="font-semibold text-emerald-600 mt-1">0802-895-5522</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
