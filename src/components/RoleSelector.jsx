import React from 'react';
import { Rocket, ShieldCheck, Sparkles, Building } from 'lucide-react';

export default function RoleSelector({ activeRole, onRoleChange }) {
  const roles = [
    {
      id: 'startup',
      label: 'Startup Innovator',
      sublabel: 'Founders & Cohort Members',
      icon: Rocket,
      badge: 'Applicant / Incubatee',
      accent: 'border-orange-500 text-orange-400 bg-orange-500/10'
    },
    {
      id: 'admin',
      label: 'Incubation Admin',
      sublabel: 'Director & Program Officers',
      icon: ShieldCheck,
      badge: 'AIM / DST Governance',
      accent: 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
    }
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>Select Portal Gateway</span>
        </label>
        <span className="text-[11px] text-slate-400 font-mono">
          Supabase Role-Based Access
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = activeRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onRoleChange(r.id)}
              className={`flex flex-col items-start p-3 rounded-lg text-left transition-all relative ${
                isSelected
                  ? 'bg-slate-800/95 shadow-lg border border-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? r.accent : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isSelected ? 'bg-slate-700/80 text-slate-200' : 'bg-slate-900 text-slate-500'
                }`}>
                  {r.badge}
                </span>
              </div>
              <span className="text-xs font-bold leading-tight text-white">{r.label}</span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                {r.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
