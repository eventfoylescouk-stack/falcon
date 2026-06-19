import React from 'react';
import { ShieldCheck, HeartPulse, UserCheck, CheckCircle2, Award, Clock, Compass } from 'lucide-react';
import { SIMULATOR_IMAGE_URL, HERO_IMAGE_URL, STUDENT_SUCCESS_IMAGE_URL } from '../data';

interface AboutProps {
  setCurrentPage: (page: string) => void;
}

export function About({ setCurrentPage }: AboutProps) {
  return (
    <div className="font-sans text-neutral-800" id="about-page-root">
      
      {/* Page header */}
      <section className="bg-neutral-950 text-white py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-4">
          <span className="font-mono text-xs text-emerald-400 border border-emerald-500/30 rounded-full px-4 py-1.5 uppercase tracking-widest font-bold inline-block">
            Our Core Mission
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight">
            About Falcon Driving School
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Nurturing safe, legally certified, and fully independent drivers in Abuja via patient instruction, high-quality modern vehicles, and advanced software simulation.
          </p>
        </div>
      </section>

      {/* Narrative grid with custom photos */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
            
            {/* Left side text story */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs text-red-500 font-bold uppercase tracking-widest font-mono">Patience & Excellence</span>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-neutral-900 leading-tight">
                  WHO WE ARE & WHAT WE BELIEVE
                </h2>
              </div>
              
              <p className="text-neutral-600 text-sm leading-relaxed">
                Founded in the heart of Wuye, Abuja, Falcon Driving School was designed from the ground up to solve a major problem: <strong>high student driving anxiety</strong>. We understood that dumping nervous beginners into live, fast-paced roundabouts and expressways with aggressive drivers led to frustration and unsafe habits.
              </p>

              <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 italic text-neutral-500 text-sm bg-neutral-50 rounded-r-xl pr-4">
                "Our guiding motto is simple: safe driving isn't just a technical skill; it is a lifetime habit. We coach with infinite patience so you become a master of defensive driving."
              </blockquote>

              <p className="text-neutral-600 text-sm leading-relaxed">
                Every file registered at Falcon is treated with top-tier logistical focus. We integrate directly with authorized licensing bureaus to ensure our training content matches the official standards from the Federal Road Safety Corps (FRSC) and VIO. Whether you are operating manual gear shifts, mastering parking, or seeking standard executive service, our academy stands completely ready to guide you.
              </p>

              {/* Core attributes cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex gap-3">
                  <HeartPulse className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 uppercase">Infinite Patience</h4>
                    <p className="text-neutral-500 text-xs mt-1 leading-normal">Our guides never shout or rush. Perfect for nervous beginners, women, and seniors.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex gap-3">
                  <UserCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 uppercase">FRSC Certified</h4>
                    <p className="text-neutral-500 text-xs mt-1 leading-normal">Instructors undergo comprehensive safety tests and maintain premium training clearance.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right side custom generated visual element */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-full h-full border border-neutral-200 rounded-3xl -z-10"></div>
                <div className="absolute -bottom-3 -right-3 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl -z-10 animate-pulse"></div>
                
                <div className="rounded-3xl border border-neutral-200 bg-white p-2.5 shadow-2xl relative overflow-hidden group">
                  <img
                    src={STUDENT_SUCCESS_IMAGE_URL}
                    alt="Happy student proudly holding licensing diploma at Falcon Driving School Abuja"
                    className="w-full aspect-[4/3] object-cover rounded-2xl group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    id="about-student-graduation-pic"
                  />
                  {/* Small badge */}
                  <div className="absolute top-5 right-5 bg-neutral-900/95 text-white text-[10px] font-bold py-1 px-3 rounded-md uppercase tracking-wide shadow-md">
                    Wuye HQ Abuja
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Detailed Pillars & Methodologies */}
      <section className="py-20 bg-neutral-50 text-left border-y border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100/50 rounded-full px-3 py-1 font-mono">Our Secret Sauce</span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 uppercase mt-2">Falcon Training Standard</h3>
            <p className="text-neutral-500 text-sm">Four essential pillars of modern driving education designed to make your lessons simple, successful, and stress-free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-display font-bold text-lg text-neutral-900 uppercase">Virtual Cockpit Practice</h4>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Before putting you onto live roads, our students logging simulator packages acquire absolute gear shifting and steering muscles safely on immersive visual software screens.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-display font-bold text-lg text-neutral-900 uppercase">Dual-Controls Dual-Safety</h4>
              <p className="text-neutral-500 text-xs leading-relaxed">
                All training vehicles possess certified secondary passenger brake pedals. The tutor retains instant vehicle halt support, keeping lessons completely safe.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 bg-red-50 text-red-700 rounded-xl flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-display font-bold text-lg text-neutral-900 uppercase">FRSC Licensing Sync</h4>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Skip the confusing government biometric queues and testing paperwork. We align with physical test coordinators to facilitate your driver logs smoothly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Promoted Section */}
      <section className="py-16 bg-neutral-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase">Ready to learn driving in Wuye FCT?</h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto leading-relaxed">
            Fill your digital booking options now. Our certified calm instructors will help you master control with pristine road confidence.
          </p>
          <div>
            <button
              onClick={() => {
                setCurrentPage('signup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-sans font-bold uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10"
            >
              Sign Up For Driving Classes
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
