import React from 'react';
import { Rocket, ShieldCheck } from 'lucide-react';

export default function RoleSelector({ activeRole, onRoleChange }) {
  const roles = [
    {
      id: 'admin',
      label: 'Incubation Admin',
      sublabel: 'Director & Program Officers',
      icon: ShieldCheck,
      badge: 'Admin / Director',
      accent: 'border-emerald-200 text-emerald-700 bg-emerald-50'
    },
    {
      id: 'startup',
      label: 'Startup Innovator',
      sublabel: 'Founders & Cohort Members',
      icon: Rocket,
      badge: 'Founder / Cohort',
      accent: 'border-emerald-200 text-emerald-700 bg-emerald-50'
    }
  ];

  return (
    <div className="w-full mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>Select Portal Gateway</span>
        </label>
        <span className="text-[10px] text-slate-400">
          Choose account type
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-[#F6F8F5] rounded-xl border border-[#E6EBE4]">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = activeRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onRoleChange(r.id)}
              className={`flex flex-col items-start p-2.5 rounded-lg text-left transition-all relative ${
                isSelected
                  ? 'bg-white shadow-sm border border-emerald-500/40 text-slate-900 ring-1 ring-emerald-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`p-1.5 rounded-md ${
                    isSelected ? r.accent : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {r.badge}
                </span>
              </div>
              <span className="text-xs font-bold leading-tight text-slate-900">{r.label}</span>
              <span className="text-[10px] text-slate-500 font-normal mt-0.5 leading-tight">
                {r.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
