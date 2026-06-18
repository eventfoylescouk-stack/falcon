import React, { useState } from 'react';
import { COURSES } from '../data';
import { Course } from '../types';
import { Check, ShieldCheck, HelpCircle, BadgeCheck, FileText, ArrowRight, Wallet, Award } from 'lucide-react';

interface ProgramsProps {
  setCurrentPage: (page: string) => void;
  setSelectedCourseId: (courseId: string) => void;
}

export function Programs({ setCurrentPage, setSelectedCourseId }: ProgramsProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'standard' | 'advanced'>('all');

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentPage('signup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredCourses = COURSES.filter(course => {
    if (activeCategory === 'all') return true;
    return course.category === activeCategory;
  });

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-neutral-50 py-16 lg:py-24 font-sans text-neutral-800" id="programs-page-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-mono text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-widest rounded-full px-4 py-1.5 font-bold inline-block">
            Investment Plans
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-neutral-900 uppercase">
            Programs & Pricing
          </h1>
          <p className="text-neutral-500 sm:text-lg">
            Invest in premium, lifetime safety habits. Choose a package below. We offer flexible schedule plans for both Manual and Automatic certifications in Abuja.
          </p>

          {/* Filter Toggles */}
          <div className="pt-6 flex justify-center">
            <div className="flex bg-neutral-100 p-1.5 rounded-xl border border-neutral-200 shadow-inner">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All Courses
              </button>
              <button
                onClick={() => setActiveCategory('standard')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === 'standard'
                    ? 'bg-white text-emerald-700 shadow-md border border-neutral-200'
                    : 'text-neutral-600 hover:text-emerald-900'
                }`}
              >
                Standard (1 - 2 Weeks)
              </button>
              <button
                onClick={() => setActiveCategory('advanced')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === 'advanced'
                    ? 'bg-white text-amber-700 shadow-md border border-neutral-200'
                    : 'text-neutral-600 hover:text-amber-900'
                }`}
              >
                Advanced (3 Weeks / VIP)
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Category Grouping Headers (if filtered by standard/advanced) */}
        {activeCategory === 'all' && (
          <div className="mt-8">
            {/* Standard Category Row */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-8 border-b border-neutral-200 pb-4">
                <div className="w-2.5 h-6 bg-emerald-500 rounded-xs"></div>
                <h2 className="font-display font-extrabold text-2xl tracking-tight text-neutral-900 uppercase">
                  Standard Training Programs
                </h2>
                <span className="text-xs text-neutral-500 ml-2 font-medium">(Designed for basic-to-moderate drivers)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {COURSES.filter(c => c.category === 'standard').map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onSelect={handleSelectCourse} 
                    formatPrice={formatCurrency}
                  />
                ))}
              </div>
            </div>

            {/* Advanced Category Row */}
            <div className="mt-16">
              <div className="flex items-center gap-2 mb-8 border-b border-neutral-200 pb-4">
                <div className="w-2.5 h-6 bg-amber-500 rounded-xs"></div>
                <h2 className="font-display font-extrabold text-2xl tracking-tight text-neutral-900 uppercase">
                  Advanced & Specialized Programs
                </h2>
                <span className="text-xs text-neutral-500 ml-2 font-medium">(Premium timing, doorstep support & VIP licensing)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {COURSES.filter(c => c.category === 'advanced').map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onSelect={handleSelectCourse} 
                    formatPrice={formatCurrency}
                    isAdvanced={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* If filtered specific view */}
        {activeCategory !== 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onSelect={handleSelectCourse} 
                formatPrice={formatCurrency}
                isAdvanced={course.category === 'advanced'}
              />
            ))}
          </div>
        )}

        {/* Special Notice Bar: Group Payments or License info */}
        <div className="mt-16 bg-neutral-900 text-white rounded-3xl p-8 lg:p-12 border border-neutral-800 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 text-left space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-neutral-800 border-neutral-700 px-3 py-1 rounded-full text-xs text-emerald-400 font-semibold uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> Official licensing standards
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl">Are you looking for a custom schedule or corporate team rates?</h3>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                We design specialized fleet/chauffeur defensive certifications for embassies, corporate offices in Central Business District, and hospitality businesses across Abuja. We also accommodate unique physical schedules outside standard hours.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end items-stretch">
              <a
                href="https://wa.me/2348028955522?text=Hello%20Falcon%2C%20I%20want%20to%20ask%20about%20custom%20corporate%20rates."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 font-bold text-center text-sm uppercase rounded-xl transition-all duration-200 cursor-pointer shadow-md"
              >
                Inquire on WhatsApp
              </a>
              <button
                onClick={() => handleSelectCourse('adv_executive')}
                className="px-6 py-3.5 bg-transparent border border-neutral-700 hover:border-white text-white font-semibold text-center text-sm rounded-xl transition-all duration-200 cursor-pointer"
              >
                Book VIP Package
              </button>
            </div>
          </div>
        </div>

        {/* Transparency/FAQs Module */}
        <div className="mt-20 border-t border-neutral-200 pt-16">
          <div className="max-w-3xl mx-auto space-y-8 text-left">
            <h3 className="font-display font-extrabold text-2xl text-neutral-900 uppercase text-center mb-8">
              Pricing Transparency & Benefits FAQ
            </h3>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs">
                <h4 className="font-bold text-base text-neutral-900">Are there any hidden charges?</h4>
                <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
                  No hidden fees whatsoever. Price structures for license-inclusive courses cover the official Learner's Permit, training fuel, physical exam clearance certificates, and the genuine 5-Year physical Driver's License printout directly.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs">
                <h4 className="font-bold text-base text-neutral-900">What is the difference between license-inclusive courses vs basic standard ones?</h4>
                <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
                  Traditional courses only issue a Falcon Graduation Certificate of Competency. If you register for a "License" included package, we manage your official filing, secure your Learner's Permit, and guide you directly for official biometric capturing and physical license issuance with the Federal Road Safety Corps (FRSC).
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs">
                <h4 className="font-bold text-base text-neutral-900">Do you offer instalment plans?</h4>
                <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
                  Yes! Beginners packages and Advanced programs can be split into flexible 60% setup deposit and 40% mid-training balances. Register and simply chat with our team on WhatsApp to activate customizable instalment slots.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Internal reusable card implementation
