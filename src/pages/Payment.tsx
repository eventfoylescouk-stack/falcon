import React, { useState } from 'react';
import { Copy, ShieldCheck, CheckCircle, Smartphone, ExternalLink, MessageCircleCode, Wallet, Award } from 'lucide-react';

interface PaymentProps {
  setCurrentPage: (page: string) => void;
}

export function Payment({ setCurrentPage }: PaymentProps) {
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("8028955522");
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleWhatsAppReceipt = () => {
    window.open('https://wa.me/2348028955522?text=Hello%20Falcon%20Driving%20School!%20I%20have%20made%20a%20tuition%20payment%20transfer.%20Here%20is%20my%20receipt%20for%20confirmation.', '_blank');
  };

  return (
    <div className="bg-neutral-50 py-16 lg:py-24 font-sans text-neutral-800" id="payment-page-root">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header copy */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="font-mono text-xs text-amber-600 bg-amber-50 border border-amber-100 uppercase tracking-widest rounded-full px-4 py-1.5 font-bold inline-block">
            Tuition Locking
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-neutral-900 uppercase">
            Payment Guidelines
          </h1>
          <p className="text-neutral-500 text-sm">
            To lock in your preferred timetable and be matched with a calm, certified instructor in Wuye, complete your tuition transfer and forward your receipt.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-left">
          
          {/* Bank coordinates panel */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-neutral-150 p-6 sm:p-10 shadow-xl space-y-6">
            <h3 className="font-display font-extrabold text-lg text-neutral-900 uppercase flex items-center gap-2 pb-4 border-b border-neutral-100">
              <Wallet className="w-5 h-5 text-emerald-600" /> Authorized Bank Details
            </h3>

            <div className="bg-neutral-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl"></div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-neutral-500 block tracking-widest uppercase font-mono">Official Institution</span>
                  <span className="text-base font-semibold text-neutral-200">Moniepoint Microfinance Bank (MFB)</span>
                </div>
                
                <div className="pt-2 flex justify-between items-center group">
                  <div>
                    <span className="text-[10px] text-neutral-500 block tracking-widest uppercase font-mono">Account Number</span>
                    <span className="text-xl sm:text-2xl font-bold tracking-widest font-mono text-white">8028955522</span>
                  </div>
                  <button
                    onClick={handleCopyAccount}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border flex items-center gap-1.5 transition-all outline-hidden active:scale-95 ${
                      copiedAccount 
                        ? 'bg-emerald-500 text-neutral-950 border-transparent' 
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-350 border-neutral-700'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedAccount ? 'Copied' : 'Copy Code'}
                  </button>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-neutral-500 block tracking-widest uppercase font-mono">Beneficiary Name</span>
                  <span className="text-base font-bold text-emerald-400">Falcon Driving School Ltd</span>
                </div>
              </div>
            </div>

            {/* Instruction Checklist */}
            <div className="space-y-4 pt-2">
              <h4 className="font-display font-bold text-xs text-neutral-500 uppercase tracking-widest">
                Post-Transfer Instructions:
              </h4>
              
              <div className="space-y-3 text-xs text-neutral-600">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-800 shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="leading-5">
                    Execute a standard bank transfer of the complete tuition or a <strong>60% setup deposit</strong>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-800 shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="leading-5">
                    Take a clear screenshot of your bank receipt showing the transaction reference, amount, and date.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-800 shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="leading-5">
                    Click the <strong>"Send Receipt on WhatsApp"</strong> button to lodge the receipt with 0802-895-5522.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-800 shrink-0 mt-0.5">
                    4
                  </div>
                  <p className="leading-5">
                    Our coordinator will audit, verify, assign your certified tutor, and activate your scheduling log immediately.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Prompt action Sidebar */}
          <div className="md:col-span-5 space-y-6">
            
            {/* CTA action card */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-display font-black text-neutral-900 text-base uppercase leading-tight">Instant Verification Desk</h4>
              <p className="text-neutral-600 text-xs leading-relaxed">
                Send your transaction screenshot to <strong>0802-895-5522</strong> on WhatsApp. Our Abuja coordinator answers within a few minutes to authorize your practical schedule calendar.
              </p>
              
              <button
                onClick={handleWhatsAppReceipt}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                id="payment-whatsapp-submit-btn"
              >
                Send Receipt WhatsApp <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* School Trust Banner */}
            <div className="bg-white rounded-3xl border border-neutral-150 p-6 space-y-4 text-xs font-medium text-neutral-600">
              <h5 className="font-display font-extrabold text-neutral-950 uppercase tracking-widest text-[10px] block">Falcon Tuition Protections</h5>
              
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Secure Moniepoint Gateway:</strong> Transactions are safe, logged, and audited under licensed Nigerian financial regulations.
                </p>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Flexible Refund Options:</strong> Need to reschedule or pause files? Deposits remain fully valid for up to 6 months.
                </p>
              </div>

              <div className="flex gap-3">
                <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Corporate Invoicing:</strong> We issue authorized, tax-compliant PDF physical receipt invoices upon payment audit.
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentPage('signup')}
                className="text-neutral-500 hover:text-neutral-900 text-xs font-bold underline cursor-pointer"
              >
                ➔ Didn't fill the sign-up form yet? Fill it here
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
