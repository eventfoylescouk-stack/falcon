import React, { useState } from 'react';
import { GALLERY_ITEMS, TESTIMONIALS } from '../data';
import { GalleryItem } from '../types';
import { Star, ShieldAlert, Award, ChevronRight, X, ArrowRight, BookOpen, Quote } from 'lucide-react';

export function Gallery() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'students' | 'simulation' | 'vehicles' | 'licensing'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  // Filter gallery items
  const filteredGallery = GALLERY_ITEMS.filter(item => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'students': return 'Students & Grads';
      case 'simulation': return 'Virtual Training';
      case 'vehicles': return 'Our Modern Fleet';
      case 'licensing': return 'FRSC Licensing';
      default: return 'Academy Photos';
    }
  };

  return (
    <div className="bg-neutral-50 py-16 lg:py-24 font-sans text-neutral-800" id="gallery-page-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title and intro */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-widest rounded-full px-4 py-1 font-bold inline-block">
            Student Life & Success
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-neutral-900 uppercase">
            Gallery & Testimonials
          </h1>
          <p className="text-neutral-500 sm:text-lg">
            See actual moments representing student confidence, software cockpit simulator installations, dual-control preparation, and physical graduation landmarks in Wuye, Abuja.
          </p>

          {/* Filter sub-navigation */}
          <div className="flex flex-wrap gap-2 justify-center pt-6" id="gallery-filter-tabs">
            {['all', 'students', 'simulation', 'vehicles', 'licensing'].map((filterObj) => (
              <button
                key={filterObj}
                onClick={() => setActiveFilter(filterObj as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                  activeFilter === filterObj
                    ? 'bg-neutral-900 text-white border-transparent shadow-md'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                {filterObj === 'all' ? 'View All' : getCategoryLabel(filterObj)}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="bg-white rounded-3xl overflow-hidden border border-neutral-150 p-2.5 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transform transition-all duration-300 cursor-zoom-in group"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 relative">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5 text-left">
                  <div>
                    <span className="text-[9px] font-bold tracking-widest font-mono uppercase text-emerald-400 bg-neutral-900/80 px-2 py-1 rounded-sm">
                      {getCategoryLabel(item.category)}
                    </span>
                    <h4 className="text-white font-semibold text-sm mt-2">{item.title}</h4>
                  </div>
                </div>
              </div>
              <div className="p-4 text-left">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">{getCategoryLabel(item.category)}</span>
                <p className="text-xs font-bold text-neutral-800 line-clamp-1 mt-1">{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal widget */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
            id="gallery-lightbox-modal"
          >
            <div
              className="relative max-w-4xl w-full bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl p-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/90 text-white rounded-full p-2.5 transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 text-left text-white bg-neutral-900/90 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-400">
                    {getCategoryLabel(selectedPhoto.category)}
                  </span>
                  <h3 className="font-display font-extrabold text-base uppercase mt-1.5">{selectedPhoto.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Testimonials Review section */}
        <div className="mt-24 border-t border-neutral-250 pt-16">
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
            <span className="font-mono text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-full py-1 px-3 uppercase tracking-wider font-bold inline-block">
              Client Feedback
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-neutral-900 uppercase">
              Student Testimonials
            </h2>
            <p className="text-neutral-500 text-sm max-w-xl mx-auto">
              Read real-world testimonials shared by Abuja-based beginners and corporate specialists training at our Wuye driving center.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-neutral-150 rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between shadow-xs group"
              >
                {/* Star rating and quotes */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-neutral-100 group-hover:text-emerald-50 transition-colors shrink-0" />
                  </div>
                  
                  <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed italic mb-8">
                    "{t.comment}"
                  </p>
                </div>

                {/* Avatar and name */}
                <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-neutral-100">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-neutral-900 text-sm uppercase leading-tight">{t.name}</h4>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-semibold">{t.role} • {t.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Google review encouragement banner */}
        <div className="mt-20 bg-emerald-600 text-neutral-950 rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-5 max-w-3xl mx-auto text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-full">Leave Feedback</span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-neutral-950 uppercase leading-none">Are you a Falcon Graduate?</h3>
            <p className="text-neutral-900 text-sm max-w-xl mx-auto font-medium">
              Your feedback fuels our commitment! Help nervous learners in Wuye and across Abuja FCT find professional, patient coaching by leaving us a positive 5-star Google Review.
            </p>
            <div className="pt-2">
              <a
                href="https://google.com" // Directing generally representing google search page for Abuja
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white font-black uppercase text-xs tracking-wider rounded-xl hover:bg-neutral-800 transition-all cursor-pointer shadow-lg hover:shadow-black/15"
                id="leave-google-review-btn"
              >
                Leave A Google Review <ArrowRight className="w-4 h-4 text-emerald-405" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
