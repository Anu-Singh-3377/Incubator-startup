import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Search,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  History,
  Target
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';
import { ChartCard, AreaChart, STATUS, MUTED_MARK, formatINR } from './charts/Charts';

// ================= SHARED HELPERS =================
export const REPORT_STATUSES = [
  { key: 'On Track', color: STATUS.good, Icon: CheckCircle2, chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'Needs Attention', color: STATUS.warning, Icon: AlertCircle, chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'At Risk', color: STATUS.critical, Icon: AlertTriangle, chip: 'bg-rose-50 text-rose-700 border-rose-200' }
];
const statusMeta = (key) => REPORT_STATUSES.find((s) => s.key === key) || REPORT_STATUSES[0];

// Reports are keyed by the first day of the month: 'YYYY-MM-01'
export const monthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
const shiftMonth = (key, delta) => {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
};
export const monthLabel = (key, style = 'long') => {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', style === 'short' ? { month: 'short', year: '2-digit' } : { month: 'long', year: 'numeric' });
};
const normaliseMonth = (value) => (value ? `${String(value).slice(0, 7)}-01` : '');

// Average score per month, oldest first, for the trend chart
const scoreTrend = (reports, limit = 6) => {
  const byMonth = {};
  reports.forEach((r) => {
    const k = normaliseMonth(r.report_month);
    if (r.progress_score == null || !k) return;
    (byMonth[k] = byMonth[k] || []).push(Number(r.progress_score));
  });
  return Object.keys(byMonth)
    .sort()
    .slice(-limit)
    .map((k) => ({
      label: monthLabel(k, 'short'),
      value: Math.round(byMonth[k].reduce((a, b) => a + b, 0) / byMonth[k].length)
    }));
};

const EMPTY_FORM = {
  id: null,
  startup_id: '',
  report_month: monthKey(),
  work_summary: '',
  milestones_achieved: '',
  challenges: '',
  next_month_goals: '',
  progress_score: 50,
  status: 'On Track',
  revenue_inr: '',
  team_size: '',
  syncMilestone: true
};

