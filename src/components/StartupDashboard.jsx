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
  Database,
  Building2,
  Check,
  CheckSquare
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

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Subtle Tri-color Growth Ribbon */}
      <div className="w-full h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-600" />

      {/* Top Navigation */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-black text-white shadow-xs">
            VB
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                VentureBharat Incubation
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                Startup Innovator Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Atal Incubation Centre (AIC) • Supported by Startup India & DST
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Date */}
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Database indicator */}
          <button
            onClick={onOpenGuide}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs border font-mono ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>{isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode'}</span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-900">{user?.full_name || 'Aarav Sharma'}</p>
              <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 border border-slate-200 text-xs font-medium transition"
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
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-800 mb-2 border border-emerald-200">
                <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user?.cohort || 'Cohort 12 (Spring 2026)'}</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-700 font-bold">Active Incubatee</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {user?.startup_name || 'KisanSetu DeepTech Labs'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                <span>DPIIT Recognition: <strong className="text-slate-900 font-mono">{user?.dpiit_number || 'DIPP-IN-98214'}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Sector: <strong className="text-slate-900">{user?.sector || 'AgriTech & Edge AI'}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Founder: <strong className="text-slate-900">{user?.full_name || 'Aarav Sharma'}</strong></span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTrancheModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Apply for Tranche 2 Disbursal</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600">Sanctioned Seed Grant</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">₹25,00,000</div>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">
              Startup India Seed Fund Scheme (SISFS)
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600">Disbursed to Date</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">₹12,50,000</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Tranche 1 Cleared • 50% Disbursed
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600">Assigned Expert Mentor</span>
              <Compass className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">Dr. Radhika Iyer</div>
            <p className="text-[11px] text-blue-700 mt-1 font-medium">
              IIT Bombay Alum • Partner, Bharat Seed
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600">Lab & Cleanroom Allotment</span>
              <Cpu className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">IoT Cleanroom Bay 4B</div>
            <p className="text-[11px] text-purple-700 mt-1 font-medium">
              24/7 Access Active • Biometric Enabled
            </p>
          </div>
        </div>

        {/* Milestone Lifecycle Tracker */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Incubation Lifecycle Milestones (AIC Framework)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stage 2 of 5: Hardware Prototyping & Edge AI Integration
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              55% Completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6 border border-slate-200">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" style={{ width: '55%' }} />
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
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : isActive
                      ? 'bg-white border-emerald-500 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold">STAGE 0{m.id}</span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isActive && <Clock className="w-3.5 h-3.5 text-emerald-600 animate-spin" />}
                  </div>
                  <p className="text-xs font-bold text-slate-900">{m.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-Column Grid: Grant Details + Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Grant Disbursal Schedule */}
          <div className="lg:col-span-7 p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Startup India Seed Fund Scheme (SISFS) Tranches
              </h3>
              <span className="text-xs text-slate-400 font-mono">DPIIT Portal Synchronized</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Tranche 1 (Advance for Prototyping)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Disbursed
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Disbursed on 15 Feb 2026 via PFMS Direct Benefit Transfer
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">₹12,50,000</span>
                  <p className="text-[10px] text-emerald-600 font-semibold">Cleared</p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Tranche 2 (Field Trial & IP Filing)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Eligible to Claim
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Requires Utilization Certificate (UC) & Milestone Review
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-800 text-sm">₹12,50,000</span>
                  <button
                    onClick={() => setTrancheModalOpen(true)}
                    className="block text-[11px] text-emerald-700 font-semibold hover:underline mt-0.5"
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
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-700">Schedule Mentor Office Hour</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              </button>

              <button
                onClick={() => alert('Reserved 3D Prototyping Cleanroom for tomorrow 10:00 AM - 2:00 PM.')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-700">Book Testing Equipment</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              </button>
            </div>
          </div>

          {/* Right Column: Directorate Announcements */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                Directorate Noticeboard
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Live Broadcasts</span>
            </div>

            <div className="space-y-3">
              {announcements.map((anc) => (
                <div key={anc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {anc.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(anc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{anc.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{anc.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Tranche Claim Modal */}
      {trancheModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-6 text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Apply for Tranche 2 Disbursal (₹12,50,000)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload your CA-Certified Utilization Certificate (UC) and milestone completion report for {user?.startup_name || 'your venture'}.
            </p>

            {trancheSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-800">Tranche 2 Claim Submitted!</h4>
                <p className="text-xs text-slate-600">
                  The Incubation Director and DST Evaluation Committee will inspect your milestone report within 5 business days.
                </p>
                <button
                  onClick={() => {
                    setTrancheSubmitted(false);
                    setTrancheModalOpen(false);
                  }}
                  className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
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
                  <label className="block text-slate-700 font-semibold mb-1">
                    Milestone Completed
                  </label>
                  <input
                    type="text"
                    defaultValue="Hardware Prototyping & Sensor Validation (Bay 4B)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Utilization Certificate (UC) PDF Link / File Reference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/uc-tranche1.pdf"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Key Achievements & Lab Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe testing results, patents filed, or pilot engagements..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setTrancheModalOpen(false)}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
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
