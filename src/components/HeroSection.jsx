import React from 'react';
import { Rocket, ShieldCheck, Award, TrendingUp, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function HeroSection({ stats, onOpenRegister }) {
  return (
    <div className="flex flex-col justify-between h-full space-y-8 py-2">
      {/* Top Banner Tag */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-orange-400 font-medium mb-4 shadow-inner">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span>Cohort 13 Applications Closing Soon</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Catalyzing India's <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
            DeepTech & Innovation
          </span> <br />
          Revolution.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed max-w-xl">
          Welcome to <strong className="text-white font-semibold">VentureBharat Incubation Foundation</strong>, an Atal Incubation Centre (AIC) supported by AIM, NITI Aayog & the Department of Science & Technology (DST), Govt. of India.
        </p>

        {/* Govt Scheme Pills */}
        <div className="flex flex-wrap gap-2 mt-5">
          {['Startup India SISFS', 'NIDHI-PRAYAS', 'NIDHI-EIR', 'MeitY TIDE 2.0'].map((scheme) => (
            <span
              key={scheme}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-slate-300"
            >
              🇮🇳 {scheme}
            </span>
          ))}
        </div>
      </div>

      {/* Grid of Key Impact Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 my-2">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-400">
            {stats?.totalStartupsIncubated || 248}+
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5">Startups Incubated</p>
          <p className="text-[11px] text-slate-400 mt-1">Across 18+ Indian States</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {stats?.totalGrantsDisbursed || '₹34.8 Cr'}
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5">Grants Disbursed</p>
          <p className="text-[11px] text-slate-400 mt-1">Direct Govt Seed Funds</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">
            {stats?.mentorsNetwork || 120}+
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5">Ecosystem Mentors</p>
          <p className="text-[11px] text-slate-400 mt-1">IIT/IIM & Unicorn Founders</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
            {stats?.patentsFiled || 87}
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5">Patents Filed</p>
          <p className="text-[11px] text-slate-400 mt-1">National & Global IP</p>
        </div>
      </div>

      {/* Featured Testimonial / Case Study */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800/90 text-xs relative">
        <div className="flex items-start space-x-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Startup Founder"
            className="w-10 h-10 rounded-full border border-orange-500/30 object-cover shrink-0"
          />
          <div>
            <p className="text-slate-300 italic leading-relaxed">
              "VentureBharat gave us the SISFS seed funding and cleanroom facility to develop our indigenous agricultural AI hardware right here in India."
            </p>
            <p className="text-white font-bold mt-1.5">
              Aarav Sharma <span className="text-slate-400 font-normal">• Founder, KisanSetu DeepTech (Cohort 12)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>MeitY & DPIIT Registered Entity</span>
        </span>
        <button
          onClick={onOpenRegister}
          className="text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1 transition"
        >
          <span>Apply as a Startup</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

