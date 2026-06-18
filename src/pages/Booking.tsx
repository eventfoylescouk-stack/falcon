import React, { useState, useEffect } from 'react';
import { COURSES } from '../data';
import { BookingSubmission } from '../types';
import { BookmarkCheck, Send, CheckCircle2, ExternalLink, CalendarDays, PhoneCall, HelpCircle, LoaderCircle } from 'lucide-react';

interface PaystackCallbackResponse {
  reference: string;
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: Record<string, unknown>;
  callback: (response: PaystackCallbackResponse) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackOptions) => {
        openIframe: () => void;
      };
    };
  }
}

interface BookingProps {
  setCurrentPage: (page: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (courseId: string) => void;
}

export function Booking({ setCurrentPage, selectedCourseId, setSelectedCourseId }: BookingProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [schedule, setSchedule] = useState('weekday-morning');
  const [notes, setNotes] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<BookingSubmission | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Auto-scroll to top when page loaded
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadPaystackScript = () => {
    if (window.PaystackPop) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById('paystack-inline-script') as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack script.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = 'paystack-inline-script';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script.'));
      document.body.appendChild(script);
    });
  };

  const getStoredBookings = () => {
    try {
      const parsedBookings = JSON.parse(localStorage.getItem('falcon_bookings') || '[]');
      return Array.isArray(parsedBookings) ? parsedBookings : [];
    } catch {
      return [];
    }
  };

  const generateFallbackEmail = (phoneNumber: string) => {
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return `student${phoneNumber.replace(/\D/g, '') || 'na'}_${uniqueSuffix}@falcondrivingschool.ng`;
  };

  const buildWhatsAppMessage = (data: BookingSubmission) => {
    const courseName = COURSES.find(c => c.id === data.courseId)?.name || "Premium Course";
    const scheduleName = getScheduleLabel(data.schedule);
    return `Hello Falcon Driving School! I just registered and paid online:\n\n*Name:* ${data.fullName}\n*Phone:* ${data.phone}\n*Email:* ${data.email || 'N/A'}\n*Course:* ${courseName}\n*Preferred Hours:* ${scheduleName}\n*Payment Reference:* ${data.paymentReference || 'N/A'}\n*Notes:* ${data.notes || 'None'}\n\nPlease help lock in my timetable slots!`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !selectedCourseId) {
      alert("Please fill in your Full Name, Phone Number, and select a Course.");
      return;
    }

    const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackPublicKey) {
      alert("Payment setup is incomplete. Please contact support.");
      return;
    }

    setIsProcessingPayment(true);

    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const safeEmail = email.trim() || generateFallbackEmail(phone);

    const booking: BookingSubmission = {
      fullName,
      phone,
      email: safeEmail,
      courseId: selectedCourseId,
      schedule,
      notes: notes.trim() || undefined
    };

    try {
      await loadPaystackScript();

      await new Promise<void>((resolve, reject) => {
        const paystackHandler = window.PaystackPop?.setup({
          key: paystackPublicKey,
          email: safeEmail,
          amount: Math.round(selectedCourse.price * 100),
          currency: 'NGN',
          ref: `falcon_${uniqueSuffix}`,
          metadata: {
            fullName,
            phone,
            courseId: selectedCourseId,
            schedule
          },
          callback: (response: PaystackCallbackResponse) => {
            const paidBooking: BookingSubmission = {
              ...booking,
              paymentReference: response.reference
            };
            const existing = getStoredBookings();
            existing.push(paidBooking);
            localStorage.setItem('falcon_bookings', JSON.stringify(existing));
            setSubmittedData(paidBooking);
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            resolve();
          },
          onClose: () => {
            reject(new Error('Payment was not completed.'));
          }
        });

        if (!paystackHandler) {
          reject(new Error('Unable to initialize Paystack.'));
          return;
        }

        paystackHandler.openIframe();
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
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

  const handleWhatsAppRedirect = () => {
    if (!submittedData) return;

    const textMessage = buildWhatsAppMessage(submittedData);
    const encoded = encodeURIComponent(textMessage);
    window.open(`https://wa.me/2348028955522?text=${encoded}`, '_blank');
  };

  const submitLabel = isProcessingPayment ? 'Processing Payment...' : 'Pay with Paystack & Complete Sign Up';
  const submitIcon = isProcessingPayment
    ? <LoaderCircle className="w-4 h-4 text-emerald-400 animate-spin" />
    : <Send className="w-4 h-4 text-emerald-400" />;

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
                      Email Address <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
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
                    disabled={isProcessingPayment}
                    className="w-full py-4 bg-neutral-900 border border-transparent hover:border-emerald-500 hover:bg-neutral-800 text-white font-sans font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    id="booking-form-submit-btn"
                  >
                    {submitLabel} {submitIcon}
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
          <div className="bg-white border border-neutral-100 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-center" id="registration-success-panel">
            
            {/* Animated Ring Checkmark */}
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 uppercase">
                Payment & Registration Successful!
              </h2>
              <p className="text-neutral-500 max-w-xl mx-auto text-sm">
                Thank you, <strong className="text-neutral-800">{submittedData?.fullName}</strong>! Your payment has been confirmed and your enrollment is now active.
              </p>
              {submittedData?.paymentReference && (
                <p className="text-xs text-neutral-500">
                  Transaction reference: <strong className="text-neutral-800">{submittedData.paymentReference}</strong>
                </p>
              )}
            </div>

            {/* Splitted Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left border-y border-neutral-100 py-8">
              
              {/* Left Column: Payment confirmation */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm text-neutral-900 uppercase flex items-center gap-1.5 bg-neutral-100 p-2 rounded-lg">
                  <BookmarkCheck className="w-4 h-4 text-red-500" /> 1. Payment Confirmed
                </h3>
                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/60 text-xs space-y-2 relative">
                  <div>
                    <span className="text-[10px] text-neutral-400 block tracking-wider">COURSE:</span>
                    <span className="font-bold text-neutral-800 text-sm">{selectedCourse.name}</span>
                  </div>
                  <div className="pt-1.5">
                    <span className="text-[10px] text-neutral-400 block tracking-wider">AMOUNT PAID:</span>
                    <span className="text-sm font-bold text-neutral-800 tracking-wider">
                      {selectedCourse.price.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="pt-1.5">
                    <span className="text-[10px] text-neutral-400 block tracking-wider">PAYSTACK REFERENCE:</span>
                    <div>
                      <span className="text-sm font-bold text-neutral-800 tracking-wider">{submittedData?.paymentReference || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal pl-1.5">
                  * Keep this reference for support and receipt confirmation.
                </p>
              </div>

              {/* Right Column: Instant WhatsApp receipts details */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm text-neutral-900 uppercase flex items-center gap-1.5 bg-emerald-50 text-emerald-800 p-2 rounded-lg">
                  <PhoneCall className="w-4 h-4 text-emerald-600" /> 2. WhatsApp Confirmation
                </h3>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Send your payment transfer receipt to our booking desk on WhatsApp at <strong className="text-emerald-700">0802-895-5522</strong>. Click below to automatically send your digital form details and let us lock in your timing slot.
                </p>

                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  id="whatsapp-success-redirect-btn"
                >
                  Confirm on WhatsApp Now <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Back home option */}
            <div className="pt-4 flex justify-between items-center text-xs font-sans">
              <button
                onClick={() => setCurrentPage('programs')}
                className="text-neutral-500 hover:text-neutral-800 font-semibold underline cursor-pointer"
              >
                ➔ View Programs Again
              </button>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFullName('');
                  setPhone('');
                  setEmail('');
                  setNotes('');
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
