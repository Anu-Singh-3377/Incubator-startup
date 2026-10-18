import React from 'react';
import {
  LogOut,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Compass,
  FileText,
  DollarSign,
  Cpu,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardView({ user, onLogout }) {
  if (!user) return null;

  const isFounder = user.role === 'founder';
  const isMentor = user.role === 'mentor';
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar with Indian Flag Accent */}
      <div className="w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
      
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-white shadow-md">
            VB
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">
                VentureBharat Incubation Portal
              </h2>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                isFounder
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                  : isMentor
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {user.role} Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AIC VentureBharat Foundation • DST & NITI Aayog Recognized
            </p>
          </div>
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 text-right">
            <div>
              <p className="text-xs font-bold text-slate-200">{user.name}</p>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                {user.email}
              </p>
            </div>
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user.name}
              className="w-9 h-9 rounded-full border border-slate-700 object-cover"
            />
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 border border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-medium text-slate-300 mb-2 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Portal Session • 256-bit Encrypted</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Namaste, {user.name} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {isFounder && `Incubated Startup: ${user.startupName || 'DeepTech Innovator'} (${user.dpiitNumber || 'DPIIT Registered'})`}
                {isMentor && `${user.designation || 'Principal Mentor'} • ${user.organization || 'Ecosystem Partner'}`}
                {isAdmin && `${user.designation || 'Head of Incubation'} • ${user.department || 'Central Directorate'}`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                Cohort: {user.cohort || 'Cohort 12'}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Gateway</span>
              </span>
            </div>
          </div>
        </div>

        {/* ================= FOUNDER VIEW ================= */}
        {isFounder && (
          <div className="space-y-6">
            {/* Startup Milestones Tracker */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-bold text-white">Incubation Lifecycle Milestones</h3>
                </div>
                <span className="text-xs text-orange-400 font-semibold bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20">
                  Stage 2 of 5: Prototype Validation
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { step: '01', name: 'Ideation & Screening', done: true },
                  { step: '02', name: 'Lab Prototyping', active: true },
                  { step: '03', name: 'Pilot Testing in India', done: false },
                  { step: '04', name: 'Seed Grant Disbursal', done: false },
                  { step: '05', name: 'Cohort Demo Day', done: false }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-center ${
                      s.done
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : s.active
                        ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] font-mono mb-1">{s.step}</div>
                    <div className="text-xs">{s.name}</div>
                    {s.done && <CheckCircle2 className="w-3.5 h-3.5 mx-auto mt-1 text-emerald-400" />}
                    {s.active && <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mt-1 animate-pulse" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Sanctioned Govt Grant (SISFS)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">₹25,00,000</div>
                <p className="text-xs text-slate-400">
                  Tranche 1 Disbursed: ₹12.5 Lakh • Milestone verification in progress
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Dedicated Mentorship</span>
                  <Compass className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-lg font-bold text-white">Dr. Radhika Iyer</div>
                <p className="text-xs text-slate-400">
                  Next review: Friday 3:30 PM IST (DeepTech Commercialization)
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Lab & Co-Working Access</span>
                  <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-lg font-bold text-white">IoT Bay 4B & Cleanroom</div>
                <p className="text-xs text-slate-400">
                  Hardware Testing Lab & 3D Prototyping bench active 24/7
                </p>
              </div>
            </div>

            {/* Quick Founder Actions */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3">Startup Founder Action Center</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs transition flex items-center justify-between group">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="font-medium text-slate-200">Upload Monthly Progress Report</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                </button>

                <button className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs transition flex items-center justify-between group">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-slate-200">Schedule Mentor Office Hours</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                </button>

                <button className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs transition flex items-center justify-between group">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-slate-200">Book High-Performance Lab Bay</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MENTOR VIEW ================= */}
        {isMentor && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Assigned Cohort Startups</span>
                <div className="text-2xl font-bold text-white mt-1">6 DeepTech Ventures</div>
                <p className="text-xs text-emerald-400 mt-1">2 Ready for Angel Pitching</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Mentorship Hours Completed</span>
                <div className="text-2xl font-bold text-white mt-1">42.5 Hours</div>
                <p className="text-xs text-slate-400 mt-1">Quarter 1 • On track with AIC target</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Upcoming Pitch Sessions</span>
                <div className="text-2xl font-bold text-white mt-1">3 This Week</div>
                <p className="text-xs text-orange-400 mt-1">Next: KisanSetu DeepTech</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3">Mentees Under Guidance</h3>
              <div className="space-y-2">
                {[
                  { name: 'KisanSetu DeepTech Labs', founder: 'Aarav Sharma', sector: 'AgriTech AI', stage: 'Tranche 1 Cleared' },
                  { name: 'NeuraHealth Diagnostics', founder: 'Dr. Priya V.', sector: 'MedTech / BioSensors', stage: 'Patent Approved' },
                  { name: 'AeroVolt Drones', founder: 'Karthik N.', sector: 'Aerospace & Defence', stage: 'Field Pilot' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{item.name}</p>
                      <p className="text-slate-400 text-[11px]">Founder: {item.founder} • {item.sector}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      {item.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN VIEW ================= */}
        {isAdmin && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Total Startups Incubated</span>
                <div className="text-2xl font-bold text-white mt-1">248</div>
                <p className="text-xs text-emerald-400 mt-1">32 Current Cohort</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Govt Grants Disbursed</span>
                <div className="text-2xl font-bold text-white mt-1">₹34.8 Cr</div>
                <p className="text-xs text-slate-400 mt-1">SISFS, PRAYAS & EIR</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Patents & IPR Filed</span>
                <div className="text-2xl font-bold text-white mt-1">87</div>
                <p className="text-xs text-blue-400 mt-1">National & International</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Cohort 13 Applications</span>
                <div className="text-2xl font-bold text-white mt-1">418</div>
                <p className="text-xs text-orange-400 mt-1">Screening Phase Open</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3">Admin Governance & Approvals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">NIDHI-PRAYAS Tranche 2 Disbursal</span>
                    <span className="text-amber-400 font-semibold">Pending Approval</span>
                  </div>
                  <p className="text-slate-400">KisanSetu DeepTech Labs • Milestone verification report received</p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">DST Annual Utilization Certificate</span>
                    <span className="text-emerald-400 font-semibold">Ready for E-Sign</span>
                  </div>
                  <p className="text-slate-400">Audited Financials FY 2025-26 • AIC Board Resolution</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

