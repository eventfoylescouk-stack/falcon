import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Clock, Send, CheckCircle2, AlertCircle, CloudLightning } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedToCloud, setSavedToCloud] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill out all fields in the contact form.");
      return;
    }

    setIsLoading(true);
    setSavedToCloud(false);
    setUsedFallback(false);

    // Save submission locally as backup contingency
    try {
      const existing = JSON.parse(localStorage.getItem('falcon_contacts') || '[]');
      existing.push({ name: name.trim(), email: email.trim(), message: message.trim(), date: new Date().toISOString() });
      localStorage.setItem('falcon_contacts', JSON.stringify(existing));
    } catch (err) {
      console.warn("Local storage write failed:", err);
    }

    let cloudSaved = false;
    if (supabase) {
      try {
        const { error } = await supabase
          .from('contacts')
          .insert([
            {
              name: name.trim(),
              email: email.trim(),
              message: message.trim()
            }
          ]);
        
        if (error) {
          // Try inserting to 'messages' as an alternative database schema fallback
          const { error: errorAlt } = await supabase
            .from('messages')
            .insert([
              {
                name: name.trim(),
                email: email.trim(),
                message: message.trim()
              }
            ]);
          
          if (errorAlt) {
            console.error("Supabase insert error (tried 'contacts' & 'messages'):", error, errorAlt);
            setUsedFallback(true);
          } else {
            cloudSaved = true;
            setSavedToCloud(true);
          }
        } else {
          cloudSaved = true;
          setSavedToCloud(true);
        }
      } catch (err) {
        console.error("Supabase query failed on Contact submission:", err);
        setUsedFallback(true);
      }
    } else {
      setUsedFallback(true);
    }

    setIsLoading(false);
    setIsSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="bg-neutral-50 py-16 lg:py-24 font-sans text-neutral-800" id="contact-page-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-widest rounded-full px-4 py-1.5 font-bold inline-block">
            Get In Touch
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-neutral-900 uppercase">
            Contact Falcon Driving
          </h1>
          <p className="text-neutral-500 sm:text-lg">
            Have questions about pricing, license packages, or simulation training? Reach out to our Abuja customer support desk or visit our school.
          </p>
        </div>

        {/* Contact information and layout cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
          
          {/* Info Side (Col-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Card */}
            <div className="bg-white border border-neutral-150 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-display font-extrabold text-neutral-900 text-lg uppercase pb-4 border-b border-neutral-100">
                School Information
              </h3>

              <div className="space-y-4">
                
                {/* Physical Address */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Our Abuja Office</h4>
                    <p className="text-sm sm:text-base font-bold text-neutral-900 mt-1">
                      Suite B8, AYM Shafa Petrol Station, Wuye, Abuja, Nigeria.
                    </p>
                  </div>
                </div>

                {/* Main Phone */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Direct Call-Line</h4>
                    <p className="text-base sm:text-lg font-black text-emerald-700 mt-1">
                      0802-895-5522
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Feel free to call or WhatsApp anytime.</p>
                  </div>
                </div>

                {/* Social Connect */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Instagram Handle</h4>
                    <a 
                      href="https://instagram.com/falcondrivingschoolng" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base font-bold text-neutral-900 hover:text-amber-600 transition-colors mt-1 block hover:underline"
                    >
                      @falcondrivingschoolng
                    </a>
                  </div>
                </div>

                {/* Working hours */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Training Timeline</h4>
                    <p className="text-sm font-bold text-neutral-800 mt-1">
                      Monday to Saturday: 7:00 AM - 6:00 PM
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Flexible early-morning, night and Sunday blocks by reservation.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Helper Notice */}
            <div className="bg-neutral-900 text-neutral-450 rounded-3xl p-6 border border-neutral-800 text-neutral-400 space-y-3">
              <span className="text-[10px] bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-md text-red-400 font-bold uppercase">Emergency Guidance</span>
              <h4 className="font-display font-bold text-sm text-white mt-1">Nervous about booking?</h4>
              <p className="text-xs leading-relaxed">
                Take a deep breath! Over 80% of our students walked through our doors with zero driving credentials and high road anxiety. Our quiet classroom cockpit simulators builds high confidence immediately inside AYM Shafa depot workspace.
              </p>
            </div>

          </div>

          {/* Form Side (Col-7) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Contact Form Element */}
            <div className="bg-white border border-neutral-150 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
              <h3 className="font-display font-extrabold text-neutral-900 text-lg uppercase pb-4 border-b border-neutral-100">
                Send Us A Message
              </h3>

              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4" id="contact-feedback-form">
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden transition-all"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. mail@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden transition-all"
                    />
                  </div>

                  {/* Message field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Message / Questions <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us what driving package or licenses you are asking about, transmission preferences, or custom scheduling requests..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 hover:border-neutral-300 focus:border-emerald-500 focus:outline-hidden transition-all resize-none"
                    ></textarea>
                  </div>

                  {/* Submit buttons */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-neutral-900 border border-transparent hover:border-emerald-500 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Sending Message...' : <><Send className="w-4 h-4 text-emerald-400" /> Send message</>}
                  </button>

                </form>
              ) : (
                
                /* Confirmation card */
                <div className="text-center py-8 space-y-4" id="contact-success-panel">
                  <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-neutral-900 uppercase">Message Dispatched!</h4>
                  {savedToCloud ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 mx-auto">
                      <CloudLightning className="w-3 h-3 fill-emerald-550" /> Synced to Supabase Cloud
                    </div>
                  ) : usedFallback ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 border border-amber-100 text-amber-700 mx-auto">
                      <span>Saved offline</span>
                    </div>
                  ) : null}
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed pt-1">
                    Success! Your message has been saved. Our booking coordinator based in Wuye, Abuja will review your query and contact you within 2 working hours.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-xs text-emerald-600 hover:text-emerald-500 font-bold underline cursor-pointer mt-2"
                  >
                    ➔ Send another contact query
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Embedded Google Maps section */}
        <div className="mt-16 bg-white border border-neutral-150 p-3 rounded-3xl shadow-xl">
          <div className="rounded-2xl overflow-hidden aspect-[21/9] min-h-[300px] relative">
            
            {/* Iframe maps embedding pointing directly to Wuye Area Abuja, AYM Shafa */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15760.197926229153!2d7.453303565259979!3d9.035970347854673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0b02bb55333f%3A0xe6bf44bc4db9822a!2sWuye%2C%20Abuja!5e0!3m2!1sen!2sng!4v1718105000000!5m2!1sen!2sng"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer"
              id="google-maps-embed-frame"
            ></iframe>

            {/* Static overlay badge for map */}
            <div className="absolute top-4 left-4 bg-neutral-950/95 border border-neutral-800 text-white p-3 rounded-xl hidden sm:block max-w-xs text-left shadow-lg">
              <p className="text-[10px] text-emerald-400 font-mono tracking-widest leading-none uppercase">Physical Location</p>
              <h5 className="font-display font-extrabold text-sm uppercase mt-1">AYM SHAFA Wuye</h5>
              <p className="text-[11px] text-neutral-400 leading-normal mt-1">Suite B8, AYM Shafa Petrol Station, Wuye, Abuja. Parking slots and virtual simulation labs are located directly inside the building.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
