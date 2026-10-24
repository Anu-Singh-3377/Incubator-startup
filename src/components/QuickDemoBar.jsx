import React from 'react';
import { KeyRound, Sparkles, Shield, Rocket } from 'lucide-react';

export default function QuickDemoBar({ onSelectDemo }) {
  const demoProfiles = [
    {
      role: 'startup',
      title: 'Startup Founder Demo',
      badge: 'DeepTech',
      email: 'founder@venturebharat.in',
      password: 'Startup@2026',
      phone: '+91 98765 43210',
      icon: Rocket,
      color: 'border-[#DCE9DD] hover:border-emerald-300 bg-[#F5FAF5] text-emerald-900'
    },
    {
      role: 'admin',
      title: 'Incubation Admin Demo',
      badge: 'Director/CEO',
      email: 'admin@venturebharat.in',
      password: 'Admin@2026',
      phone: '+91 99000 11223',
      icon: Shield,
      color: 'border-[#DCE9DD] hover:border-emerald-300 bg-[#F5FAF5] text-emerald-900'
    }
  ];

  return (
    <div className="w-full mt-6 pt-5 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
          <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
          <span>One-Click Demo Credentials</span>
        </div>
        <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Ready to Test
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {demoProfiles.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.role}
              type="button"
              onClick={() => onSelectDemo(p)}
              className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${p.color}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold truncate">{p.title}</span>
                <Icon className="w-3.5 h-3.5 opacity-80" />
              </div>
              <p className="text-[10px] text-slate-500 truncate font-mono">
                {p.email}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
