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

import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('std_2w_beginners');

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
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

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

