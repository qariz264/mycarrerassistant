import React from 'react';
import { Compass, GraduationCap } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'wizard' | 'preview' | 'report';
  onNavigate: (view: 'landing' | 'wizard') => void;
  hasActiveAssessment?: boolean;
  isPaid?: boolean;
  onViewActiveReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  hasActiveAssessment,
  isPaid,
  onViewActiveReport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:bg-sky-100 transition-colors shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors truncate">
            Career Assistant KE
          </span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`hover:text-slate-900 transition-colors cursor-pointer ${currentView === 'landing' ? 'text-sky-600 font-semibold' : ''}`}
          >
            How It Works
          </button>
          <a
            href="#what-we-analyze"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('what-we-analyze')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            What We Analyze
          </a>
          <a
            href="#faq"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            FAQ
          </a>
        </nav>

        {/* Zone 3: Primary action button */}
        <div className="flex items-center gap-2.5">
          {hasActiveAssessment && onViewActiveReport && (
            <button
              onClick={onViewActiveReport}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors hidden sm:inline-flex items-center gap-1.5 cursor-pointer ${
                isPaid
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  : 'text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <span>{isPaid ? 'View Full Report' : 'Unlock Report (KSh 100)'}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('wizard')}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-500 active:bg-sky-700 transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Start Assessment</span>
          </button>
        </div>

      </div>
    </header>
  );
};
