import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, Key, Terminal, Shield } from 'lucide-react';

export default function SupabaseGuideModal({ isOpen, onClose }) {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const envSample = `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2500);
    } else {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Supabase Database Setup Guide
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                PostgreSQL + Auth
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Follow these simple 3 steps to connect your Indian Incubation Center portal to live Supabase.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-300">
          {/* Step 1 */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">1</span>
                Create Free Supabase Project
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold"
              >
                Open Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-white underline">supabase.com</a>, log in or sign up, click <strong>"New Project"</strong>, choose a name (e.g. <code>venturebharat-incubation</code>), set a database password, and select region (e.g. <code>ap-south-1 (Mumbai, India)</code> for best latency).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">2</span>
                Run SQL Schema Script
              </span>
              <span className="text-[11px] text-slate-400 font-mono">File: supabase/schema.sql</span>
            </div>
            <p className="text-slate-400 mb-2.5">
              Navigate to <strong>SQL Editor</strong> in your Supabase dashboard and run the schema file located in your project at <code>supabase/schema.sql</code>. It creates all tables (<code>profiles</code>, <code>startups</code>, <code>cohort_applications</code>, <code>grant_disbursements</code>), RLS policies, and automated user signup triggers!
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-[11px] text-emerald-400">
                📄 Schema ready at: /supabase/schema.sql (180+ lines of SQL)
              </span>
              <button
                onClick={() => copyToClipboard('SELECT 1; -- View full SQL in supabase/schema.sql', 'sql')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied' : 'Copy Path'}</span>
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">3</span>
                Add Credentials to .env File
              </span>
              <span className="text-[11px] text-slate-400 font-mono">client/.env & .env</span>
            </div>
            <p className="text-slate-400 mb-2">
              Go to <strong>Project Settings ➔ API</strong> in Supabase. Copy your <strong>Project URL</strong> and <strong>Project API key (anon public)</strong>, then paste them into <code>.env</code> and <code>client/.env</code>:
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300 relative">
              <pre className="overflow-x-auto">{envSample}</pre>
              <button
                onClick={() => copyToClipboard(envSample, 'env')}
                className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition"
              >
                {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs rounded-lg transition"
          >
            Got it, Let's Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

