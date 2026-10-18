import React, { useState, useEffect } from 'react';
import {
  Rocket,
  DollarSign,
  TrendingUp,
  Cpu,
  Calendar,
  Compass,
  FileText,
  LogOut,
  Bell,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Database
} from 'lucide-react';
import { supabaseService, isSupabaseConfigured } from '../lib/supabaseClient';

export default function StartupDashboard({ user, onLogout, onOpenGuide }) {
  const [announcements, setAnnouncements] = useState([]);
  const [trancheModalOpen, setTrancheModalOpen] = useState(false);
  const [trancheSubmitted, setTrancheSubmitted] = useState(false);

  useEffect(() => {
    supabaseService.getAnnouncements().then(setAnnouncements);
  }, []);

  const milestones = [
    { id: 1, name: 'Screening & Onboarding', status: 'completed', desc: 'DPIIT registration & AIC MoU signed' },
    { id: 2, name: 'Lab Prototyping', status: 'active', desc: 'Hardware fabrication in Cleanroom Bay 4B' },
    { id: 3, name: 'Field Pilot Testing', status: 'pending', desc: 'Agricultural sensor deployment' },
    { id: 4, name: 'Tranche 2 Disbursal', status: 'pending', desc: 'Milestone UC verification' },
    { id: 5, name: 'Cohort Demo Day', status: 'pending', desc: 'Pitching to angel networks' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Indian National Tricolor Ribbon */}
      <div className="w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-white shadow-md">
            VB
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                VentureBharat Incubation
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400">
                Startup Innovator Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Atal Incubation Centre (AIC) • Supported by Startup India & DST
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Database indicator */}
          <button
            onClick={onOpenGuide}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs border font-mono ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>{isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode'}</span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-white">{user.full_name || 'Aarav Sharma'}</p>
              <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 border border-slate-700 text-xs font-medium transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Startup Welcome Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-slate-800 text-[11px] font-semibold text-orange-400 mb-2 border border-slate-700">
                <Rocket className="w-3.5 h-3.5" />
                <span>{user.cohort || 'Cohort 12 (Spring 2026)'}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">Active Incubatee</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {user.startup_name || 'KisanSetu DeepTech Labs'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                <span>DPIIT Recognition: <strong className="text-white font-mono">{user.dpiit_number || 'DIPP-IN-98214'}</strong></span>
                <span className="text-slate-600">|</span>
                <span>Sector: <strong className="text-white">{user.sector || 'AgriTech & Edge AI'}</strong></span>
                <span className="text-slate-600">|</span>
                <span>Founder: <strong className="text-white">{user.full_name || 'Aarav Sharma'}</strong></span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTrancheModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Apply for Tranche 2 Disbursal</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Sanctioned Govt Seed Grant</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">₹25,00,000</div>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">
              Startup India Seed Fund Scheme (SISFS)
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Disbursed to Date</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">₹12,50,000</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tranche 1 Cleared • 50% Disbursed
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Assigned Expert Mentor</span>
              <Compass className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white truncate">Dr. Radhika Iyer</div>
            <p className="text-[11px] text-blue-300 mt-1">
              IIT Bombay Alum • Partner, Bharat Seed
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Lab & Cleanroom Allotment</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white truncate">IoT Cleanroom Bay 4B</div>
            <p className="text-[11px] text-purple-300 mt-1">
              24/7 Access Active • Biometric Enabled
            </p>
          </div>
        </div>

        {/* Milestone Lifecycle Tracker */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                Incubation Lifecycle Milestones (AIC Framework)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stage 2 of 5: Hardware Prototyping & Edge AI Integration
              </p>
            </div>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded">
              55% Completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-6 border border-slate-800">
            <div className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '55%' }} />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {milestones.map((m) => {
              const isDone = m.status === 'completed';
              const isActive = m.status === 'active';
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isActive
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-300 shadow-md ring-1 ring-orange-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold">STAGE 0{m.id}</span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isActive && <Clock className="w-3.5 h-3.5 text-orange-400 animate-spin" />}
                  </div>
                  <p className="text-xs font-bold text-white">{m.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-Column Grid: Grant Details + Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Grant Disbursal Schedule */}
          <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Startup India Seed Fund Scheme (SISFS) Tranches
              </h3>
              <span className="text-xs text-slate-400 font-mono">DPIIT Govt Portal Sync</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Tranche 1 (Advance for Prototyping)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Disbursed
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Disbursed on 15 Feb 2026 via PFMS Direct Benefit Transfer
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white text-sm">₹12,50,000</span>
                  <p className="text-[10px] text-emerald-400">Cleared</p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-orange-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Tranche 2 (Field Trial & IP Filing)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                      Eligible to Claim
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Requires Utilization Certificate (UC) & Milestone Review
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-orange-400 text-sm">₹12,50,000</span>
                  <button
                    onClick={() => setTrancheModalOpen(true)}
                    className="block text-[11px] text-orange-400 hover:underline mt-0.5"
                  >
                    Submit UC
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => alert('Booked 1-on-1 Office Hour with Dr. Radhika Iyer for Friday 3:30 PM.')}
                className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-left text-xs transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-slate-200">Schedule Mentor Office Hour</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </button>

              <button
                onClick={() => alert('Reserved 3D Prototyping Cleanroom for tomorrow 10:00 AM - 2:00 PM.')}
                className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-left text-xs transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-slate-200">Book Testing Equipment</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Right Column: Official Incubation Directorate Announcements */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                Directorate Noticeboard
              </h3>
              <span className="text-[11px] text-slate-400">Live Broadcasts</span>
            </div>

            <div className="space-y-3">
              {announcements.map((anc) => (
                <div key={anc.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {anc.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(anc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs">{anc.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{anc.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Tranche Claim Modal */}
      {trancheModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-2">
              Apply for Tranche 2 Disbursal (₹12,50,000)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload your Auditor-Certified Utilization Certificate (UC) and milestone completion proof for KisanSetu DeepTech Labs.
            </p>

            {trancheSubmitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300">Tranche 2 Claim Submitted!</h4>
                <p className="text-xs text-slate-300">
                  The Incubation Director and DST Evaluation Committee will inspect your milestone report within 5 business days.
                </p>
                <button
                  onClick={() => {
                    setTrancheSubmitted(false);
                    setTrancheModalOpen(false);
                  }}
                  className="mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setTrancheSubmitted(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Milestone Completed
                  </label>
                  <input
                    type="text"
                    defaultValue="Hardware Prototyping & Sensor Validation (Bay 4B)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Utilization Certificate (UC) PDF Link / File Reference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/uc-kisansetu-tranche1.pdf"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Key Achievements & Lab Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe testing results, patents filed, or pilot engagements..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTrancheModalOpen(false)}
                    className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg shadow-md"
                  >
                    Submit Tranche 2 Claim
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

