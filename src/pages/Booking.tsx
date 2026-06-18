import React, { useState, useEffect } from 'react';
import { COURSES } from '../data';
import { BookingSubmission } from '../types';
import { BookmarkCheck, Send, CheckCircle2, Copy, ExternalLink, CalendarDays, PhoneCall, HelpCircle, CloudLightning } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  const [copiedText, setCopiedText] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [savedToCloud, setSavedToCloud] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  // Auto-scroll to top when page loaded
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopyBank = () => {
    navigator.clipboard.writeText("8028955522");
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !selectedCourseId) {
      alert("Please fill in your Full Name, Phone Number, and select a Course.");
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
        
        if (error) {
          console.error("Supabase insert error:", error);
          setUsedFallback(true);
        } else {
          cloudSaved = true;
          setSavedToCloud(true);
        }
      } catch (err) {
        console.error("Supabase connection failed:", err);
        setUsedFallback(true);
      }
    } else {
      // Supabase is not configured yet
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

  const handleWhatsAppRedirect = () => {
    if (!submittedData) return;
    
    const courseName = COURSES.find(c => c.id === submittedData.courseId)?.name || "Premium Course";
    const scheduleName = getScheduleLabel(submittedData.schedule);
    const textMessage = `Hello Falcon Driving School! I just registered online:\n\n*Name:* ${submittedData.fullName}\n*Phone:* ${submittedData.phone}\n*Email:* ${submittedData.email || 'N/A'}\n*Course:* ${courseName}\n*Preferred Hours:* ${scheduleName}\n*Notes:* ${submittedData.notes || 'None'}\n\nPlease help lock in my timetable slots!`;
    
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
          <div className="bg-white border border-neutral-100 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-center" id="registration-success-panel">
            
            {/* Animated Ring Checkmark */}
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 uppercase">
                Registration Successful!
              </h2>
              {savedToCloud ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 mx-auto">
                  <CloudLightning className="w-3.5 h-3.5 fill-emerald-550" /> Synced securely with Supabase Cloud
                </div>
              ) : usedFallback ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 border border-amber-100 text-amber-700 mx-auto">
                  <span>Saved locally • offline mode</span>
                </div>
              ) : null}
              <p className="text-neutral-500 max-w-xl mx-auto text-sm pt-2">
                Thank you, <strong className="text-neutral-800">{submittedData?.fullName}</strong>! Your school enrollment has been logged locally in Abuja. To guarantee and lock in your daily driving times immediately, follow the guidelines below:
              </p>
            </div>

            {/* Splitted Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left border-y border-neutral-100 py-8">
              
              {/* Left Column: Bank Code instructions */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm text-neutral-900 uppercase flex items-center gap-1.5 bg-neutral-100 p-2 rounded-lg">
                  <BookmarkCheck className="w-4 h-4 text-red-500" /> 1. Make Tuition Transfer
                </h3>
                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/60 font-mono text-xs space-y-2 relative">
                  <div>
                    <span className="text-[10px] text-neutral-400 block tracking-wider font-sans">BANK:</span>
                    <span className="font-sans font-bold text-neutral-800 text-sm">Moniepoint MFB</span>
                  </div>
                  <div className="pt-1.5 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-neutral-400 block tracking-wider font-sans">ACCOUNT NUMBER:</span>
                      <span className="text-sm font-bold text-neutral-800 tracking-wider">8028955522</span>
                    </div>
                    <button
                      onClick={handleCopyBank}
                      className="text-xs font-semibold px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg cursor-pointer text-neutral-600 flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      {copiedText ? 'Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                  <div className="pt-1.5">
                    <span className="text-[10px] text-neutral-400 block tracking-wider font-sans">ACCOUNT NAME:</span>
                    <span className="font-sans font-bold text-neutral-800 text-sm">Falcon Driving School Ltd</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal pl-1.5">
                  * Tuition deposits lock in instant vehicle matching and specific day hours. You can pay fully or drop a flexible 60% deposit.
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
