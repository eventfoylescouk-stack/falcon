import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';

// Pages import
import { Home } from './pages/Home';
import { Programs } from './pages/Programs';
import { Booking } from './pages/Booking';
import { Payment } from './pages/Payment';
import { Gallery } from './pages/Gallery';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Auth } from './pages/Auth';

import { authService, UserProfile } from './lib/authService';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('std_2w_beginners');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authViewMode, setAuthViewMode] = useState<'signin' | 'signup'>('signin');

  // Route security guard: Require user registration/accounting before booking
  useEffect(() => {
    if (currentPage === 'signup' && !currentUser) {
      setAuthViewMode('signup');
      setCurrentPage('auth');
    }
  }, [currentPage, currentUser]);

  // Sync session and listen to real-time Supabase sign-in/verification callbacks
  useEffect(() => {
    // 1. Recover local storage session info
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // 2. Setup live Supabase Auth listener to capture confirmation link activations
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          console.log("[Supabase Redirect Detected]:", event, session.user.email);
          const syncedUser = await authService.syncSupabaseSession(session);
          if (syncedUser) {
            setCurrentUser(syncedUser);
            // Auto redirect directly to the enrollment scheduler once active
            setCurrentPage('signup');
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleLogout = () => {
    authService.signOut();
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // Dynamically update document titles and SEO meta helpers on tab shifts
  useEffect(() => {
    let titleStr = "Falcon Driving School | Abuja, Nigeria";
    let descStr = "Professional driving school based in Wuye, Abuja, offering automatic and manual lessons, simulation, and licensing support.";

    switch (currentPage) {
      case 'home':
        titleStr = "Falcon Driving School | Learn to Drive with Confidence Abuja";
        break;
      case 'programs':
        titleStr = "Programs & Prices | Falcon Driving School Abuja";
        descStr = "Affordable automatic and manual training programs in Abuja FCT. Check out standard beginners courses and licensing bundles.";
        break;
      case 'signup':
        titleStr = "Sign Up / Book Lesson slots | Falcon Driving School";
        descStr = "Secure your scheduling slots online at Falcon. Certified instructors, modern vehicle matching, Wuye Abuja FCT.";
        break;
      case 'auth':
        titleStr = "Authentication & Registration | Falcon Driving School";
        descStr = "Log in or sign up with compulsory verified email address before logging in for your driving school account.";
        break;
      case 'payment':
        titleStr = "Fee Payment Guidelines | Falcon Driving School Ltd";
        descStr = "Clear corporate bank codes for Moniepoint MFB tuition locks. Send receipt transfers easily on WhatsApp.";
        break;
      case 'gallery':
        titleStr = "Grad Gallery & Testimonials | Falcon Driving School";
        descStr = "View actual student driving landmarks, virtual cockpit practices and high-rating customer reviews in Abuja.";
        break;
      case 'about':
        titleStr = "About Our Certified Instructors | Falcon Driving School";
        descStr = "Meet Falcon's calm patient mentors, review dual-safety vehicle fleet specs, and explore simulator benefits.";
        break;
      case 'contact':
        titleStr = "Contact Us & Map Directions | Falcon Driving School";
        descStr = "Visit Suite B8 AYM Shafa Petrol Station, Wuye, Abuja. Phone: 0802-895-5522. View our Google maps.";
        break;
    }

    document.title = titleStr;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', descStr);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = "description";
      newMeta.content = descStr;
      document.head.appendChild(newMeta);
    }
  }, [currentPage]);

  const renderActivePage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'programs':
        return (
          <Programs 
            setCurrentPage={setCurrentPage} 
            setSelectedCourseId={setSelectedCourseId} 
          />
        );
      case 'signup':
        return (
          <Booking 
            setCurrentPage={setCurrentPage} 
            selectedCourseId={selectedCourseId} 
            setSelectedCourseId={setSelectedCourseId} 
            currentUser={currentUser}
          />
        );
      case 'auth':
        return (
          <Auth 
            setCurrentPage={setCurrentPage} 
            onLoginSuccess={(user) => setCurrentUser(user)} 
            initialView={authViewMode}
          />
        );
      case 'payment':
        return <Payment setCurrentPage={setCurrentPage} />;
      case 'gallery':
        return <Gallery />;
      case 'about':
        return <About setCurrentPage={setCurrentPage} />;
      case 'contact':
        return <Contact />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 selection:bg-emerald-500 selection:text-neutral-950 font-sans antialiased text-neutral-800">
      
      {/* Visual Header */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        currentUser={currentUser}
        onLogout={handleLogout}
        setAuthViewMode={setAuthViewMode}
      />

      {/* Main Render Block with Animated Pre-set slides */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            id="page-animation-wrapper"
          >
            {renderActivePage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent global widgets */}
      <WhatsAppButton />

      {/* Footer Navigation */}
      <Footer setCurrentPage={setCurrentPage} />

    </div>
  );
}

