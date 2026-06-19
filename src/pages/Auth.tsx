import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, HelpCircle, Mail, Phone, User, CheckCircle2, AlertCircle, ArrowRight, Key, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { authService, UserProfile } from '../lib/authService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthProps {
  setCurrentPage: (page: string) => void;
  onLoginSuccess?: (user: UserProfile) => void;
  initialView?: 'signin' | 'signup';
  pendingRegistration: { fullName: string; phone: string; email: string; password: string } | null;
  setPendingRegistration: React.Dispatch<React.SetStateAction<{ fullName: string; phone: string; email: string; password: string } | null>>;
}

export function Auth({ setCurrentPage, onLoginSuccess, initialView, pendingRegistration, setPendingRegistration }: AuthProps) {
  // Views: 'signin' | 'signup' | 'verify'
  const [view, setView] = useState<'signin' | 'signup' | 'verify'>('signin');
  
  // Set initial view state dynamically when requested
  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);
  
  // Registration & login fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verification fields
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);



  // Clear messages on view changes
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    // Keep password during verification transition so we can auto-login the user
    if (view !== 'verify') {
      setPassword('');
    }
  }, [view]);

  // Handle User Registration (Sign Up)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    const normalizedEmail = email.toLowerCase().trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim() || !phone.trim() || !normalizedEmail || !password) {
      setErrorMessage("Please complete all fields. Email and password are compulsory.");
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setErrorMessage("Please provide a valid email address, for example name@example.com.");
      return;
    }

    if (password.trim().length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      setPendingRegistration({ fullName: fullName.trim(), phone: phone.trim(), email: normalizedEmail, password });
      setSuccessMessage("Almost done! Complete your booking to open payment and activate your account.");
      setTimeout(() => {
        setCurrentPage('signup');
      }, 1200);
      return;
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle User Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your Email and Password.");
      return;
    }

    setIsLoading(true);
    try {
      const validation = await authService.validateCredentialsAcrossStores(email, password);
      if (!validation.localUser) {
        throw new Error('No matching local student profile exists for this email. Please complete sign up first.');
      }
      if (!validation.isValid) {
        throw new Error('Email/password was rejected by both Supabase Auth and the local users table.');
      }

      const user = await authService.signIn(email, password);
      
      // Login success
      setSuccessMessage("Authentication verified! Redirecting to dashboard...");
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 1500);

    } catch (err: any) {
      setErrorMessage(err.message || "Account authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Verification Form / Link Click
  const handleVerifySubmit = async (e?: React.FormEvent, codeToUse?: string) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const activeCode = codeToUse || verificationCode || simulatedCode || '123456';

    setIsLoading(true);
    try {
      const verified = await authService.confirmEmail(verificationEmail, activeCode);
      if (verified) {
        setSuccessMessage("Email authenticated successfully! Redirecting to select course and pay...");
        
        let loggedInUser = null;
        try {
          if (password) {
            loggedInUser = await authService.signIn(verificationEmail, password);
          }
        } catch (loginErr) {
          console.warn("Could not auto-login with credentials:", loginErr);
        }

        // Secondary fallback to fetch from logged in local status if password was absent
        if (!loggedInUser) {
          loggedInUser = authService.getCurrentUser();
        }

        if (loggedInUser && onLoginSuccess) {
          onLoginSuccess(loggedInUser);
        }

        setTimeout(() => {
          setCurrentPage('signup');
          setVerificationCode('');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate via link. Please retry or contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual code request resends
  const handleResendCode = () => {
    if (!verificationEmail) {
      setErrorMessage("No email specified for code dispatch.");
      return;
    }
    const code = authService.resendCode(verificationEmail);
    setSimulatedCode(code);
    setSuccessMessage(`A new confirmation code has been dispatched to ${verificationEmail}.`);
  };

  return (
    <div className="bg-neutral-50 py-16 lg:py-24 font-sans text-neutral-800 min-h-[85vh] flex items-center justify-center" id="auth-page-root">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">

        {/* Outer authentication card styling */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden p-8 sm:p-10 relative">
          
          {/* Header traffic light accent ornament */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-neutral-900 flex">
            <div className="w-1/3 bg-red-500"></div>
            <div className="w-1/3 bg-amber-500"></div>
            <div className="w-1/3 bg-emerald-500"></div>
          </div>

          <div className="text-center space-y-2 mb-8">
            <span className="font-mono text-[10px] tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase font-bold inline-block border border-emerald-100">
              Student Portal
            </span>
            <h1 className="font-display font-extrabold text-2xl uppercase tracking-tight text-neutral-900">
              {view === 'signin' && "Access Account"}
              {view === 'signup' && "Student Sign Up"}
              {view === 'verify' && "Confirm Email"}
            </h1>
            <p className="text-xs text-neutral-500">
              {view === 'signin' && "Log in with your verified driving academy profile"}
              {view === 'signup' && "Create a secure driving log under the Abuja license board"}
              {view === 'verify' && `Verify first-time access to authenticate ${verificationEmail}`}
            </p>
          </div>

          {/* Feedback messages */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100-percent flex items-start gap-3 text-left"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-red-700">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-left"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-emerald-800">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VIEW: SIGN IN */}
          {view === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-5" id="form-signin">
              <div className="space-y-1 text-left">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. smartdriver@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-sm bg-neutral-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showSignInPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-neutral-200 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-sm bg-neutral-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-750 transition-colors p-1"
                    title={showSignInPassword ? "Hide Password" : "Show Password"}
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Authenticating..." : "Verify Access & Sign In"} <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>

              <div className="pt-4 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-500">
                  New driving school student?{' '}
                  <button
                    type="button"
                    onClick={() => setView('signup')}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline focus:outline-hidden"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: SIGN UP */}
          {view === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4" id="form-signup">
              
              <div className="space-y-1 text-left">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">Full Legal Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Amina Yusuf"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-sm bg-neutral-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">Mobile Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0802 895 5522"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-sm bg-neutral-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. amina@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-sm bg-neutral-50/50"
                  />
                </div>
                <p className="text-[10px] text-neutral-400">Used for required offline or custom Supabase authentication verification.</p>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create security password (min. 6 characters)"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-neutral-200 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-sm bg-neutral-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-750 transition-colors p-1"
                    title={showSignUpPassword ? "Hide Password" : "Show Password"}
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Generating Account..." : "Create Account"} <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>

              <div className="pt-4 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-500">
                  Already registered with Falcon?{' '}
                  <button
                    type="button"
                    onClick={() => setView('signin')}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline focus:outline-hidden"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: EMAIL VERIFICATION CODE */}
          {view === 'verify' && (
            <div className="space-y-6 text-center" id="form-verify">
              
              <div className="flex justify-center pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                  <Mail className="w-6 h-6 text-emerald-600 absolute animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-neutral-900 font-sans tracking-tight">
                  Verify Your Account
                </h3>
                <p className="text-sm text-neutral-600">
                  We've sent a secure confirmation link to:
                </p>
                <div className="inline-block bg-neutral-100 border border-neutral-200 px-4 py-1.5 rounded-full text-neutral-800 text-xs font-mono font-bold select-all">
                  {verificationEmail}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-left text-xs text-emerald-800 leading-relaxed space-y-1.5">
                <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" /> Real-time Activation Active
                </p>
                <p>
                  Please check your inbox (including your spam/junk folder) and click the activation link. This page will update automatically once authenticated, granting you instant access to search, select, and book driving lesson slots.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="w-full py-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to edit Sign Up Form
                </button>
              </div>

              <div className="pt-2 text-center border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Link not arrived? Send link again
                </button>
              </div>

            </div>
          )}

        </div>



      </div>
    </div>
  );
}
