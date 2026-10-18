import React from 'react';
import { ShieldCheck, PhoneCall, Sparkles, HelpCircle } from 'lucide-react';
import SupabaseBadge from './SupabaseBadge';

export default function Navbar({ onOpenRegister, onOpenGuide }) {
  return (
    <header className="w-full bg-slate-900/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      {/* Indian National Tricolor Ribbon */}
      <div className="w-full h-[3px] bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Govt Affiliation */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-amber-600 to-emerald-600 p-[2px] shadow-lg shadow-orange-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl font-black bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
                VB
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                VentureBharat <span className="text-orange-500">Incubation</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                AIC • DST
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Atal Incubation & Innovation Foundation • Supported by NITI Aayog & Startup India
            </p>
          </div>
        </div>

        {/* Right Action & Trust Badges */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <SupabaseBadge onOpenGuide={onOpenGuide} />

          <button
            onClick={onOpenRegister}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-600/20 transition-all hover:shadow-orange-600/30 transform hover:-translate-y-0.5 active:translate-y-0"
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
