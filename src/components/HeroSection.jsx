import React from 'react';
import { ArrowUpRight, ShieldCheck, Award, TrendingUp } from 'lucide-react';

const primaryImage = '/assets/indian-incubator-hub.jpg';
const fallbackImage = 'https://images.unsplash.com/flagged/photo-1576485436509-a7d286952b65?auto=format&fit=crop&w=1200&q=80';

export default function HeroSection({ stats, onOpenRegister }) {
  return (
    <section className="relative isolate h-full min-h-[320px] sm:min-h-[380px] lg:min-h-0 overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 shadow-[0_8px_30px_rgba(20,40,25,0.06)] border border-[#E2E8E0] flex flex-col justify-between">
      {/* Background Image: Authentic Indian Incubator Hub with founders collaborating */}
      <img
        src={primaryImage}
        onError={(e) => {
          if (e.currentTarget.src !== fallbackImage) {
            e.currentTarget.src = fallbackImage;
          }
        }}
        alt="Indian startup founders and technologists collaborating in a modern incubation hub"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        loading="eager"
      />

      {/* Deep Forest Gradient Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#09190e]/95 via-[#0f2817]/70 to-[#09150d]/45" />

      {/* Top Header inside Hero */}
      <div className="p-4 sm:p-6 lg:p-6 flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40" />
          <span>VentureBharat Incubation Hub</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/20 px-2.5 py-1 text-[11px] font-medium text-amber-200 backdrop-blur-md">
          <Award className="h-3.5 w-3.5 text-amber-300" />
          <span>AIM · DST Recognized</span>
        </span>
      </div>

      {/* Bottom Content Area */}
      <div className="p-4 sm:p-6 lg:p-6 text-white mt-auto">
        <div className="max-w-xl">
          <p className="mb-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Catalyzing Indian Innovation &amp; DeepTech</span>
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-[1.85rem] font-bold leading-snug tracking-tight text-white">
            Empowering visionary founders to build world-class ventures.
          </h1>
          <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-200/90 max-w-lg line-clamp-2 sm:line-clamp-none">
            State-of-the-art incubation labs, non-dilutive seed grants, and strategic mentorship under national innovation frameworks.
          </p>

          {/* Key Impact Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2.5 border-t border-white/15 pt-3">
            <div>
              <p className="text-base sm:text-xl font-bold text-white tracking-tight">
                {stats?.totalStartupsIncubated || 248}+
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">Startups Incubated</p>
            </div>
            <div>
              <p className="text-base sm:text-xl font-bold text-emerald-300 tracking-tight">
                {stats?.totalGrantsDisbursed || '₹34.8 Cr'}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">Grants Disbursed</p>
            </div>
            <div>
              <p className="text-base sm:text-xl font-bold text-amber-300 tracking-tight">
                {stats?.patentsFiled || 87}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">Patents &amp; IPR Filed</p>
            </div>
          </div>

          {/* Action Link */}
          <div className="mt-3.5 pt-2.5 flex items-center justify-between border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <span>Apply for Cohort 2026 incubation &amp; seed funding</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>NIDHI-TBI Ecosystem</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
