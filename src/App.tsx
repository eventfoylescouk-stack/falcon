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
import { Dashboard } from './pages/Dashboard';

import { authService, UserProfile } from './lib/authService';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('std_2w_beginners');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<{ fullName: string; phone: string; email: string; password: string } | null>(null);
  const [authViewMode, setAuthViewMode] = useState<'signin' | 'signup'>('signin');
  const [paymentCallbackState, setPaymentCallbackState] = useState<{ status: 'loading' | 'error'; message: string } | null>(null);

  // Route security guard: Require user registration/accounting before booking or dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasCallback = params.get('payment_status');
    if (hasCallback) return; // Yield to payment verification process first

    if (currentPage === 'signup' && !currentUser && !pendingRegistration) {
      setAuthViewMode('signup');
      setCurrentPage('auth');
      return;
    }

    if (currentPage === 'dashboard' && !currentUser) {
      setAuthViewMode('signin');
      setCurrentPage('auth');
      return;
    }

    if (currentPage === 'auth' && currentUser && authViewMode === 'signin') {
      setCurrentPage('dashboard');
    }
  }, [authViewMode, currentPage, currentUser]);

  // Synchronously search for callback tokens from backend verified redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment_status');
    const reference = params.get('reference');

    if (status) {
      console.log(`[App] Intercepted payment callback. status=${status}, ref=${reference}`);
      setPaymentCallbackState({ status: 'loading', message: 'Verifying your Paystack payment and opening your dashboard...' });

      if (!reference || status === 'failed' || status === 'error') {
        const reason = params.get('reason');
        setPaymentCallbackState({
          status: 'error',
          message: reason || 'Payment was not completed successfully. Please try again or contact support.'
        });
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      const verifyPaymentAndSync = async () => {
        try {
          // Call backend status verification API to ensure authenticity
          const apiRes = await fetch(`/api/payment/verify-status?reference=${encodeURIComponent(reference)}`);
          if (!apiRes.ok) throw new Error("Verification response not ok");
          const resJson = await apiRes.json();

          if (resJson.status && resJson.verified && resJson.booking) {
            console.log("[App] Payment fully authenticated with backend!", resJson.booking);
            
            // Reconstruct booking object in exactly the structure expected by Dashboard.tsx
            const verifiedBooking = {
              fullName: resJson.booking.fullName,
              phone: resJson.booking.phone,
              email: resJson.booking.email,
              courseId: resJson.booking.courseId,
              schedule: resJson.booking.schedule,
              notes: resJson.booking.notes,
              reference: resJson.booking.reference,
              amount: resJson.booking.amount
            };

            const payInfo = {
              reference: resJson.booking.reference,
              amount: resJson.booking.amount,
              date: new Date(resJson.booking.createdAt).toLocaleDateString()
            };

            // Synchronize LocalStorage so dashboard resolves perfectly
            localStorage.setItem('falcon_last_booking_success', JSON.stringify(verifiedBooking));
            localStorage.setItem('falcon_last_payment_success', JSON.stringify(payInfo));

            // Clean up the URL search parameters to make the current URL clean again
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);

            // Fetch the user session or mock profile matching this email if logged out
            const allUsers = JSON.parse(localStorage.getItem('falcon_auth_users') || '[]');
            const pendingCheckout = JSON.parse(localStorage.getItem('falcon_pending_paid_signup') || 'null');
            const pendingProfile = pendingCheckout?.pendingRegistration;
            const bookingEmail = resJson.booking.email.toLowerCase();
            const matchedUser = allUsers.find((u: any) => u.email.toLowerCase() === bookingEmail);
            const dashboardUser = matchedUser || {
              id: 'usr_' + Date.now(),
              fullName: pendingProfile?.fullName || resJson.booking.fullName,
              phone: pendingProfile?.phone || resJson.booking.phone,
              email: pendingProfile?.email || resJson.booking.email,
              isVerified: true,
              createdAt: new Date().toISOString()
            };

            if (!matchedUser) {
              allUsers.push(dashboardUser);
              localStorage.setItem('falcon_auth_users', JSON.stringify(allUsers));
            }

            localStorage.setItem('falcon_auth_session', JSON.stringify(dashboardUser));
            localStorage.removeItem('falcon_pending_paid_signup');
            setCurrentUser(dashboardUser);

            setPaymentCallbackState(null);

            // Redirect smoothly to the dashboard!
            setCurrentPage('dashboard');
          } else {
            console.warn("[App] Could not verify reference against backend records:", resJson);
            setPaymentCallbackState({
              status: 'error',
              message: resJson.message || 'Payment could not be verified yet. Please retry from your booking page or contact support with your payment reference.'
            });
          }
        } catch (e) {
          console.error("Failed verification sync:", e);
          setPaymentCallbackState({
            status: 'error',
            message: 'We could not verify your payment because of a network or server error. Please retry or contact support with your payment reference.'
          });
        }
      };

      verifyPaymentAndSync();
    }
  }, []);

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
            // Auto redirect directly to the dashboard once active
            setCurrentPage('dashboard');
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
            pendingRegistration={pendingRegistration}
            setPendingRegistration={setPendingRegistration}
            onLoginSuccess={(user) => setCurrentUser(user)}
          />
        );
      case 'auth':
        return (
          <Auth 
            setCurrentPage={setCurrentPage} 
            onLoginSuccess={(user) => setCurrentUser(user)} 
            initialView={authViewMode}
            pendingRegistration={pendingRegistration}
            setPendingRegistration={setPendingRegistration}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            currentUser={currentUser} 
            setCurrentPage={setCurrentPage} 
            onLogout={handleLogout}
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

  if (paymentCallbackState) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 font-sans text-neutral-800">
        <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200 shadow-xl p-8 text-center space-y-5">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl ${paymentCallbackState.status === 'loading' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {paymentCallbackState.status === 'loading' ? '⏳' : '⚠️'}
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-black text-xl uppercase tracking-tight text-neutral-900">
              {paymentCallbackState.status === 'loading' ? 'Confirming Payment' : 'Payment Needs Attention'}
            </h1>
            <p className="text-sm text-neutral-500">{paymentCallbackState.message}</p>
          </div>
          {paymentCallbackState.status === 'error' && (
            <div className="grid gap-3">
              <button
                onClick={() => { setPaymentCallbackState(null); setCurrentPage('signup'); }}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition"
              >
                Return to Booking
              </button>
              <a
                href="https://wa.me/2348028955522?text=Hello%20Falcon%20Driving%20School%2C%20I%20need%20help%20confirming%20my%20Paystack%20payment."
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl transition block"
              >
                Contact Support
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'dashboard') {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 selection:bg-emerald-500 selection:text-neutral-950 font-sans antialiased text-neutral-800">
        <main className="flex-grow">
          {renderActivePage()}
        </main>
        <WhatsAppButton />
      </div>
    );
  }

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

