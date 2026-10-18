import React from 'react';
import { Database, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function SupabaseBadge({ onOpenGuide }) {
  return (
    <button
      type="button"
      onClick={onOpenGuide}
      className={`group flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
        isSupabaseConfigured
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
      }`}
      title="Click to view Supabase setup instructions & SQL schema"
    >
      <Database className="w-3.5 h-3.5" />
      <span>
        {isSupabaseConfigured ? 'Supabase Connected' : 'Supabase (Demo Mode)'}
      </span>
      <span
        className={`w-2 h-2 rounded-full ${
          isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
        }`}
      />
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition ml-0.5" />
    </button>
  );
}

