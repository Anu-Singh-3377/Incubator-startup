import React from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

const workspaceImage = 'https://images.unsplash.com/photo-1774853094610-89be6f1a7690?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=1800';

export default function HeroSection({ stats, onOpenRegister }) {
  return (
    <section className="relative isolate h-full min-h-[320px] sm:min-h-[400px] overflow-hidden rounded-3xl bg-[#DCE8DC] shadow-[0_12px_45px_rgba(37,55,43,0.08)]">
      <img
        src={workspaceImage}
        alt="Sunlit startup workspace with desks and indoor plants"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        loading="eager"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#17251d]/85 via-[#26372c]/30 to-transparent" />

      <div className="flex h-full min-h-[320px] flex-col justify-between p-5 sm:min-h-[400px] sm:p-8 lg:min-h-[680px] lg:p-10">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-emerald-900 shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Incubation · Innovation · Impact
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/10 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            AIC · DST
          </span>
        </div>

        <div className="max-w-xl text-white">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            A place to build what matters
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.8rem]">
            Ideas grow into a better tomorrow.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
            A supportive home for ambitious founders turning meaningful ideas into lasting ventures.
          </p>

          <div className="mt-7 grid max-w-md grid-cols-3 gap-2 border-t border-white/25 pt-5 sm:gap-4">
            <div>
              <p className="text-xl font-semibold sm:text-2xl">{stats?.totalStartupsIncubated || 248}+</p>
              <p className="mt-1 text-[10px] text-white/75 sm:text-xs">Startups supported</p>
            </div>
            <div>
              <p className="text-xl font-semibold sm:text-2xl">{stats?.mentorsNetwork || 120}+</p>
              <p className="mt-1 text-[10px] text-white/75 sm:text-xs">Expert mentors</p>
            </div>
            <div>
              <p className="text-xl font-semibold sm:text-2xl">{stats?.patentsFiled || 87}</p>
              <p className="mt-1 text-[10px] text-white/75 sm:text-xs">Patents filed</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenRegister}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-100"
          >
            Explore incubation opportunities
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