// ================= ADMIN: MONTHLY WORK LOG =================
export default function MonthlyProgress({ startups = [], reports = [], currentUser, onChanged }) {
  const [month, setMonth] = useState(monthKey());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | status key | 'Not logged'
  const [form, setForm] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [historyFor, setHistoryFor] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const monthReports = reports.filter((r) => normaliseMonth(r.report_month) === month);
  const reportFor = (startupId) => monthReports.find((r) => r.startup_id === startupId);
  const loggedCount = startups.filter((s) => reportFor(s.id)).length;
  const notLogged = startups.length - loggedCount;
  const scored = monthReports.filter((r) => r.progress_score != null);
  const avgScore = scored.length ? Math.round(scored.reduce((a, r) => a + Number(r.progress_score), 0) / scored.length) : null;
  const statusCounts = REPORT_STATUSES.map((st) => ({
    ...st,
    count: startups.filter((s) => reportFor(s.id)?.status === st.key).length
  }));
  const trend = scoreTrend(reports);
  const isFutureMonth = month > monthKey();

  const rows = startups
    .filter((s) => {
      const term = search.toLowerCase();
      const matchSearch =
        !term || s.startup_name?.toLowerCase().includes(term) || s.founder_name?.toLowerCase().includes(term) || s.sector?.toLowerCase().includes(term);
      const rep = reportFor(s.id);
      const matchStatus =
        statusFilter === 'All' || (statusFilter === 'Not logged' ? !rep : rep?.status === statusFilter);
      return matchSearch && matchStatus;
    })
    .sort((a, b) => Number(Boolean(reportFor(a.id))) - Number(Boolean(reportFor(b.id))) || (a.startup_name || '').localeCompare(b.startup_name || ''));

  const openForm = (startup, existing) => {
    setFormErrors({});
    setForm(
      existing
        ? {
            ...EMPTY_FORM,
            ...existing,
            report_month: normaliseMonth(existing.report_month),
            revenue_inr: existing.revenue_inr ?? '',
            team_size: existing.team_size ?? '',
            progress_score: existing.progress_score ?? 50,
            syncMilestone: true
          }
        : {
            ...EMPTY_FORM,
            startup_id: startup?.id || '',
            report_month: month,
            progress_score: Number(startup?.milestone_progress ?? 50)
          }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.startup_id) errs.startup_id = 'Choose a startup.';
    if (!form.report_month) errs.report_month = 'Choose a month.';
    if (!form.work_summary.trim() || form.work_summary.trim().length < 10) errs.work_summary = 'Describe the work done (at least 10 characters).';
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    const startup = startups.find((s) => s.id === form.startup_id);
    const score = Math.max(0, Math.min(100, Number(form.progress_score) || 0));
    setSaving(true);
    try {
      await supabaseService.saveMonthlyReport({
        ...(form.id ? { id: form.id } : {}),
        startup_id: form.startup_id,
        startup_name: startup?.startup_name || form.startup_name || '',
        report_month: form.report_month,
        work_summary: form.work_summary.trim(),
        milestones_achieved: form.milestones_achieved.trim() || null,
        challenges: form.challenges.trim() || null,
        next_month_goals: form.next_month_goals.trim() || null,
        progress_score: score,
        status: form.status,
        revenue_inr: form.revenue_inr === '' ? null : Number(form.revenue_inr),
        team_size: form.team_size === '' ? null : Number(form.team_size),
        recorded_by: currentUser?.full_name || currentUser?.email || 'Incubation Manager'
      });
      // Optionally mirror the score onto the startup's milestone progress (existing field)
      if (form.syncMilestone && startup && Number(startup.milestone_progress) !== score) {
        await supabaseService.updateStartup(startup.id, { milestone_progress: score });
      }
      setForm(null);
      showToast(`Saved ${monthLabel(form.report_month)} report for ${startup?.startup_name || 'startup'}.`);
      if (onChanged) await onChanged();
    } catch (err) {
      showToast('Could not save report: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (report) => {
    if (!window.confirm(`Delete the ${monthLabel(normaliseMonth(report.report_month))} report for ${report.startup_name}?`)) return;
    try {
      await supabaseService.deleteMonthlyReport(report.id);
      showToast('Report deleted.');
      if (onChanged) await onChanged();
    } catch (err) {
      showToast('Could not delete report: ' + err.message, 'error');
    }
  };

  const historyReports = historyFor ? reports.filter((r) => r.startup_id === historyFor.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <span>Portfolio Monitoring</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Monthly Progress Log</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Record the work each startup completed every month. Founders see their own reports on their dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
            <button onClick={() => setMonth(shiftMonth(month, -1))} className="p-2 text-slate-500 hover:text-slate-900" title="Previous month" aria-label="Previous month">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <label className="flex items-center gap-1.5 px-1 text-xs font-bold text-slate-800">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <span className="sr-only">Reporting month</span>
              <input
                type="month"
                value={month.slice(0, 7)}
                onChange={(e) => e.target.value && setMonth(normaliseMonth(e.target.value))}
                className="bg-transparent py-1.5 text-xs font-bold focus:outline-none"
              />
            </label>
            <button onClick={() => setMonth(shiftMonth(month, 1))} className="p-2 text-slate-500 hover:text-slate-900" title="Next month" aria-label="Next month">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => openForm(null, null)}
            disabled={startups.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            Log monthly work
          </button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: `Logged for ${monthLabel(month, 'short')}`,
            value: `${loggedCount} / ${startups.length}`,
            hint: notLogged > 0 ? `${notLogged} still to log` : startups.length ? 'Every startup logged' : 'No startups yet'
          },
          { label: 'Average progress score', value: avgScore == null ? '–' : `${avgScore}%`, hint: scored.length ? `Across ${scored.length} report${scored.length === 1 ? '' : 's'}` : 'No reports this month' },
          { label: 'On track', value: statusCounts[0].count, hint: 'Startups meeting plan' },
          { label: 'Need follow-up', value: statusCounts[1].count + statusCounts[2].count, hint: `${statusCounts[2].count} at risk` }
        ].map((k) => (
          <div key={k.label} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <p className="text-[12px] font-semibold text-slate-500">{k.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{k.value}</p>
            <p className="text-[12px] text-slate-500 mt-0.5">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartCard title="Average progress score by month" subtitle="Mean of the scores you recorded, last 6 months" icon={TrendingUp} className="lg:col-span-3">
          {trend.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">No scored reports yet. Log a month to start the trend.</p>
          ) : (
            <AreaChart points={trend} seriesLabel="Avg score" valueFormat={(v) => `${v}%`} />
          )}
        </ChartCard>

        <ChartCard title={`Status for ${monthLabel(month)}`} subtitle="Click a status to filter the list below" icon={Target} className="lg:col-span-2">
          {startups.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">Add startups to the portfolio to start logging.</p>
          ) : (
            <>
              <div className="flex h-3 w-full gap-[2px] rounded-full overflow-hidden bg-slate-100" role="img" aria-label={`${loggedCount} of ${startups.length} startups logged`}>
                {[...statusCounts, { key: 'Not logged', color: MUTED_MARK, count: notLogged }].map((st) =>
                  st.count > 0 ? <div key={st.key} style={{ width: `${(st.count / startups.length) * 100}%`, background: st.color }} /> : null
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[...statusCounts, { key: 'Not logged', color: MUTED_MARK, count: notLogged }].map((st) => {
                  const selected = statusFilter === st.key;
                  return (
                    <button
                      key={st.key}
                      onClick={() => setStatusFilter(selected ? 'All' : st.key)}
                      aria-pressed={selected}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition ${
                        selected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/15' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: st.color }} />
                        {st.key}
                      </span>
                      <strong className="text-slate-900 tabular-nums">{st.count}</strong>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Coverage table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Startups for {monthLabel(month)}</h3>
            <p className="text-xs text-slate-500">
              {isFutureMonth ? 'This month has not started yet.' : 'Startups without a report are listed first.'}
              {statusFilter !== 'All' && (
                <button onClick={() => setStatusFilter('All')} className="ml-2 font-semibold text-emerald-700 hover:text-emerald-800">
                  Clear filter ({statusFilter})
                </button>
              )}
            </p>
          </div>
          <div className="relative md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search startup, founder or sector..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Startup</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Work done this month</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    {startups.length === 0 ? 'No startups in the portfolio yet.' : 'No startups match this filter.'}
                  </td>
                </tr>
              ) : (
                rows.map((s) => {
                  const rep = reportFor(s.id);
                  const meta = rep ? statusMeta(rep.status) : null;
                  return (
                    <tr key={s.id}>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{s.startup_name}</span>
                        <span className="text-[12px] text-slate-500">{s.founder_name}{s.sector ? ` • ${s.sector}` : ''}</span>
                      </td>
                      <td className="py-3 px-4">
                        {meta ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${meta.chip}`}>
                            <meta.Icon className="w-3 h-3" />
                            {rep.status}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border border-slate-200 bg-slate-50 text-slate-600 whitespace-nowrap">
                            Not logged
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 w-32">
                        {rep?.progress_score != null ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${rep.progress_score}%`, background: meta.color }} />
                            </div>
                            <span className="font-bold text-slate-800 tabular-nums">{rep.progress_score}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">–</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-slate-700 line-clamp-2" title={rep?.work_summary || ''}>
                          {rep?.work_summary || <span className="text-slate-500">No work recorded for this month.</span>}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openForm(s, rep)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-[12px] flex items-center gap-1 ${
                              rep ? 'border border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {rep ? <Pencil className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}
                            {rep ? 'Edit' : 'Log work'}
                          </button>
                          <button
                            onClick={() => setHistoryFor(s)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                            title={`All monthly reports for ${s.startup_name}`}
                            aria-label={`History for ${s.startup_name}`}
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= LOG / EDIT MODAL ================= */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSave} className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{form.id ? 'Edit monthly report' : 'Log monthly work'}</h3>
                <p className="text-xs text-slate-500">One report per startup per month. Saving again for the same month updates it.</p>
              </div>
              <button type="button" onClick={() => setForm(null)} className="p-1 rounded text-slate-500 hover:text-slate-700" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Startup <span className="text-rose-500">*</span></label>
                <select
                  value={form.startup_id}
                  disabled={Boolean(form.id)}
                  onChange={(e) => {
                    const st = startups.find((s) => s.id === e.target.value);
                    setForm({ ...form, startup_id: e.target.value, progress_score: Number(st?.milestone_progress ?? form.progress_score) });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs disabled:opacity-70"
                >
                  <option value="">Select startup…</option>
                  {startups.map((s) => (
                    <option key={s.id} value={s.id}>{s.startup_name}</option>
                  ))}
                </select>
                {formErrors.startup_id && <p className="text-rose-500 text-[11px] mt-1">{formErrors.startup_id}</p>}
              </div>
              <div>
                <label htmlFor="mp-month" className="block font-semibold text-slate-700 mb-1">Month <span className="text-rose-500">*</span></label>
                <input
                  id="mp-month"
                  type="month"
                  value={form.report_month.slice(0, 7)}
                  disabled={Boolean(form.id)}
                  onChange={(e) => setForm({ ...form, report_month: normaliseMonth(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs disabled:opacity-70"
                />
                {formErrors.report_month && <p className="text-rose-500 text-[11px] mt-1">{formErrors.report_month}</p>}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work done this month <span className="text-rose-500">*</span></label>
              <textarea
                rows={4}
                value={form.work_summary}
                onChange={(e) => setForm({ ...form, work_summary: e.target.value })}
                placeholder="What the team built, shipped, tested or closed this month…"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              {formErrors.work_summary && <p className="text-rose-500 text-[11px] mt-1">{formErrors.work_summary}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Milestones achieved</label>
                <textarea rows={2} value={form.milestones_achieved} onChange={(e) => setForm({ ...form, milestones_achieved: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Challenges / blockers</label>
                <textarea rows={2} value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Goals for next month</label>
              <textarea rows={2} value={form.next_month_goals} onChange={(e) => setForm({ ...form, next_month_goals: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="mp-score" className="flex items-center justify-between font-semibold text-slate-700 mb-1">
                  <span>Progress score</span>
                  <span className="font-black text-emerald-700 tabular-nums">{form.progress_score}%</span>
                </label>
                <input
                  id="mp-score"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={form.progress_score}
                  onChange={(e) => setForm({ ...form, progress_score: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>
              <div>
                <span className="block font-semibold text-slate-700 mb-1">Overall status</span>
                <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Overall status">
                  {REPORT_STATUSES.map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      role="radio"
                      aria-checked={form.status === st.key}
                      onClick={() => setForm({ ...form, status: st.key })}
                      className={`px-2 py-2 rounded-lg border text-[12px] font-bold flex items-center justify-center gap-1 ${
                        form.status === st.key ? st.chip + ' ring-2 ring-offset-1 ring-emerald-500/20' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <st.Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{st.key}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Revenue this month (₹, optional)</label>
                <input type="number" min="0" value={form.revenue_inr} onChange={(e) => setForm({ ...form, revenue_inr: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team size (optional)</label>
                <input type="number" min="0" value={form.team_size} onChange={(e) => setForm({ ...form, team_size: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              </div>
            </div>

            <label className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 cursor-pointer">
              <input
                type="checkbox"
                checked={form.syncMilestone}
                onChange={(e) => setForm({ ...form, syncMilestone: e.target.checked })}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700">
                Also set this startup's <strong>milestone progress</strong> to {form.progress_score}% (shown on the startup portfolio).
              </span>
            </label>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg disabled:opacity-50">
                {saving ? 'Saving…' : form.id ? 'Update report' : 'Save report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= STARTUP HISTORY MODAL ================= */}
      {historyFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">{historyFor.startup_name}</h3>
                <p className="text-xs text-slate-500">
                  {historyReports.length} monthly report{historyReports.length === 1 ? '' : 's'} on record
                </p>
              </div>
              <button onClick={() => setHistoryFor(null)} className="p-1 rounded text-slate-500 hover:text-slate-700" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {historyReports.length >= 2 && (
                <div className="mb-4">
                  <AreaChart points={scoreTrend(historyReports, 12)} seriesLabel="Score" valueFormat={(v) => `${v}%`} height={150} />
                </div>
              )}
              <ReportTimeline
                reports={historyReports}
                emptyText="No reports yet for this startup."
                onEdit={(r) => { setHistoryFor(null); openForm(historyFor, r); }}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 left-5 sm:left-auto z-[60] max-w-sm px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-start gap-2 ${
            toast.tone === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-emerald-200 text-slate-800'
          }`}
        >
          {toast.tone === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

// ================= SHARED: REPORT TIMELINE =================
function ReportTimeline({ reports, emptyText, onEdit, onDelete }) {
  if (reports.length === 0) return <p className="py-6 text-center text-xs text-slate-500">{emptyText}</p>;
  return (
    <ol className="space-y-3">
      {reports.map((r) => {
        const meta = statusMeta(r.status);
        return (
          <li key={r.id} className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{monthLabel(normaliseMonth(r.report_month))}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${meta.chip}`}>
                  <meta.Icon className="w-3 h-3" />
                  {r.status}
                </span>
                {r.progress_score != null && <span className="font-bold text-slate-700 tabular-nums">{r.progress_score}%</span>}
              </div>
              {(onEdit || onDelete) && (
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <button onClick={() => onEdit(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Edit report" aria-label="Edit report">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(r)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600" title="Delete report" aria-label="Delete report">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{r.work_summary}</p>
            {(r.milestones_achieved || r.challenges || r.next_month_goals) && (
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  ['Milestones', r.milestones_achieved],
                  ['Challenges', r.challenges],
                  ['Next month', r.next_month_goals]
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{k}</dt>
                      <dd className="text-slate-700 mt-0.5 whitespace-pre-line">{v}</dd>
                    </div>
                  ))}
              </dl>
            )}
            {(r.revenue_inr != null || r.team_size != null || r.recorded_by) && (
              <p className="text-[12px] text-slate-500">
                {[
                  r.revenue_inr != null && `Revenue ${formatINR(r.revenue_inr)}`,
                  r.team_size != null && `Team of ${r.team_size}`,
                  r.recorded_by && `Recorded by ${r.recorded_by}`
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
