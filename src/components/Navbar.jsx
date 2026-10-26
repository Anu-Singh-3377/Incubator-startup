import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Navbar({ onOpenRegister }) {
  return (
    <header className="w-full bg-white/95 border-b border-[#E7ECE5] backdrop-blur-md sticky top-0 z-40 shrink-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand & Govt Affiliation */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-sm font-black text-white tracking-wider">
              VB
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                VentureBharat <span className="text-emerald-700">Incubation</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                AIC • DST
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block leading-none mt-0.5">
              Atal Incubation &amp; Innovation Foundation • Supported by NITI Aayog &amp; Startup India
            </p>
          </div>
        </div>

        {/* Right Action & Trust Badges */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onOpenRegister}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-sm"
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
