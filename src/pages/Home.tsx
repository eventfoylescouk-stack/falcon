import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  BookmarkCheck, 
  Compass, 
  CalendarClock, 
  ChevronRight, 
  Award, 
  Laptop, 
  Users, 
  Car 
} from 'lucide-react';
import { HERO_IMAGE_URL, SIMULATOR_IMAGE_URL, STUDENT_SUCCESS_IMAGE_URL } from '../data';
import { FAQSection } from '../components/FAQSection';

interface HomeProps {
  setCurrentPage: (page: string) => void;
}

export function Home({ setCurrentPage }: HomeProps) {
  
  const handleNav = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="font-sans text-neutral-800" id="home-page-root">
      
      {/* 1. Hero Section */}
      <section className="relative bg-neutral-900 text-white py-16 lg:py-28 overflow-hidden">
        {/* Subtle decorative background blur shapes */}
        <div className="absolute top-0 left-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-12 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Text Copy */}
            <div className="lg:col-span-7 space-y-6 lg:pr-4 text-left">
              {/* Traffic Light Mini Flag */}
              <div className="inline-flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-full py-1.5 px-4 text-xs font-semibold uppercase tracking-wider text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                </span>
                <span className="text-amber-400">Get Started Today</span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight select-none">
                Learn to Drive with <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400 font-extrabold">
                  Absolute Confidence
                </span>
              </h1>
              
              <p className="text-neutral-300 text-base sm:text-lg lg:text-xl font-light leading-relaxed max-w-2xl">
                Master Wuye's busy roundabouts and Abuja expressway lanes under patient guidance. Professional FRSC-certified instructors, dual-control cars, and advanced virtual simulation await you.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => handleNav('signup')}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl transition-all shadow-xl hover:shadow-emerald-500/15 duration-300 flex items-center justify-center gap-2 cursor-pointer text-base uppercase tracking-wider hover:translate-y-[-2px]"
                  id="hero-primary-cta"
                >
                  Book Your Lessons <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleNav('programs')}
                  className="px-8 py-4 bg-transparent border-2 border-neutral-700 hover:border-white text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-base"
                >
                  Explore Course Pricing
                </button>
              </div>

              {/* Trusted Indicators */}
              <div className="pt-6 sm:pt-10 grid grid-cols-3 gap-4 border-t border-neutral-800 max-w-lg">
                <div>
                  <h4 className="font-display font-black text-2xl lg:text-3xl text-emerald-400 leading-none">1,800+</h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-sans tracking-wide uppercase mt-1">Licensed Grads</p>
                </div>
                <div>
                  <h4 className="font-display font-black text-2xl lg:text-3xl text-amber-400 leading-none">100%</h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-sans tracking-wide uppercase mt-1">FRSC Compliant</p>
                </div>
                <div>
                  <h4 className="font-display font-black text-2xl lg:text-3xl text-red-400 leading-none">0%</h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-sans tracking-wide uppercase mt-1">Anxiety Level</p>
                </div>
              </div>

            </div>

            {/* Generated Image Banner with custom visual container framing */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                {/* Traffic-light styled graphic framing offsets */}
                <div className="absolute -top-3 -left-3 w-full h-full border-2 border-dashed border-neutral-800 rounded-3xl -z-10"></div>
                <div className="absolute -bottom-3 -right-3 w-64 h-64 bg-emerald-600/10 rounded-full blur-2xl -z-10"></div>
                
                <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-2.5 shadow-2xl relative overflow-hidden group">
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Falcon Driving School road prep Abuja student lesson"
                    className="w-full aspect-[4/3] object-cover rounded-2xl group-hover:scale-102 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    id="hero-banner-image"
                  />
                  {/* Overlay badge */}
                  <div className="absolute bottom-5 left-5 bg-neutral-950/90 backdrop-blur-md rounded-xl p-3 border border-neutral-800 shadow-lg text-left">
                    <p className="text-xs text-neutral-400 font-medium font-sans">Now Registering:</p>
                    <p className="text-sm text-emerald-400 font-bold font-sans">Abuja Classes Commencing July</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Highlight 3 Core Services Section */}
      <section className="py-20 lg:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-sans font-bold text-xs tracking-widest text-emerald-600 uppercase bg-emerald-50 py-1.5 px-4 rounded-full">
              Academy Offerings
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-none pt-2">
              Our Professional Services
            </h2>
            <p className="text-neutral-500 sm:text-lg">
              Structured courses custom tailoured to match your schedule, comfort, and ultimate legal safety guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Service 1 */}
            <div className="bg-neutral-50 border border-neutral-100 hover:border-emerald-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center justify-center mb-6">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-xl text-neutral-900 mb-3 uppercase tracking-wide">
                  Automatic & Manual
                </h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  We maintain a pristine, dual-controlled fleet covering smooth Automatic and technical Manual transmissions. Perfect your steering controls, clutch safety, and gearbox selection from day one.
                </p>
              </div>
              <button 
                onClick={() => handleNav('programs')} 
                className="mt-6 text-xs text-emerald-600 hover:text-emerald-500 font-bold flex items-center gap-1 cursor-pointer"
              >
                Inquire Rates <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 2 */}
            <div className="bg-neutral-50 border border-neutral-100 hover:border-amber-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-amber-100 text-amber-700 font-bold rounded-xl flex items-center justify-center mb-6">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-xl text-neutral-900 mb-3 uppercase tracking-wide">
                  Flexible Lesson Times
                </h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  Whether you are a busy office worker, banker, student, or homemaker, schedule your private drive slots early mornings, late evenings, or flexible weekends.
                </p>
              </div>
              <button 
                onClick={() => handleNav('signup')} 
                className="mt-6 text-xs text-amber-600 hover:text-amber-500 font-bold flex items-center gap-1 cursor-pointer"
              >
                Pick Your Slot <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 3 */}
            <div className="bg-neutral-50 border border-neutral-100 hover:border-red-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-red-100 text-red-700 font-bold rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-xl text-neutral-900 mb-3 uppercase tracking-wide">
                  Licensing Program
                </h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  Complete official integration. We manage your documentation directly with the Federal Road Safety Corps (FRSC) and VIO theory assessments to issue genuine 5-Year national licenses smoothly.
                </p>
              </div>
              <button 
                onClick={() => handleNav('programs')} 
                className="mt-6 text-xs text-red-600 hover:text-red-500 font-bold flex items-center gap-1 cursor-pointer"
              >
                Licensing Information <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. "Why Choose Us" detailed illustration and details */}
      <section className="py-20 lg:py-24 bg-neutral-950 text-white relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image: Highlighting Simulator Training */}
            <div className="lg:col-span-5 text-left order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -top-3 -right-3 w-full h-full border border-emerald-500/20 rounded-2xl -z-10"></div>
                
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-2 shadow-2xl overflow-hidden group">
                  <img
                    src={SIMULATOR_IMAGE_URL}
                    alt="Virtual simulator training system at Falcon Driving School Abuja"
                    className="w-full aspect-[4/3] object-cover rounded-xl group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    id="why-choose-simulator-pic"
                  />
                  <div className="p-4">
                    <h4 className="font-display font-semibold text-sm text-emerald-400">Virtual Simulator Training System</h4>
                    <p className="text-xs text-neutral-400 mt-1">Nervous beginners practice steering, clutching, shifting gears safely before driving live.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Bullet List */}
            <div className="lg:col-span-7 text-left space-y-6 order-1 lg:order-2">
              <span className="font-mono text-xs text-amber-500 uppercase tracking-widest border border-amber-500/30 rounded-full px-3.5 py-1">
                Why Choose Falcon?
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
                Empowering Nervous Beginners with Modern Technology
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base">
                We don't just dump you behind a steering wheel in live Abuja road traffic. We build muscle memory, safety consciousness, and confidence progressively.
              </p>

              <div className="space-y-4 pt-4">
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Patience & Certification Combined</h4>
                    <p className="text-neutral-400 text-sm mt-0.5">
                      Our certified, professional driving mentors are trained systematically to manage high-anxiety learners politely and with unmatched patience.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Virtual Simulator Training Environment</h4>
                    <p className="text-neutral-400 text-sm mt-0.5">
                      Zero stress. Acquire your standard clutch control, gear rhythm, and mirror reflexes before getting into real Wuye road lanes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Fully Customizable Scheduling</h4>
                    <p className="text-neutral-400 text-sm mt-0.5">
                      Need weekend sessions or twilight driving practice? Choose convenient morning, noon, evening, or corporate executive blocks.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Pristine Dual-Control Vehicle Fleet</h4>
                    <p className="text-neutral-400 text-sm mt-0.5">
                      Learn in fully air-conditioned, clean, and comprehensively insured automatic or manual models configured with emergency passenger floor brakes.
                    </p>
                  </div>
                </div>

              </div>

              <div className="pt-4">
                <button
                  onClick={() => handleNav('about')}
                  className="inline-flex items-center gap-2 hover:text-emerald-400 text-white font-bold text-sm uppercase tracking-wider cursor-pointer group"
                >
                  Read More About Our Mission <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transform transition-transform" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. "How It Works" step-by-step timeline section */}
      <section className="py-20 lg:py-24 bg-neutral-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-sans font-bold text-xs tracking-widest text-emerald-600 uppercase bg-emerald-50 py-1.5 px-4 rounded-full">
              Process Timeline
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-none pt-2">
              How It Works
            </h2>
            <p className="text-neutral-500 sm:text-lg">
              Four easy, transparent steps to becoming a completely confident, certified individual on Nigerian roads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative text-left">
              <div className="absolute -top-5 left-6 w-10 h-10 bg-red-500 text-white font-display font-black rounded-lg flex items-center justify-center shadow-lg">
                01
              </div>
              <h3 className="font-display font-bold text-lg text-neutral-900 uppercase mt-4 mb-2">
                Register / Sign Up
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Fill our simple digital enrollment form to select your preferred course and indicate your ideal scheduling times (weekly/weekends).
              </p>
              <button 
                onClick={() => handleNav('signup')}
                className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
              >
                Enroll Digital <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative text-left">
              <div className="absolute -top-5 left-6 w-10 h-10 bg-amber-500 text-white font-display font-black rounded-lg flex items-center justify-center shadow-lg">
                02
              </div>
              <h3 className="font-display font-bold text-lg text-neutral-900 uppercase mt-4 mb-2">
                Choose a Course
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Select between Standard 2-Week Beginners basic, Advanced, Refresher, home tutoring, or licensing bundled programs to match your budget perfectly.
              </p>
              <button 
                onClick={() => handleNav('programs')}
                className="mt-4 text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
              >
                Compare Programs <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative text-left">
              <div className="absolute -top-5 left-6 w-10 h-10 bg-emerald-500 text-white font-display font-black rounded-lg flex items-center justify-center shadow-lg">
                03
              </div>
              <h3 className="font-display font-bold text-lg text-neutral-900 uppercase mt-4 mb-2">
                Schedule Lessons
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Confirm your payments easily and log in to coordinate with your patient tutor. Choose convenient morning or evening slots for practical blocks.
              </p>
              <button 
                onClick={() => handleNav('payment')}
                className="mt-4 text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
              >
                Inquire Payments <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative text-left">
              <div className="absolute -top-5 left-6 w-10 h-10 bg-neutral-900 text-white font-display font-black rounded-lg flex items-center justify-center shadow-lg">
                04
              </div>
              <h3 className="font-display font-bold text-lg text-neutral-900 uppercase mt-4 mb-2">
                Get Licensed!
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Nail your final road clearance assessment. We support your test paperwork processing directly until you hold your physical 5-Year national Driver's License.
              </p>
              <button 
                onClick={() => handleNav('gallery')}
                className="mt-4 text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
              >
                See Grad Gallery <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive FAQ Accordion Section */}
      <FAQSection />

      {/* 5. Quick Promotional banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-neutral-900 to-amber-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-950/20 backdrop-brightness-90"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">Ready to Gain Road Independence?</h2>
          <p className="text-neutral-200 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Stop avoiding driving or relying on expensive taxis. Master Abuja roadways confidently and claim your genuine 5-year Driver's License.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => handleNav('signup')}
              className="px-8 py-3.5 bg-white hover:bg-neutral-100 text-neutral-950 font-bold uppercase tracking-wider text-sm rounded-lg transition-transform hover:-translate-y-0.5 duration-200 flex items-center gap-2 cursor-pointer shadow-md"
            >
              Sign Up For A Course Now
            </button>
            <a
              href="https://wa.me/2348028955522"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold uppercase tracking-wider text-sm rounded-lg transition-transform hover:-translate-y-0.5 duration-200 flex items-center gap-2 cursor-pointer shadow-md"
            >
              Chat Instant Booking Support
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
