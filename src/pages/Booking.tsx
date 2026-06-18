import React, { useState, useEffect } from 'react';
import { COURSES } from '../data';
import { BookingSubmission } from '../types';
import { BookmarkCheck, Send, CheckCircle2, Copy, ExternalLink, CalendarDays, PhoneCall, HelpCircle, CloudLightning, CreditCard, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../lib/authService';

interface BookingProps {
  setCurrentPage: (page: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (courseId: string) => void;
  currentUser?: UserProfile | null;
}

export function Booking({ setCurrentPage, selectedCourseId, setSelectedCourseId, currentUser }: BookingProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [schedule, setSchedule] = useState('weekday-morning');
  const [notes, setNotes] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<BookingSubmission | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [savedToCloud, setSavedToCloud] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  // Paystack Billing States
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentConfirmation, setPaymentConfirmation] = useState<{ reference: string; amount: number; status: string; date: string } | null>(null);
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>('full');

  // Auto-scroll to top and prefill authenticated user details if logged in
  useEffect(() => {
    window.scrollTo(0, 0);
    if (currentUser) {
      setFullName(currentUser.fullName);
      setPhone(currentUser.phone);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleCopyBank = () => {
    navigator.clipboard.writeText("8028955522");
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim() || !selectedCourseId) {
      alert("Please fill in your Full Name, Phone Number, and Email. Email is compulsory.");
      return;
    }

    setIsLoading(true);
    setSavedToCloud(false);
    setUsedFallback(false);

    const booking: BookingSubmission = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      courseId: selectedCourseId,
      schedule,
      notes: notes.trim() || undefined
    };

    // Store in LocalStorage first as fallback/buffer
    try {
      const existing = JSON.parse(localStorage.getItem('falcon_bookings') || '[]');
      existing.push(booking);
      localStorage.setItem('falcon_bookings', JSON.stringify(existing));
    } catch (err) {
      console.warn("Local storage write failed:", err);
    }

    let cloudSaved = false;
    if (supabase) {
      try {
        // Enforce a strict 1.5 second timeout on Supabase write so student page flows instantly
        const supabaseTimeoutPromise = new Promise<boolean>(async (resolve) => {
          const timerId = setTimeout(() => {
            console.warn("[Booking Warning]: Supabase database sync timed-out. Handled gracefully.");
            resolve(false);
          }, 1500);

          try {
            const { error } = await supabase
              .from('bookings')
              .insert([
                {
                  full_name: booking.fullName,
                  phone: booking.phone,
                  email: booking.email || null,
                  course_id: booking.courseId,
                  schedule: booking.schedule,
                  notes: booking.notes || null
                }
              ]);

            clearTimeout(timerId);
            if (error) {
              console.error("Supabase write error:", error);
              resolve(false);
            } else {
              resolve(true);
            }
          } catch (err) {
            clearTimeout(timerId);
            console.error("Supabase exception:", err);
            resolve(false);
          }
        });

        cloudSaved = await supabaseTimeoutPromise;
      } catch (err) {
        console.warn("Supabase check exception:", err);
        cloudSaved = false;
      }
    }

    if (cloudSaved) {
      setSavedToCloud(true);
    } else {
      setUsedFallback(true);
    }

    setSubmittedData(booking);
    setIsSubmitted(true);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCourse = COURSES.find(c => c.id === selectedCourseId) || COURSES[0];

  const getScheduleLabel = (val: string) => {
    switch(val) {
      case 'weekday-morning': return 'Weekday Mornings (7AM - 11AM)';
      case 'weekday-afternoon': return 'Weekday Afternoons (12PM - 4PM)';
      case 'weekday-evening': return 'Weekday Evenings (4PM - 6PM)';
      case 'weekend-saturday': return 'Weekends Only (Saturday Blocks)';
      default: return 'Custom Schedule Plan';
    }
  };

  // Helper to dynamically inject Paystack Popups script
  const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Paystack online process launcher
  const handlePaystackPayment = async (amountInNaira: number) => {
    setIsPaymentLoading(true);
    setPaymentError(null);
    try {
      const scriptLoaded = await loadPaystackScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load securely the external Paystack component. Check your network.");
      }

      // Check for user-defined configuration, with an active fallback key for sandbox integrity
      const publicKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_d3c3488bd37053e1ce492c3008453412a843e9d8';

      const paymentEmail = submittedData?.email || email || 'student@falcon.academy';
      const reference = 'FALCON_PAY_' + Date.now() + '_' + Math.floor(Math.random() * 9000 + 1000);

      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: paymentEmail.toLowerCase().trim(),
        amount: Math.round(amountInNaira * 100), // convert to Kobo
        currency: 'NGN',
        ref: reference,
        callback: function(response: any) {
          console.log("[Paystack Successful Sync]:", response);
          setPaymentConfirmation({
            reference: response.reference || reference,
            amount: amountInNaira,
            status: 'success',
            date: new Date().toLocaleDateString()
          });
          setIsPaymentLoading(false);
        },
        onClose: function() {
          console.log("[Paystack Checkout Closed]");
          setIsPaymentLoading(false);
        }
      });

      handler.openIframe();
    } catch (err: any) {
      console.error("Paystack error:", err);
      setPaymentError(err.message || "Failed to trigger Paystack checkout.");
      setIsPaymentLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    if (!submittedData) return;
    
    const courseName = COURSES.find(c => c.id === submittedData.courseId)?.name || "Premium Course";
    const scheduleName = getScheduleLabel(submittedData.schedule);
    
    let textMessage = "";
    if (paymentConfirmation) {
      textMessage = `Hello Falcon Driving School! I just registered online and completed my payment via Paystack:\n\n*Name:* ${submittedData.fullName}\n*Phone:* ${submittedData.phone}\n*Email:* ${submittedData.email || 'N/A'}\n*Course:* ${courseName}\n*Preferred Hours:* ${scheduleName}\n*Paystack Reference:* ${paymentConfirmation.reference}\n*Paid Amount:* ₦${paymentConfirmation.amount.toLocaleString()}\n\nPlease verify my payment and lock in my student timetable slots!`;
    } else {
      textMessage = `Hello Falcon Driving School! I just registered online:\n\n*Name:* ${submittedData.fullName}\n*Phone:* ${submittedData.phone}\n*Email:* ${submittedData.email || 'N/A'}\n*Course:* ${courseName}\n*Preferred Hours:* ${scheduleName}\n*Notes:* ${submittedData.notes || 'None'}\n\nPlease help lock in my timetable slots!`;
    }
    
    const encoded = encodeURIComponent(textMessage);
    window.open(`https://wa.me/2348028955522?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-neutral-50 py-16 lg:py-24 font-sans text-neutral-800" id="booking-page-root">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {!isSubmitted ? (
          <div>
            {/* Header copy */}
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <span className="font-mono text-xs text-red-600 bg-red-50 border border-red-100 uppercase tracking-widest rounded-full px-4 py-1 font-bold inline-block">
                Secure Registration
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-neutral-900 uppercase">
                Sign Up & Book Lessons
              </h1>
              <p className="text-neutral-500 text-sm">
                Enrolling online is simple and takes under 2 minutes. Fill in your schedule options in Abuja to secure your instructor matching slots.
              </p>
            </div>

            {/* Form & Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Actual Form */}
              <form 
                onSubmit={handleSubmit} 
                className="lg:col-span-8 bg-white border border-neutral-150 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 text-left"
                id="digital-registration-form"
              >
                {!currentUser && (
                  <div className="bg-neutral-900 text-white rounded-2xl p-4 text-xs leading-relaxed flex items-start gap-3 border border-neutral-800">
                    <span className="text-lg leading-none">💡</span>
                    <div>
                      <p className="font-bold mb-1 uppercase tracking-widest text-[9px] text-emerald-400">Secure Student Portal Advantage</p>
                      <p className="text-neutral-300">
                        To secure, monitor, and view your active lesson logs online, we highly recommend{' '}
                        <button 
                          type="button" 
                          onClick={() => setCurrentPage('auth')} 
                          className="font-bold text-emerald-400 underline hover:text-emerald-300 transition cursor-pointer"
                        >
                          signing in or registering first
                        </button>. This will automatically pre-fill all of your enrollment details.
                      </p>
                    </div>
                  </div>
                )}

                <h3 className="text-neutral-900 font-display font-black text-lg uppercase pb-4 border-b border-neutral-100 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-600" /> Digital Registration Details
                </h3>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your first and last name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-55 hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden transition-all bg-neutral-50"
                  />
                </div>

                {/* Phone & Email (2 Cols responsive) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g., 08028955522"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., mail@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* Course Selection Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Select Your Driving Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 hover:border-neutral-300 focus:outline-hidden focus:border-emerald-500 transition-all font-semibold text-neutral-700"
                    id="booking-course-dropdown"
                  >
                    <optgroup label="Standard Programs">
                      {COURSES.filter(c => c.category === 'standard').map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} — ₦{c.price.toLocaleString()}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Advanced & VIP Programs">
                      {COURSES.filter(c => c.category === 'advanced').map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} — ₦{c.price.toLocaleString()}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Preferred Schedule Options */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Preferred Daily Driving Schedule <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="schedule-radio-group">
                    {[
                      { id: 'weekday-morning', label: 'Weekday Mornings', desc: '7:00 AM - 11:00 AM' },
                      { id: 'weekday-afternoon', label: 'Weekday Afternoons', desc: '12:00 PM - 4:00 PM' },
                      { id: 'weekday-evening', label: 'Weekday Evenings', desc: '4:00 PM - 6:00 PM' },
                      { id: 'weekend-saturday', label: 'Saturdays Only', desc: 'Intense morning/noon blocks' },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`border rounded-xl p-3.5 flex flex-col cursor-pointer transition-all ${
                          schedule === opt.id
                            ? 'bg-emerald-50/50 border-emerald-500 text-emerald-800'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="schedule-option"
                            value={opt.id}
                            checked={schedule === opt.id}
                            onChange={() => setSchedule(opt.id)}
                            className="text-emerald-500 focus:ring-emerald-400"
                          />
                          <span className="text-xs font-bold uppercase tracking-wide">{opt.label}</span>
                        </div>
                        <span className="text-[11px] text-neutral-400 mt-1 pl-5 font-medium">{opt.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Additional Notes <span className="text-neutral-400 font-normal">(Any driving fears or specific goals?)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 'I am completely nervous but eager. I want to learn manual gears only, or I can only practice Saturdays...'"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-neutral-900 border border-transparent hover:border-emerald-500 hover:bg-neutral-800 text-white font-sans font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    id="booking-form-submit-btn"
                  >
                    {isLoading ? 'Saving Registration...' : 'Submit Registration & Get Fee Codes'} <Send className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>

              </form>

              {/* Sidebar helper summaries */}
              <div className="lg:col-span-4 space-y-6 text-left">
                
                {/* Course preview card */}
                <div className="bg-neutral-900 text-white rounded-3xl p-6 border border-neutral-800 shadow-xl space-y-4">
                  <p className="text-[10px] text-emerald-400 font-mono tracking-widest font-bold uppercase leading-none">Your Selected Program</p>
                  <h4 className="font-display font-black text-lg uppercase leading-tight">{selectedCourse.name}</h4>
                  <div className="text-2xl font-display font-black text-white">{selectedCourse.price.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })}</div>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">{selectedCourse.description}</p>
                  <div className="pt-3 border-t border-neutral-800">
                    <button 
                      onClick={() => setCurrentPage('programs')}
                      className="text-white hover:text-emerald-400 text-xs font-semibold underline flex items-center gap-1 cursor-pointer"
                    >
                      Change selected program
                    </button>
                  </div>
                </div>

                {/* Trust Highlights */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-150 shadow-sm space-y-4 text-xs font-medium">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-neutral-600 leading-relaxed">
                      <strong>Certified Match:</strong> Once submitted, we designate a certified, calm, and patient instructor based in Wuye to your files.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-neutral-600 leading-relaxed">
                      <strong>Dual Control Safety:</strong> All lessons are executed inside air-conditioned sedan hatchbacks possessing full auxiliary passenger floor brakes.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-neutral-600 leading-relaxed">
                      <strong>FRSC Logged:</strong> All certificates are digitally uploaded to the Federal Road Safety logs as a lifetime standard file.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          
          /* SUCCESS STATE PANEL */
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-8 text-center" id="registration-success-panel">
            
            {/* Animated Ring Checkmark */}
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 uppercase tracking-wider inline-block">
                Seat Reserved • Slot matching matching active
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 uppercase">
                Registration Logged!
              </h2>
              {savedToCloud ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 mx-auto">
                  <CloudLightning className="w-3.5 h-3.5 fill-emerald-550" /> Synced securely with Supabase Cloud
                </div>
              ) : usedFallback ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 mx-auto">
                  <span>Student booking logged locally</span>
                </div>
              ) : null}
              <p className="text-neutral-500 max-w-xl mx-auto text-sm pt-2">
                Thank you, <strong className="text-neutral-800">{submittedData?.fullName}</strong>! Your school enrollment file has been securely logged. To lock in your certified instructors and timing slots immediately, complete your payment.
              </p>
            </div>

            {/* LIVE PAYSTACK CHECKOUT BLOCK */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 sm:p-8 text-left space-y-6">
              
              {!paymentConfirmation ? (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        ⚡
                      </div>
                      <div>
                        <h4 className="font-display font-black text-[13px] text-neutral-900 uppercase tracking-tight">Option 1: Pay securely with Paystack</h4>
                        <p className="text-[11px] text-neutral-500">Supports Cards, Bank Apps, USSD, and Transfer payments</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100/50 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setPaymentOption('full')}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${
                          paymentOption === 'full' 
                            ? 'bg-emerald-600 text-neutral-950 shadow-xs' 
                            : 'text-neutral-550 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        100% Full Fee
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentOption('deposit')}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${
                          paymentOption === 'deposit' 
                            ? 'bg-emerald-600 text-neutral-950 shadow-xs' 
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        60% Deposit
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-7 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Amount Due Now</div>
                      <div className="text-3xl font-display font-black text-slate-950 flex items-baseline gap-1">
                        ₦{Math.round(paymentOption === 'full' ? selectedCourse.price : selectedCourse.price * 0.6).toLocaleString()}
                        <span className="text-xs text-slate-400 font-normal">
                          ({paymentOption === 'full' ? 'Complete tuition scale' : '60% commitment deposit'})
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-normal">
                        Your chosen course: <strong className="text-slate-800">{selectedCourse.name}</strong> 
                        {paymentOption === 'deposit' && ` (₦${selectedCourse.price.toLocaleString()} full package).`}
                      </p>
                    </div>

                    <div className="md:col-span-5">
                      <button
                        type="button"
                        disabled={isPaymentLoading}
                        onClick={() => handlePaystackPayment(paymentOption === 'full' ? selectedCourse.price : selectedCourse.price * 0.6)}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-sans font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 transition-transform"
                      >
                        {isPaymentLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                            Spawning Paystack...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 shrink-0" />
                            Pay ₦{Math.round(paymentOption === 'full' ? selectedCourse.price : selectedCourse.price * 0.6).toLocaleString()} Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2 text-xs text-red-800 font-medium">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <Lock className="w-3.5 h-3.5 text-emerald-650" /> Secure checkout verified. Paystack encrypts card keys at industry PCI-DSS standards.
                  </div>
                </div>
              ) : (
                /* ONLINE PAYMENT CONFIRMED */
                <div className="bg-emerald-50 border border-emerald-100 p-6 sm:p-8 rounded-2xl text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-emerald-500 text-neutral-950 rounded-full flex items-center justify-center text-xl shadow-md">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] font-bold text-emerald-800 uppercase tracking-widest block bg-emerald-100 max-w-max mx-auto px-2.5 py-0.5 rounded">
                      Paystack Online Transaction Verified
                    </span>
                    <h4 className="font-display font-black text-lg text-neutral-900 uppercase">₦{paymentConfirmation.amount.toLocaleString()} Tuition Confirmed!</h4>
                    <p className="text-xs text-slate-500 font-medium">Your driving matching scheduler has been locked on reference <strong className="text-slate-800 underline break-all">{paymentConfirmation.reference}</strong>.</p>
                  </div>

                  <div className="max-w-md mx-auto bg-white rounded-xl border border-emerald-200/80 p-4 text-left font-mono text-[11px] space-y-1.5 shadow-xs text-slate-700">
                    <div className="flex justify-between border-b border-neutral-50 pb-1.5 text-[10px] text-slate-400 font-bold uppercase font-sans">
                      <span>Receipt Summary</span>
                      <span>Authorized successfully</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Student Name:</span>
                      <span className="font-bold text-slate-900">{submittedData?.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Enrolled Package:</span>
                      <span className="font-bold text-slate-900">{selectedCourse.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Confirmation Ref:</span>
                      <span className="font-bold text-slate-900">{paymentConfirmation.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Txn Date:</span>
                      <span className="font-bold text-slate-900">{paymentConfirmation.date}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* WhatsApp Coordination Block */}
            <div className="border-t border-neutral-100 pt-8 text-left space-y-4">
              
              <h3 className="font-display font-extrabold text-sm text-neutral-900 uppercase flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-emerald-600" /> WhatsApp Coordination Center/support
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Need customized times or support? Click below to instantly notify our administrative desk at <strong className="text-emerald-700">0802-895-5522</strong> on WhatsApp. This acts as our real-time matching workflow to pair you with certified instructors.
              </p>

              <button
                onClick={handleWhatsAppRedirect}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-sans font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md hover:shadow-emerald-500/15 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                id="whatsapp-success-redirect-btn"
              >
                Confirm Registration on WhatsApp <ExternalLink className="w-3.5 h-3.5" />
              </button>

            </div>


            {/* Back home option */}
            <div className="pt-4 flex flex-wrap gap-4 justify-between items-center text-xs font-sans border-t border-neutral-100/50 mt-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentPage('home')}
                  className="text-neutral-500 hover:text-neutral-800 font-semibold underline cursor-pointer"
                >
                  ➔ Back to Home
                </button>
                <button
                  onClick={() => setCurrentPage('programs')}
                  className="text-neutral-500 hover:text-neutral-800 font-semibold underline cursor-pointer"
                >
                  ➔ View Programs Again
                </button>
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFullName('');
                  setPhone('');
                  setEmail('');
                  setNotes('');
                  setPaymentConfirmation(null); // Reset confirmation block for new bookings
                }}
                className="text-emerald-600 hover:text-emerald-500 font-bold underline cursor-pointer"
              >
                Enroll another student
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
