import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Navbar({ onOpenRegister }) {
  return (
    <header className="w-full bg-white/90 border-b border-[#E7ECE5] backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-[72px] flex items-center justify-between">
        {/* Brand & Govt Affiliation */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-700 flex items-center justify-center shadow-sm">
              <span className="text-lg font-black text-white">
                VB
              </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                VentureBharat <span className="text-emerald-700">Incubation</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                AIC • DST
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Atal Incubation & Innovation Foundation • Supported by NITI Aayog & Startup India
            </p>
          </div>
        </div>

        {/* Right Action & Trust Badges */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onOpenRegister}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Apply for Cohort 2026</span>
            <span className="sm:hidden">Apply</span>
          </button>
        </div>
      </div>
    </header>
  );
}
