import { Course, Testimonial, GalleryItem } from './types';

// Let's use the actual file names for the beautiful generated assets
export const HERO_IMAGE_URL = '/src/assets/images/falcon_hero_banner_1781780038589.jpg';
export const SIMULATOR_IMAGE_URL = '/src/assets/images/driving_simulator_training_1781780058581.jpg';
export const STUDENT_SUCCESS_IMAGE_URL = '/src/assets/images/student_success_license_1781780075476.jpg';

export const COURSES: Course[] = [
  // Standard Programs
  {
    id: 'std_2w_beginners',
    name: "2-Week Beginners Course",
    duration: "2 Weeks (Mon - Fri)",
    price: 95000,
    category: 'standard',
    description: "Our core training program tailored perfectly for nervous or first-time drivers. Covers basic control, virtual simulator practice, and road confidence.",
    features: [
      "Vehicle safety preparation & orientation",
      "Virtual simulation sessions for nervous beginners",
      "One-on-one road driving across Wuye & Abuja",
      "Traffic regulations, road signs & highway code",
      "Basic vehicle maintenance instructions",
      "Certificate of Completion"
    ]
  },
  {
    id: 'std_2w_license',
    name: "2-Week Beginners Course (with License)",
    duration: "2 Weeks + Licensing",
    price: 145000,
    category: 'standard',
    description: "Get fully trained and standard-certified. This package includes high-yield daily driving instruction, a Learner's Permit, and a genuine 5-Year Driver's License.",
    features: [
      "Everything in the 2-Week Beginners Course",
      "Learner's Permit processing support",
      "Official FRSC certificate registry placement",
      "Authorized 5-Year Driver's License issuing guidance",
      "VPP (Vehicle Parking and Placement) modules",
      "High-pressure traffic intersection practice"
    ]
  },
  {
    id: 'std_1w_refresher',
    name: "1-Week Refresher Course",
    duration: "1 Week (Mon - Fri)",
    price: 75000,
    category: 'standard',
    description: "Designed for individuals who already basic-know how to drive but need to regain road confidence, master tricky situations, or prepare for tests.",
    features: [
      "Quick driving assessment & posture tune-up",
      "Overcoming specific driving fears & anxieties",
      "Parallel parking, reverse maneuvers, and tight hills",
      "Highway navigation and merging techniques",
      "Abuja traffic hazard identification drill"
    ]
  },
  {
    id: 'std_1w_defensive',
    name: "1-Week Defensive Driving Course",
    duration: "1 Week (Specialized)",
    price: 75000,
    category: 'standard',
    description: "Upgrade your skill to absolute defensive standards. Perfect for corporate drivers, family chauffeurs, and safety-conscious individuals.",
    features: [
      "Advanced hazard awareness & preventative reaction",
      "Avoiding collisions & sudden road emergencies",
      "Speed management and adverse weather control",
      "Hijack avoidance and defensive lane control",
      "Comprehensive digital certificate of defense competency"
    ]
  },

  // Advanced Programs
  {
    id: 'adv_3w_training',
    name: "3-Week Advanced Training Course",
    duration: "3 Weeks (Mon - Fri)",
    price: 115000,
    category: 'advanced',
    description: "An extended, highly exhaustive training regimen designed to turn amateur beginners into incredibly smooth and defensive master drivers.",
    features: [
      "Additional week of intense, varied road experience",
      "Extended simulation and night-driving practices",
      "Under-hood mechanics & basic roadside triage",
      "Complex roundabouts, Wuse/Maitama peak rush prep",
      "Falcon Driving School Master Certificate"
    ]
  },
  {
    id: 'adv_3w_license',
    name: "3-Week Training Course (with License)",
    duration: "3 Weeks + Licensing",
    price: 165000,
    category: 'advanced',
    description: "Our complete and most popular individual package. Comprehensive 3-week physical curriculum packaged together with legal Learner Permits and a 5-Year Driver's License.",
    features: [
      "Full 3-Week Advanced curriculum",
      "Extended driving hours (both Automatic & Manual)",
      "Learner's Permit and VIO theory exam clearance",
      "Official 5-Year national Driver's License",
      "Defensive driving and active accident prevention modules",
      "Lifetime post-grad support helpline"
    ]
  },
  {
    id: 'adv_special_home',
    name: "Home & Office Special Training",
    duration: "Flexible Scheduling",
    price: 265000,
    category: 'advanced',
    description: "Ultimate convenience. Our certified premium inspector drives to your residence or corporate office in Abuja for tailored practical slots.",
    features: [
      "Door-to-door instructor service (Home or Office)",
      "Choice of Automatic/Manual custom training vehicles",
      "Flexible, student-led schedule selection",
      "Learner's Permit processing & support",
      "Genuine 5-Year national Driver's License",
      "Targeted neighborhood route training (routes you standard use)"
    ]
  },
  {
    id: 'adv_executive',
    name: "Executive VIP Training Package",
    duration: "Highly Flexible VIP Service",
    price: 350000,
    category: 'advanced',
    description: "Our ultra-premium executive course. Enjoy custom bespoke road routing, premium simulator blocks, high-level defensive theory, VIP licensing assistance, and flexible timing.",
    features: [
      "Dedicated senior master instructor matching",
      "Dual control VIP vehicle with extra security & luxury",
      "Highest priority 5-Year VIP Driver's License processing",
      "Weekend night and Abuja expressway high speed master classes",
      "Advanced corporate chauffeur defensive standard certificate",
      "Premium graduation kit, custom gear, and framed diploma"
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: "Chinedu Okafor",
    role: "Wuye Resident",
    rating: 5,
    comment: "I was extremely nervous, especially about Wuye roundabouts, but Falcon's virtual simulator training helped ease my fears. The instructors are patient, polite, and absolute professionals. Highly recommended!",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    date: "May 2026"
  },
  {
    id: 't2',
    name: "Aisha Bello",
    role: "Undergraduate, UniAbuja",
    rating: 5,
    comment: "Superb service! I did the 2-week course with learners permit and 5-year license. No stress at all, Falcon handled the FRSC testing registration and paperwork perfectly. Best driving school in Abuja!",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80",
    date: "April 2026"
  },
  {
    id: 't3',
    name: "Tunde Adelaja",
    role: "Corporate Executive",
    rating: 5,
    comment: "I enrolled my wife for their Home & Office Special Training. They literally picked her up from her workspace in the mornings and dropped her back. Perfect patience. Her lane and parking controls are spot-on now.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    date: "June 2026"
  },
  {
    id: 't4',
    name: "Fatima Yusuf",
    role: "Defensive Driving Graduate",
    rating: 5,
    comment: "As an experienced driver, I wanted the 1-week defensive driving program. Learned vital hazard awareness tips and evasive techniques. Worth every Naira!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    date: "March 2026"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    url: STUDENT_SUCCESS_IMAGE_URL,
    title: "Student celebrating license achievement",
    category: 'students'
  },
  {
    id: 'g2',
    url: SIMULATOR_IMAGE_URL,
    title: "Immersive driving simulator session",
    category: 'simulation'
  },
  {
    id: 'g4',
    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&h=450&q=80",
    title: "Dual control training vehicle prep",
    category: 'vehicles'
  },
  {
    id: 'g3',
    url: HERO_IMAGE_URL,
    title: "One-on-one professional road instruction",
    category: 'students'
  },
  {
    id: 'g5',
    url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&h=450&q=80",
    title: "Engine inspection and basic maintenance session",
    category: 'simulation'
  },
  {
    id: 'g6',
    url: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=600&h=450&q=80",
    title: "Official driver's license issuing desk step",
    category: 'licensing'
  }
];

export const FAQS = [
  {
    q: "Where exactly in Abuja is Falcon Driving School located?",
    a: "We are located at Suite B8, AYM Shafa Petrol Station, Wuye, Abuja. It's safe, accessible, and has ample space for our simulator training and initial parking maneuvers."
  },
  {
    q: "Can I choose between learning Automatic and Manual cars?",
    a: "Absolutely! We train on both systems. You can even decide to split your lessons to get comfortable operating both transmissions."
  },
  {
    q: "How does the virtual driving simulation help beginners?",
    a: "It provides a 100% safe, anxiety-free platform to learn basic operations - steering, clutch-biting, gear shifts, and lane positioning - before you touch live Abuja traffic. It is widely praised by nervous drivers!"
  },
  {
    q: "Do you guarantee that I will get an official driver's license?",
    a: "Our licensing programs are fully integrated with the FRSC (Federal Road Safety Corps) and VIO (Vehicle Inspection Office). We prepare you fully, guide your official testing, and support you directly until you grab your genuine physical license."
  },
  {
    q: "How do I book standard lessons and choose a timetable?",
    a: "Simply click 'Sign Up' to select your course and prefer a schedule (e.g., Weekday mornings, Weekend evenings, etc.). After making your payment, send your proof to us on WhatsApp, and our coordinator will lock in your slots."
  }
];