interface CardProps {
  key?: string;
  course: Course;
  onSelect: (id: string) => void;
  formatPrice: (val: number) => string;
  isAdvanced?: boolean;
}

function CourseCard({ course, onSelect, formatPrice, isAdvanced = false }: CardProps) {
  return (
    <div className={`bg-white rounded-3xl border transition-all duration-300 hover:shadow-2xl overflow-hidden flex flex-col justify-between text-left group ${
      isAdvanced 
        ? 'border-amber-100 hover:border-amber-300' 
        : 'border-emerald-100 hover:border-emerald-300'
    }`}>
      
      {/* Accent strip */}
      <div className={`h-2.5 ${isAdvanced ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        
        {/* Top Meta info */}
        <div>
          <div className="flex justify-between items-start gap-2 mb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-md">
              {course.duration}
            </span>
            {course.id.includes('license') && (
              <span className="text-[9px] font-sans font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-600 shrink-0" /> LICENSE INC.
              </span>
            )}
          </div>

          <h3 className="font-display font-extrabold text-lg text-neutral-900 leading-tight uppercase mb-2 group-hover:text-emerald-700 transition-colors">
            {course.name}
          </h3>
          
          <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed mb-6">
            {course.description}
          </p>

          <span className="text-neutral-350 select-none block text-xs font-mono uppercase tracking-widest text-[#cbd5e1] mb-3">
            Core Modules
          </span>
          {/* Key Program highlight chips */}
          <ul className="space-y-2 mb-6 text-xs text-neutral-600 md:text-[11px] lg:text-xs">
            {course.features.slice(0, 4).map((feature, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <span className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isAdvanced ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  <Check className="w-3 h-3 font-semibold" />
                </span>
                <span className="leading-5">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Tag & CTA Container */}
        <div className="pt-6 border-t border-neutral-100">
          <div className="flex flex-col mb-4">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest leading-none">Net Tuition</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`font-display font-black text-2xl tracking-tight ${isAdvanced ? 'text-amber-800' : 'text-neutral-900'}`}>
                {formatPrice(course.price)}
              </span>
              <span className="text-xs text-neutral-400 font-medium">/ complete</span>
            </div>
          </div>

          <button
            onClick={() => onSelect(course.id)}
            className={`w-full py-3 px-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
              isAdvanced 
                ? 'bg-amber-500 text-neutral-950 border-transparent hover:bg-amber-400 shadow-md shadow-amber-500/10' 
                : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-500 shadow-md shadow-emerald-500/10'
            }`}
          >
            Sign Up Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
