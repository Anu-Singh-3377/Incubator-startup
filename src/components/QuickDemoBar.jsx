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
      color: 'border-orange-500/40 hover:border-orange-400 bg-orange-500/10 text-orange-300'
    },
    {
      role: 'admin',
      title: 'Incubation Admin Demo',
      badge: 'Director/CEO',
      email: 'admin@venturebharat.in',
      password: 'Admin@2026',
      phone: '+91 99000 11223',
      icon: Shield,
      color: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/10 text-emerald-300'
    }
  ];

  return (
    <div className="w-full mt-6 pt-5 border-t border-slate-800/80">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>One-Click Demo Credentials</span>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
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
              className={`p-2.5 rounded-lg border text-left transition-all hover:scale-[1.01] flex flex-col justify-between ${p.color}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold truncate">{p.title}</span>
                <Icon className="w-3.5 h-3.5 opacity-80" />
              </div>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                {p.email}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
