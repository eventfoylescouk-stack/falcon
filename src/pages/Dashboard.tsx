import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  CalendarDays, 
  CheckCircle2, 
  BookOpen, 
  PhoneCall, 
  ChevronRight, 
  Award, 
  Clock, 
  ShieldCheck, 
  User, 
  CreditCard,
  FileText,
  Activity,
  LogOut,
  Car
} from 'lucide-react';
import { UserProfile } from '../lib/authService';

interface DashboardProps {
  currentUser: UserProfile | null;
  setCurrentPage: (page: string) => void;
  onLogout?: () => void;
}

export function Dashboard({ currentUser, setCurrentPage, onLogout }: DashboardProps) {
  // Mock status tracking variables that simulate user course milestones
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'exam'>('overview');
  const [practiceScore, setPracticeScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  // FRSC Mock exam question sample
  const mockQuiz = [
    {
      id: 1,
      question: "What is the meaning of a yellow/amber traffic light indicator?",
      options: [
        "Accelerate quickly to defeat the red signal",
        "Stop only if it is completely safe to do so before the intersection stop line",
        "Go forward regardless of the surrounding cars",
        "Continuous honking to signify your presence"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "On a standard Nigerian highway, the inner/fastest lane is intended for:",
      options: [
        "Heavy cargo trucks transporting materials",
        "Overtaking slower-moving motorcars and cruisers",
        "Emergency parking and leisure phone calls",
        "Reversing if you missed your highway off-ramp"
      ],
      correct: 1
    },
    {
      id: 3,
      question: "What does an inverted red-and-white triangle road sign represent?",
      options: [
        "Speed limit 100km/h",
        "One-way road entry block",
        "Yield / Give Way to oncoming mainline drivers",
        "Heavy construction zone warning"
      ],
      correct: 2
    }
  ];

  // Retrieve cached booking from local storage to show actual booked parameters
  const getCachedBooking = () => {
    try {
      const bookedData = localStorage.getItem('falcon_last_booking_success');
      if (bookedData) {
        return JSON.parse(bookedData);
      }
    } catch (e) {
      console.warn("Unable to read cached booking on dashboard:", e);
    }
    return null;
  };

  const booking = getCachedBooking();

  const handleQuizSubmit = () => {
    let score = 0;
    mockQuiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        score += 1;
      }
    });
    setPracticeScore(score);
    setShowResults(true);
  };

  const getPercentageScore = (score: number) => {
    return Math.round((score / mockQuiz.length) * 100);
  };

  // Safe fallback if not logged in
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-neutral-200 rounded-3xl text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
          ⚠️
        </div>
        <div>
          <h2 className="font-display font-black text-xl uppercase tracking-tight text-neutral-900">Workspace Locked</h2>
          <p className="text-sm text-neutral-500 mt-2">
            You must be signed in with an authorized Falcon driving school profile to view your learner dashboard.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('auth')}
          className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-sans font-bold text-sm rounded-xl transition duration-300"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* PRIVATE PORTAL TOP NAVIGATION HEADER */}
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center font-display font-black text-white text-sm select-none shadow-xs">
              F
            </div>
            <div>
              <span className="font-display font-extrabold text-xs text-neutral-900 uppercase tracking-widest block">Falcon Driving Academy</span>
              <span className="text-[9px] text-emerald-700 font-mono font-bold uppercase tracking-wider block">Student Coordination System</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('home')}
            className="text-xs font-bold text-neutral-500 hover:text-neutral-905 hover:text-neutral-905 transition duration-205 flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 shadow-2xs"
          >
            ➔ Visit Main Website
          </button>
        </div>

        {/* HEADER HERO AREA */}
        <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative border border-neutral-800">
          {/* Decorative subtle visual pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-mono tracking-widest font-extrabold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Pupil Portal Active
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
                Welcome back, <span className="text-emerald-400">{currentUser.fullName}</span>!
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm font-medium">
                Abuja FCT Seat Logged • Registered as client <strong className="text-neutral-200">#{currentUser.id.substring(4, 9).toUpperCase()}</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentPage('signup')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
              >
                Book Lessons
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2.5 bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-750 font-sans font-medium text-xs rounded-xl transition duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* METRICS & OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white border border-neutral-150/60 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 font-extrabold block">Tuition Status</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-display font-black text-neutral-900 uppercase">₦Tuition Logged</div>
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" /> Verified via Paystack checkout
              </p>
            </div>
          </div>

          <div className="bg-white border border-neutral-150/60 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 font-extrabold block">Matching Rank</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-display font-black text-neutral-900 uppercase">Dual-Controlled Vehicle</div>
              <p className="text-[11px] text-neutral-500 font-medium mt-1">
                Ready for certified mapping
              </p>
            </div>
          </div>

          <div className="bg-white border border-neutral-150/60 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 font-extrabold block">Completed Lessons</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-display font-black text-neutral-900 uppercase">0 / 10 Hours</div>
              <p className="text-[11px] text-neutral-500 font-medium mt-1">
                Practicals mapped offline
              </p>
            </div>
          </div>

          <div className="bg-white border border-neutral-150/60 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 font-extrabold block">FRSC Exam readiness</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-display font-black text-neutral-900 uppercase">
                {practiceScore !== null ? `${getPercentageScore(practiceScore)}%` : 'No test yet'}
              </div>
              <p className="text-[11px] text-neutral-550 text-neutral-500 font-medium mt-0.5">
                {practiceScore !== null ? 'Theory mock test taken' : 'Simulate safety guidelines below'}
              </p>
            </div>
          </div>

        </div>

        {/* WORKSPACE SECTIONS: ACTIVE BOOKING & STUDY WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: ACTIVE CLASS RESERVATIONS (8-COLS) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SUB PREVIEW SELECTOR */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3.5 px-4 font-sans font-bold text-xs uppercase tracking-wider transition border-b-2 -mb-px cursor-pointer ${
                  activeTab === 'overview' 
                    ? 'border-emerald-600 text-emerald-700' 
                    : 'border-transparent text-neutral-450 text-neutral-500 hover:text-neutral-800'
                }`}
              >
                📅 Class Scheduler & Log
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`pb-3.5 px-4 font-sans font-bold text-xs uppercase tracking-wider transition border-b-2 -mb-px cursor-pointer ${
                  activeTab === 'curriculum' 
                    ? 'border-emerald-600 text-emerald-700' 
                    : 'border-transparent text-neutral-450 text-neutral-500 hover:text-neutral-800'
                }`}
              >
                📖 FRSC certified Syllabus
              </button>
              <button
                onClick={() => setActiveTab('exam')}
                className={`pb-3.5 px-4 font-sans font-bold text-xs uppercase tracking-wider transition border-b-2 -mb-px cursor-pointer ${
                  activeTab === 'exam' 
                    ? 'border-emerald-600 text-emerald-700' 
                    : 'border-transparent text-neutral-450 text-neutral-500 hover:text-neutral-800'
                }`}
              >
                ⚡ Practice Mock Theory Test
              </button>
            </div>

            {/* TAB CONTENT: SCHEDULER & LOG */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* ACTIVE BOOKED RECORD PANEL */}
                {booking ? (
                  <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-emerald-50">
                      <div>
                        <span className="font-mono text-[9px] font-extrabold bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md px-2.5 py-1 uppercase tracking-wider">
                          Reserved & Activated Slot
                        </span>
                        <h3 className="font-display font-black text-lg text-neutral-900 uppercase mt-1.5">
                          Schedule Reference: #{booking.courseId?.replace('std_', '').toUpperCase() || 'FALCON'}
                        </h3>
                      </div>
                      <span className="text-[11px] text-emerald-800 bg-emerald-50 rounded-full px-3 py-1 font-bold flex items-center gap-1 shrink-0 border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matching Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold block">Pupil Contact</span>
                          <span className="font-bold text-neutral-800">{booking.fullName}</span>
                          <span className="block text-xs font-mono text-neutral-500 mt-0.5">{booking.phone} {booking.email && `| ${booking.email}`}</span>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold block">Selected Program Package</span>
                          <span className="font-extrabold text-neutral-800">Standard Certified Learner Curriculum</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold block">Instruction Hours Mapped</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <CalendarDays className="w-4 h-4 text-emerald-600 shrink-0" />
                            <strong className="text-neutral-800 font-bold">
                              {booking.schedule === 'mon_wed_10' && "Mondays & Wednesdays (10:00 AM - 12:00 PM)"}
                              {booking.schedule === 'tue_thu_12' && "Tuesdays & Thursdays (12:00 PM - 2:00 PM)"}
                              {booking.schedule === 'sat_8' && "Saturdays Marathon (8:00 AM - 12:00 PM)"}
                              {!['mon_wed_10', 'tue_thu_12', 'sat_8'].includes(booking.schedule) && booking.schedule}
                            </strong>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold block">Abuja Classroom Location</span>
                          <span className="text-neutral-700 font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" /> Suite B8 AYM Shafa, Wuye
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100/65 rounded-2xl p-4 text-xs text-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">Next Student Coordination Action</p>
                        <p className="text-neutral-500 mt-0.5">Your driving matching scheduler has been locked. Click to connect directly with the Abuja desk on WhatsApp to meet your assigned certified tutor.</p>
                      </div>
                      <a 
                        href={`https://wa.me/2348028955522?text=Hello%20Falcon%20Academy!%20My%20payment%20is%20processed%20and%20I%20have%20opened%20my%20dashboard%20for%20scheduling.`}
                        target="_blank" 
                        rel="noreferrer"
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold uppercase text-[10px] tracking-wider rounded-xl transition text-center shrink-0 block cursor-pointer"
                      >
                        Meet Certified Instructor
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-100 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                    <div className="text-3xl">🚗</div>
                    <div className="space-y-1.5">
                      <h4 className="font-display font-bold text-neutral-800 uppercase text-sm">No bookings verified yet this session</h4>
                      <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                        To lock in your simulator coordinates, custom lesson periods, and Dual-safety Mercedes vehicles matching, click below to select your desired driving program.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentPage('programs')}
                      className="px-5 py-2.5 bg-neutral-900 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition"
                    >
                      Browse Programs & Pricing
                    </button>
                  </div>
                )}

                {/* DRIVING STUDENT LOG BOOK (STAINLESS TRAINING PIPELINE) */}
                <div className="bg-white border border-neutral-150/60 rounded-3xl p-6 sm:p-8 space-y-5">
                  <h3 className="font-display font-black text-sm text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" /> Lesson Milestone Pipeline
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Your complete professional syllabus spans 10 certified curriculum hours designed to transition beginners safely from cockpits onto Abuja city streets. Track milestones:
                  </p>

                  <div className="border border-neutral-105 rounded-2xl overflow-hidden text-xs">
                    <div className="bg-neutral-50 grid grid-cols-12 p-3 font-bold border-b border-neutral-105 text-neutral-600 text-[10px] uppercase">
                      <div className="col-span-8">Certified Curriculum Subject</div>
                      <div className="col-span-2 text-center">Hours</div>
                      <div className="col-span-2 text-right">Verification Status</div>
                    </div>

                    <div className="grid grid-cols-12 p-3.5 border-b border-neutral-105 items-center">
                      <div className="col-span-8 font-medium text-neutral-800">
                        <p>1. Cockpit Controls & Safety Principles</p>
                        <p className="text-[10px] text-neutral-500 font-normal">Pre-drive checks, seat matching, dashboard gauges, virtual simulator setup.</p>
                      </div>
                      <div className="col-span-2 text-center font-mono">2 hrs</div>
                      <div className="col-span-2 text-right">
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase font-mono">Completed</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 p-3.5 border-b border-neutral-105 items-center">
                      <div className="col-span-8 font-medium text-neutral-800">
                        <p>2. Clutch, Pedal coordination & Low Speed Cruise</p>
                        <p className="text-[10px] text-neutral-500 font-normal">Starting, balancing transmission, smooth braking patterns, gear optimization.</p>
                      </div>
                      <div className="col-span-2 text-center font-mono font-bold">2 hrs</div>
                      <div className="col-span-2 text-right">
                        <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold uppercase font-mono animate-pulse">Next Up</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 p-3.5 border-b border-neutral-105 items-center">
                      <div className="col-span-8 font-medium text-neutral-800">
                        <p>3. Abuja FCT Traffic Intersection Maneuvering & Rules</p>
                        <p className="text-[10px] text-neutral-500 font-normal">Rotary traffic circles, proper lane rules, safety yielding guidelines.</p>
                      </div>
                      <div className="col-span-2 text-center font-mono">3 hrs</div>
                      <div className="col-span-2 text-right">
                        <span className="text-[9px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded font-bold uppercase font-mono">Locked</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 p-3.5 items-center">
                      <div className="col-span-8 font-medium text-neutral-800">
                        <p>4. Dynamic Reversing, Parallel Parking & certified FRSC test prep</p>
                        <p className="text-[10px] text-neutral-500 font-normal">Visual checks, mirror angles calibration, precision Nigerian road test prep.</p>
                      </div>
                      <div className="col-span-2 text-center font-mono">3 hrs</div>
                      <div className="col-span-2 text-right">
                        <span className="text-[9px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded font-bold uppercase font-mono">Locked</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTENT: CURRICULUM SYLLABUS */}
            {activeTab === 'curriculum' && (
              <div className="bg-white border border-neutral-150/60 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" /> FRSC certified Training syllabus
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Designed in alignment with Nigerian Federal Road Safety Commission (FRSC) and VIO regulations. Re-verify the core driving fundamentals:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-neutral-100 rounded-2xl p-4 space-y-2 bg-neutral-50">
                    <h4 className="font-sans font-bold text-neutral-900 flex items-center gap-1.5 text-xs uppercase tracking-dark">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Cockpit & Safety Checks
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                      Understand standard cabin controls. Mastery of mirror placement reduces Abuja city blind zones by up to 90% before tires touch asphalt.
                    </p>
                  </div>

                  <div className="border border-neutral-100 rounded-2xl p-4 space-y-2 bg-neutral-50">
                    <h4 className="font-sans font-bold text-neutral-900 flex items-center gap-1.5 text-xs uppercase tracking-dark">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Road Signs & Symbols
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                      Regulatory and warning indicators help you stay aligned on Nigerian expressways. Learn to interpret inverted yields and stop commands instantly.
                    </p>
                  </div>

                  <div className="border border-neutral-100 rounded-2xl p-4 space-y-2 bg-neutral-50">
                    <h4 className="font-sans font-bold text-neutral-900 flex items-center gap-1.5 text-xs uppercase tracking-dark">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Nigeria Highway Code
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                      Strict guidelines governing speed constraints, vehicle hand signals, emergency breakdowns, and pedestrian zebra crossings.
                    </p>
                  </div>

                  <div className="border border-neutral-100 rounded-2xl p-4 space-y-2 bg-neutral-50">
                    <h4 className="font-sans font-bold text-neutral-900 flex items-center gap-1.5 text-xs uppercase tracking-dark">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Mirror-Signal-Maneuver (MSM)
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                      The golden safety sequence used universally: Look in rear/side mirrors, trigger turn direction indicators signals, execute maneuver smoothly.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed mt-4 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-950">Compulsory FRSC Virtual Simulator Sessions</h4>
                    <span className="block mt-0.5">Falcon Academy pupils undergo real-time virtual simulation sessions inside our calibrated cockpits. This ensures safety memory is established offline before moving into real Abuja road coordinates.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MOCK TEST */}
            {activeTab === 'exam' && (
              <div className="bg-white border border-neutral-150/60 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="space-y-1.5">
                  <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" /> Nigeria Highway Code Simulator Mock Test
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Simulate your certified theory test to verify your Abuja VIO safety readiness! Yield at traffic signs and earn your high-passing status instantly.
                  </p>
                </div>

                <div className="space-y-6 pt-2">
                  {mockQuiz.map((q, qIndex) => (
                    <div key={q.id} className="border border-neutral-100 rounded-2xl p-5 space-y-3 bg-neutral-50/50">
                      <p className="font-bold text-neutral-800 sm:text-xs text-[11px] leading-relaxed">
                        Question {qIndex + 1}: {q.question}
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, oIndex) => {
                          const isSelected = selectedAnswers[qIndex] === oIndex;
                          return (
                            <button
                              key={oIndex}
                              type="button"
                              onClick={() => {
                                if (!showResults) {
                                  setSelectedAnswers({
                                    ...selectedAnswers,
                                    [qIndex]: oIndex
                                  });
                                }
                              }}
                              disabled={showResults}
                              className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition ${
                                isSelected 
                                  ? 'bg-emerald-50 border-emerald-500 font-semibold text-emerald-950' 
                                  : 'bg-white border-neutral-100 hover:bg-neutral-50 text-neutral-700'
                              } ${showResults && q.correct === oIndex ? 'border-emerald-600 ring-2 ring-emerald-100' : ''}`}
                            >
                              <div className="flex gap-2">
                                <span className="font-bold shrink-0">{String.fromCharCode(65 + oIndex)})</span>
                                <span>{opt}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {!showResults ? (
                    <button
                      type="button"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(selectedAnswers).length < mockQuiz.length}
                      className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      Submit Mock Test Verification
                    </button>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-neutral-950 text-base font-bold shadow-xs">
                        {practiceScore} / {mockQuiz.length}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display font-black text-base text-neutral-950 uppercase">
                          Practice Mock test completed!
                        </h4>
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                          You scored <strong className="text-emerald-950">{getPercentageScore(practiceScore || 0)}%</strong>. 
                          {getPercentageScore(practiceScore || 0) >= 65 
                            ? " Spectacular! You have exceeded Nigeria Highway Code requirements." 
                            : " Excellent attempt! Re-read the certified curriculum syllabus to score 100%!"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAnswers({});
                          setPracticeScore(null);
                          setShowResults(false);
                        }}
                        className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline"
                      >
                        Reset Mock Test & Try Again
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* RIGHT: ABUJA CAMPUS & INSTRUCTOR CORNER CARD (4-COLS) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white border border-neutral-150/60 p-6 rounded-3xl space-y-5 shadow-xs">
              
              <div className="pb-3 border-b border-neutral-100">
                <h4 className="font-display font-black text-xs text-neutral-950 uppercase tracking-tight">Your Abuja Driving Center</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">Wuye campus coordinate center</p>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div className="flex gap-2.5 items-start">
                  <MapPin className="w-4 h-4 text-emerald-605 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-neutral-800">Falcon Academy Headquarters</p>
                    <p className="text-neutral-500 mt-0.5">Suite B8, AYM Shafa Petrol Station, Wuye, Abuja FCT, Nigeria</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <FileText className="w-4 h-4 text-emerald-605 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-neutral-800">Operational Hours</p>
                    <p className="text-neutral-500 mt-0.5">Monday to Saturday: 8:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <PhoneCall className="w-4 h-4 text-emerald-605 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-neutral-800">Operational Hotline</p>
                    <a href="tel:08028955522" className="text-emerald-700 font-bold block mt-0.5 underline">
                      0802-895-5522
                    </a>
                  </div>
                </div>
              </div>

              {/* Verified Badge card */}
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-2.5 text-[11px] leading-relaxed text-emerald-900">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span><strong>Government Approved Registry</strong>: Verified by VIO and the Federal Road Safety Commission (FRSC). Your completed tuition guarantees you immediate certificate entry.</span>
              </div>

            </div>

            {/* QUICK STUDY CHEATSHEETS */}
            <div className="bg-white border border-neutral-150/60 p-6 rounded-3xl space-y-4 shadow-xs">
              
              <div className="pb-2 border-b border-neutral-100">
                <h4 className="font-display font-black text-xs text-neutral-950 uppercase tracking-tight">Quick Driving Tips</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">Safety guides the road</p>
              </div>

              <ul className="space-y-3.5 text-xs text-neutral-650 leading-relaxed font-semibold">
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Maintain spacing </strong>: Keep at least a 3-second distance on major Abuja highways.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Rotary rules</strong>: Vehicles already circulating inside the roundabout have absolute right of way.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Blind check</strong>: Turn your chin left/right to check over your shoulder before making sudden lane shifts.</span>
                </li>
              </ul>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
