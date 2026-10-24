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
      accent: 'border-emerald-200 text-emerald-700 bg-emerald-50'
    },
    {
      id: 'admin',
      label: 'Incubation Admin',
      sublabel: 'Director & Program Officers',
      icon: ShieldCheck,
      badge: 'AIM / DST Governance',
      accent: 'border-emerald-200 text-emerald-700 bg-emerald-50'
    }
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>Select Portal Gateway</span>
        </label>
        <span className="text-[11px] text-slate-400">
          Choose your account type
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F6F8F5] rounded-2xl border border-[#E6EBE4]">
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
                  ? 'bg-white shadow-sm border border-emerald-200 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? r.accent : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isSelected ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {r.badge}
                </span>
              </div>
              <span className="text-xs font-bold leading-tight text-slate-900">{r.label}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                {r.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
