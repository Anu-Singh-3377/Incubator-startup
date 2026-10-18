import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  LogOut,
  Bell,
  Database,
  Building,
  Award,
  ExternalLink,
  ChevronRight,
  Send
} from 'lucide-react';
import { supabaseService, isSupabaseConfigured } from '../lib/supabaseClient';

export default function AdminDashboard({ user, onLogout, onOpenGuide }) {
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'startups' | 'broadcast'
  const [applications, setApplications] = useState([]);
  const [startups, setStartups] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    content: '',
    category: 'Grant',
    priority: 'normal'
  });
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    supabaseService.getApplications().then(setApplications);
    supabaseService.getStartups().then(setStartups);
    supabaseService.getAnnouncements().then(setAnnouncements);
  }, []);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await supabaseService.updateApplicationStatus(appId, newStatus, `Updated by ${user.full_name || 'Admin'}`);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      alert('Error updating application: ' + err.message);
    }
  };

  const handlePostBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.content) return;

    try {
      const newAnc = await supabaseService.postAnnouncement(
        broadcastForm.title,
        broadcastForm.content,
        broadcastForm.category,
        broadcastForm.priority
      );
      setAnnouncements((prev) => [newAnc, ...prev]);
      setBroadcastForm({ title: '', content: '', category: 'Grant', priority: 'normal' });
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
    } catch (err) {
      alert('Failed to post announcement: ' + err.message);
    }
  };

  const filteredStartups = startups.filter((s) => {
    const matchesSearch =
      s.startup_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.founder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dpiit_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'All' || s.sector.includes(sectorFilter);
    return matchesSearch && matchesSector;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Indian National Tricolor Ribbon */}
      <div className="w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white shadow-md">
            VB
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                VentureBharat Incubation
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Admin & Governance Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              National Incubation Management Directorate • AIM (NITI Aayog) & DST
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenGuide}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs border font-mono ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Demo Mode Active'}</span>
          </button>

          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-white">{user.full_name || 'Col. Vikramaditya Rathore'}</p>
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
        
        {/* Admin Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-400 mb-2 border border-slate-700">
                <Shield className="w-3.5 h-3.5" />
                <span>Super Administrator Gateway</span>
                <span className="text-slate-500">•</span>
                <span>Audit FY 2025-26</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Executive Incubation Operations
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Overseeing <strong className="text-white">248 Incubated Startups</strong>, Cohort 13 Admissions & DST/SISFS Grant Disbursals.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('broadcast')}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Broadcast Announcement</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core Admin KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Startups Incubated</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">248</div>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">
              32 in Active Cohort 12
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Govt Grants Disbursed</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">₹34.8 Cr</div>
            <p className="text-[11px] text-slate-400 mt-1">
              SISFS, PRAYAS & EIR Grants
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Cohort 13 Applications</span>
              <FileCheck className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-extrabold text-orange-400">418</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Screening & Due Diligence Open
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Cleanroom & Lab Occupancy</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">88%</div>
            <p className="text-[11px] text-blue-300 mt-1">
              14 Testing Bays Allocated
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'applications'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Cohort 13 Applications Pipeline ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('startups')}
            className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'startups'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Incubated Startups Directory ({startups.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'broadcast'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Broadcast Announcements</span>
          </button>
        </div>

        {/* TAB 1: COHORT APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Evaluating candidate ventures for <strong className="text-white">Cohort 13 (Autumn 2026)</strong>. Status changes reflect immediately in the database.
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                {applications.filter((a) => a.status === 'Accepted').length} Accepted / {applications.length} Reviewed
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-bold text-white">{app.startup_name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {app.dpiit_number || 'DPIIT Verified'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          app.status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : app.status === 'Interview Scheduled'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : app.status === 'Rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Founder: <strong className="text-slate-200">{app.founder_name}</strong> • Sector: <span className="text-orange-400">{app.sector}</span> • Contact: <span className="font-mono">{app.founder_email}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="text-right mr-2 hidden sm:block">
                        <span className="text-[10px] text-slate-400 uppercase">Evaluation Score</span>
                        <div className="text-lg font-black text-emerald-400">{app.evaluation_score || 90}/100</div>
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(app.id, 'Accepted')}
                        className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(app.id, 'Interview Scheduled')}
                        className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Interview
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg text-xs font-semibold transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                    "{app.pitch_summary}"
                  </p>

                  {app.review_notes && (
                    <p className="text-[11px] text-slate-400 italic">
                      Review Note: {app.review_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: INCUBATED STARTUPS DIRECTORY */}
        {activeTab === 'startups' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Startup, Founder, or DPIIT Number..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
              >
                <option value="All">All Sectors</option>
                <option value="AgriTech">AgriTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="CleanTech">CleanTech</option>
                <option value="DeepTech">DeepTech</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Startup Name</th>
                    <th className="p-3.5">Founder</th>
                    <th className="p-3.5">Sector</th>
                    <th className="p-3.5">Sanctioned Grant</th>
                    <th className="p-3.5">Disbursed</th>
                    <th className="p-3.5">Stage</th>
                    <th className="p-3.5">Assigned Mentor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredStartups.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-850 transition">
                      <td className="p-3.5 font-bold text-white">
                        {st.startup_name}
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">
                          {st.dpiit_number || 'DPIIT Registered'}
                        </span>
                      </td>
                      <td className="p-3.5">{st.founder_name}</td>
                      <td className="p-3.5 text-orange-400">{st.sector}</td>
                      <td className="p-3.5 font-mono">₹{(st.sanctioned_grant / 100000).toFixed(1)} Lakh</td>
                      <td className="p-3.5 font-mono text-emerald-400">₹{(st.disbursed_grant / 100000).toFixed(1)} Lakh</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {st.stage}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{st.assigned_mentor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BROADCAST ANNOUNCEMENTS */}
        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                Broadcast Notice to All Incubated Startups
              </h3>
              <p className="text-xs text-slate-400">
                Published announcements appear instantly on the dashboards of all founders and innovators.
              </p>

              {broadcastSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Announcement successfully broadcasted!</span>
                </div>
              )}

              <form onSubmit={handlePostBroadcast} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Notice Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    placeholder="e.g. MeitY TIDE 2.0 Tranche 2 Disbursement Guidelines Released"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Category
                    </label>
                    <select
                      value={broadcastForm.category}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Grant">Govt Seed Grant (SISFS/PRAYAS)</option>
                      <option value="Lab">Cleanroom & Prototyping Lab</option>
                      <option value="Mentorship">Mentorship & Investor Pitch</option>
                      <option value="Compliance">DPIIT & MCA Compliance</option>
                      <option value="Event">Cohort Demo Day / Hackathon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Priority Level
                    </label>
                    <select
                      value={broadcastForm.priority}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High Alert</option>
                      <option value="urgent">Urgent Action Required</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Announcement Body
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastForm.content}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                    placeholder="Provide full instructions, milestone deadlines, or submission links for founders..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Announcement to All Portals</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white">Active Directorate Announcements</h4>
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {announcements.map((anc) => (
                  <div key={anc.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {anc.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(anc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-bold text-white">{anc.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{anc.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

