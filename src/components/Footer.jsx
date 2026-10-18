import React from 'react';
import { Shield, Award, Landmark, Lock, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        {/* National Ecosystem Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">AIM - NITI Aayog</p>
              <p className="text-[11px] text-slate-400">Atal Innovation Mission</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">DST • NIDHI</p>
              <p className="text-[11px] text-slate-400">National Initiative for S&T</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">Startup India & SISFS</p>
              <p className="text-[11px] text-slate-400">Seed Fund Scheme Partner</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">DigiLocker & Aadhaar</p>
              <p className="text-[11px] text-slate-400">e-Sign & KYC Compliant</p>
            </div>
          </div>
        </div>

        {/* Legal and Center details */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()} VentureBharat Incubation & Innovation Foundation. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-[11px]">
            <a href="#terms" className="hover:text-slate-200 transition">Terms of Incubation</a>
            <span className="text-slate-700">•</span>
            <a href="#privacy" className="hover:text-slate-200 transition">IPR & Data Privacy</a>
            <span className="text-slate-700">•</span>
            <a href="#schemes" className="hover:text-slate-200 transition">DST Grant Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

