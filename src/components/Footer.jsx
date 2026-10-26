import React from 'react';
import { Award, Landmark, Lock, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#E7ECE5] text-slate-500 py-2.5 px-4 sm:px-6 lg:px-8 mt-auto shrink-0">
      <div className="max-w-[1400px] mx-auto">
        {/* National Ecosystem Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-[11px] truncate">AIM - NITI Aayog</p>
              <p className="text-[10px] text-slate-400 truncate">Atal Innovation Mission</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-[11px] truncate">DST • NIDHI</p>
              <p className="text-[10px] text-slate-400 truncate">National Initiative for S&amp;T</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-[11px] truncate">Startup India &amp; SISFS</p>
              <p className="text-[10px] text-slate-400 truncate">Seed Fund Scheme Partner</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-[11px] truncate">DigiLocker &amp; Aadhaar</p>
              <p className="text-[10px] text-slate-400 truncate">e-Sign &amp; KYC Compliant</p>
            </div>
          </div>
        </div>

        {/* Legal and Center details */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1.5">
          <p>
            © {new Date().getFullYear()} VentureBharat Incubation &amp; Innovation Foundation. All rights reserved.
          </p>
          <div className="flex items-center space-x-3 text-[10px] text-slate-500">
            <a href="#terms" className="hover:text-slate-800 transition">Terms of Incubation</a>
            <span className="text-slate-300">•</span>
            <a href="#privacy" className="hover:text-slate-800 transition">IPR &amp; Data Privacy</a>
            <span className="text-slate-300">•</span>
            <a href="#schemes" className="hover:text-slate-800 transition">DST Grant Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
