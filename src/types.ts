export interface Course {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  category: 'standard' | 'advanced';
  features: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number; // 5 star scale
  comment: string;
  avatar: string;
  date: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: 'students' | 'simulation' | 'licensing' | 'vehicles';
}

export interface BookingSubmission {
  fullName: string;
  phone: string;
  email?: string;
  courseId: string;
  schedule: string;
  notes?: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
}
