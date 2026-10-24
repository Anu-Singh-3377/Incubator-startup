import React from 'react';
import { Shield, Award, Landmark, Lock, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#E7ECE5] text-slate-500 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        {/* National Ecosystem Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">AIM - NITI Aayog</p>
              <p className="text-[11px] text-slate-500">Atal Innovation Mission</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">DST • NIDHI</p>
              <p className="text-[11px] text-slate-500">National Initiative for S&T</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Startup India & SISFS</p>
              <p className="text-[11px] text-slate-500">Seed Fund Scheme Partner</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">DigiLocker & Aadhaar</p>
              <p className="text-[11px] text-slate-500">e-Sign & KYC Compliant</p>
            </div>
          </div>
        </div>

        {/* Legal and Center details */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()} VentureBharat Incubation & Innovation Foundation. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-[11px]">
            <a href="#terms" className="hover:text-slate-900 transition">Terms of Incubation</a>
            <span className="text-slate-300">•</span>
            <a href="#privacy" className="hover:text-slate-900 transition">IPR & Data Privacy</a>
            <span className="text-slate-300">•</span>
            <a href="#schemes" className="hover:text-slate-900 transition">DST Grant Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

