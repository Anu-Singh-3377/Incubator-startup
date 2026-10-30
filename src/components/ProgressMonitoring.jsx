import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Search,
  RotateCcw,
  RefreshCw,
  BarChart3,
  Inbox,
  Building2,
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  TrendingUp,
  Layers,
  ChevronRight,
  ArrowDownWideNarrow,
  Info
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';
import {
  TASK_STATUSES,
  STATUS_NOT_STARTED,
  STATUS_IN_PROGRESS,
  STATUS_SUBMITTED,
  STATUS_VERIFIED,
  STATUS_CHANGES,
  statusMeta,
  summarize,
  stageBreakdown,
  monthlyTrend,
  activeMonths,
  lastMonths,
  monthLabel,
  toMonthKey,
  formatDate
} from '../lib/progressMetrics';
import { ChartCard, ProgressRing, DonutChart, HBarChart, LineChart, StackedBarChart } from './charts/Charts';
import { StatusBadge, SubmissionFacts, SubmissionHistory, Toast, useToast, StatTile } from './ProgressShared';

const EMPTY_FILTERS = { search: '', cohort: 'All', month: 'All', from: '', to: '', stage: 'All', status: 'All' };
const STACK_SERIES = TASK_STATUSES.map((s) => ({ key: s.key, label: s.short, color: s.color }));

export default function ProgressMonitoring({ startups = [] }) {
  const [program, setProgram] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [tab, setTab] = useState('analytics'); // analytics | queue | startups
  const [sort, setSort] = useState('desc'); // desc | asc | name
  const [showReviewed, setShowReviewed] = useState(false);
  const [reviewId, setReviewId] = useState(null);
  const [startupFor, setStartupFor] = useState(null);
  const [toast, showToast] = useToast();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [prog, subs] = await Promise.all([supabaseService.getMilestoneProgram(), supabaseService.getTaskSubmissions()]);
      setProgram(prog);
      setSubmissions(subs);
      setError('');
      setLastSync(new Date());
    } catch (err) {
      setError(err.message || 'Could not load progress data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return supabaseService.subscribeToTaskSubmissions(() => load(true));
  }, [load]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  const stages = program?.stages || [];
  const tasks = program?.tasks || [];
  const taskById = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const stageById = Object.fromEntries(stages.map((s) => [s.id, s]));
  const startupById = Object.fromEntries(startups.map((s) => [s.id, s]));
  const cohorts = [...new Set(startups.map((s) => s.cohort).filter(Boolean))].sort();
  const months = activeMonths(submissions);

  // ---------- filtering (population: startup, cohort, stage; records: month, dates, status) ----------
  const term = filters.search.trim().toLowerCase();
  const startupsF = startups.filter(
    (s) =>
      (!term || s.startup_name?.toLowerCase().includes(term) || s.founder_name?.toLowerCase().includes(term)) &&
      (filters.cohort === 'All' || s.cohort === filters.cohort)
  );
  const startupIdsF = new Set(startupsF.map((s) => s.id));
  const tasksF = filters.stage === 'All' ? tasks : tasks.filter((t) => t.stage_id === filters.stage);
  const taskIdsF = new Set(tasksF.map((t) => t.id));
  const inPopulation = (s) => startupIdsF.has(s.startup_id) && taskIdsF.has(s.task_id);
  const inDates = (s) => {
    const d = (s.submitted_at || '').slice(0, 10);
    if (filters.from && (!d || d < filters.from)) return false;
    if (filters.to && (!d || d > filters.to)) return false;
    return true;
  };
  const subsForTrend = submissions.filter((s) => inPopulation(s) && (filters.status === 'All' || s.status === filters.status));
  const subsF = subsForTrend.filter(
    (s) => (filters.month === 'All' || toMonthKey(s.reporting_month) === filters.month) && inDates(s)
  );

  // ---------- aggregates (all from the same filtered records) ----------
  const perStartup = startupsF.map((st) => {
    const rows = subsF.filter((s) => s.startup_id === st.id);
    return { startup: st, rows, summary: summarize(tasksF, rows) };
  });
  const totals = {
    submitted: subsF.filter((s) => s.submitted_at).length,
    awaiting: subsF.filter((s) => s.status === STATUS_SUBMITTED).length,
    verified: subsF.filter((s) => s.status === STATUS_VERIFIED).length,
    changes: subsF.filter((s) => s.status === STATUS_CHANGES).length
  };
  const statusTotals = TASK_STATUSES.map((st) => ({
    label: st.key,
    color: st.color,
    value:
      st.key === STATUS_NOT_STARTED
        ? perStartup.reduce((sum, p) => sum + p.summary.notStarted, 0)
        : subsF.filter((s) => s.status === st.key).length
  }));
  const sortedPerStartup = [...perStartup].sort((a, b) =>
    sort === 'name'
      ? (a.startup.startup_name || '').localeCompare(b.startup.startup_name || '')
      : sort === 'asc'
      ? a.summary.completionPct - b.summary.completionPct
      : b.summary.completionPct - a.summary.completionPct
  );
  const stageRows = stages
    .filter((st) => filters.stage === 'All' || st.id === filters.stage)
    .map((st) => {
      const stTasks = tasks.filter((t) => t.stage_id === st.id);
      const values = Object.fromEntries(TASK_STATUSES.map((s) => [s.key, 0]));
      perStartup.forEach(({ rows }) => {
        const sum = summarize(stTasks, rows);
        TASK_STATUSES.forEach((s) => (values[s.key] += sum.counts[s.key] || 0));
      });
      const planned = stTasks.length * startupsF.length;
      return { label: st.title, stageId: st.id, values, caption: `${values[STATUS_VERIFIED]}/${planned} verified` };
    });
  const trend = monthlyTrend(subsForTrend.filter(inDates), lastMonths(12));
  const queue = subsF
    .filter((s) => (showReviewed ? s.status === STATUS_VERIFIED || s.status === STATUS_CHANGES : s.status === STATUS_SUBMITTED))
    .sort((a, b) =>
      showReviewed ? (b.reviewed_at || '').localeCompare(a.reviewed_at || '') : (a.submitted_at || '').localeCompare(b.submitted_at || '')
    );
  const reviewSubmission = reviewId ? submissions.find((s) => s.id === reviewId) : null;

  // ---------- render ----------
  if (loading && !program) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500" aria-busy="true">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
        Loading startup progress…
      </div>
    );
  }

  if (error && !program) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-sm">Startup progress monitoring is unavailable</p>
          <p className="mt-1">{error}</p>
        </div>
        <button onClick={() => load()} className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-semibold hover:bg-amber-50 flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const selectCls = 'px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 w-full';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Incubation Progress Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Startup Progress Monitoring</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Activities founders submit from their lifecycle journey. Verify them or request changes; founders see your decision instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            {lastSync && <span className="font-normal text-emerald-800">· {lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
          </span>
          <button onClick={() => load(true)} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50" title="Refresh now" aria-label="Refresh now">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Search startup or founder…"
              aria-label="Search startup or founder"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <select value={filters.cohort} onChange={(e) => setFilter('cohort', e.target.value)} aria-label="Cohort" className={selectCls}>
            <option value="All">All cohorts</option>
            {cohorts.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={filters.month} onChange={(e) => setFilter('month', e.target.value)} aria-label="Reporting month" className={selectCls}>
            <option value="All">All reporting months</option>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <select value={filters.stage} onChange={(e) => setFilter('stage', e.target.value)} aria-label="Incubation stage" className={selectCls}>
            <option value="All">All stages</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Activity status" className={selectCls}>
            <option value="All">All statuses</option>
            {TASK_STATUSES.filter((s) => s.key !== STATUS_NOT_STARTED).map((s) => (
              <option key={s.key} value={s.key}>{s.key}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-[12px] text-slate-600">
            <span className="shrink-0">From</span>
            <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilter('from', e.target.value)} className={selectCls} />
          </label>
          <label className="flex items-center gap-2 text-[12px] text-slate-600">
            <span className="shrink-0">To</span>
            <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilter('to', e.target.value)} className={selectCls} />
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] text-slate-500 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Completion % = admin-verified activities ÷ planned activities ({tasksF.length} per startup{filters.stage !== 'All' ? ' in this stage' : ''}). Month, date and status filters narrow the activity records counted.
          </p>
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            disabled={!filtersActive}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset filters
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatTile label="Startups" value={startupsF.length} hint={filtersActive ? `of ${startups.length} total` : 'In the portfolio'} />
        <StatTile label="Activities submitted" value={totals.submitted} hint="By founders" />
        <StatTile label="Awaiting review" value={totals.awaiting} hint="Need your decision" accent={statusMeta(STATUS_SUBMITTED).color} />
        <StatTile label="Verified" value={totals.verified} hint="Counted as complete" accent={statusMeta(STATUS_VERIFIED).color} />
        <StatTile label="Changes requested" value={totals.changes} hint="With founders" accent={statusMeta(STATUS_CHANGES).color} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto" role="tablist">
        {[
          { key: 'analytics', label: 'Analytics', Icon: BarChart3 },
          { key: 'queue', label: `Review queue (${subsF.filter((s) => s.status === STATUS_SUBMITTED).length})`, Icon: Inbox },
          { key: 'startups', label: 'Startup performance', Icon: Building2 }
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 whitespace-nowrap ${
              tab === key ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ================= ANALYTICS ================= */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          {submissions.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500" />
              Analytics will fill in as founders submit activities from their dashboards.
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <ChartCard
              title="Startup-wise progress comparison"
              subtitle="Verified completion per startup. Click a bar for its report."
              icon={Building2}
              className="lg:col-span-3"
              action={<SortControl sort={sort} setSort={setSort} />}
            >
              <div className="max-h-80 overflow-y-auto pr-1">
                <HBarChart
                  data={sortedPerStartup.map(({ startup, summary }) => ({
                    label: startup.startup_name,
                    value: summary.completionPct,
                    startup,
                    tooltip: [`${summary.verified}/${summary.planned} verified`, `${summary.awaiting} awaiting review`, startup.cohort || '']
                  }))}
                  max={100}
                  valueFormat={(v) => `${v}%`}
                  emptyText="No startups match these filters."
                  onBarClick={(d) => setStartupFor(d.startup)}
                />
              </div>
            </ChartCard>

            <ChartCard title="Task status distribution" subtitle="All planned activities. Click to filter." icon={Layers} className="lg:col-span-2">
              <DonutChart
                data={statusTotals}
                centerValue={statusTotals.reduce((a, s) => a + s.value, 0)}
                centerLabel="activities"
                selectedLabel={filters.status !== 'All' ? filters.status : null}
                onSegmentClick={(d) => d.label !== STATUS_NOT_STARTED && setFilter('status', filters.status === d.label ? 'All' : d.label)}
              />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Monthly progress trends" subtitle="Activities submitted and verified each month (last 12 months)" icon={TrendingUp}>
              <LineChart
                points={trend}
                series={[
                  { key: 'submitted', label: 'Submitted', color: statusMeta(STATUS_SUBMITTED).color },
                  { key: 'verified', label: 'Verified', color: statusMeta(STATUS_VERIFIED).color }
                ]}
                emptyText="No submissions in the last 12 months."
                onPointClick={(p) => months.includes(p.month) && setFilter('month', p.month)}
              />
            </ChartCard>

            <ChartCard title="Milestone performance" subtitle="Status of every planned activity by stage. Click a stage to filter." icon={Layers}>
              <StackedBarChart
                rows={stageRows}
                series={STACK_SERIES}
                onRowClick={(row) => setFilter('stage', filters.stage === row.stageId ? 'All' : row.stageId)}
                emptyText="No stages defined."
              />
            </ChartCard>
          </div>
        </div>
      )}

      {/* ================= REVIEW QUEUE ================= */}
      {tab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{showReviewed ? 'Previously reviewed activities' : 'Activities awaiting your review'}</h3>
              <p className="text-xs text-slate-500">{showReviewed ? 'Most recent decisions first.' : 'Oldest submissions first.'}</p>
            </div>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold self-start" role="group">
              <button onClick={() => setShowReviewed(false)} aria-pressed={!showReviewed} className={`px-3 py-1.5 rounded-lg ${!showReviewed ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}>
                Pending
              </button>
              <button onClick={() => setShowReviewed(true)} aria-pressed={showReviewed} className={`px-3 py-1.5 rounded-lg ${showReviewed ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}>
                Reviewed
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Startup</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">{showReviewed ? 'Reviewed' : 'Submitted'}</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      {showReviewed ? 'No reviewed activities match these filters.' : 'All caught up. No activities are waiting for review.'}
                    </td>
                  </tr>
                ) : (
                  queue.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{startupById[s.startup_id]?.startup_name || 'Unknown startup'}</span>
                        <span className="text-[12px] text-slate-500">{startupById[s.startup_id]?.cohort}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{taskById[s.task_id]?.title || s.task_id}</span>
                        <span className="text-[12px] text-slate-500">{stageById[taskById[s.task_id]?.stage_id]?.title}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} />
                        {s.submission_count > 1 && <span className="block text-[11px] text-slate-500 mt-1">Resubmission #{s.submission_count}</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{formatDate(showReviewed ? s.reviewed_at : s.submitted_at)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setReviewId(s.id)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                            s.status === STATUS_SUBMITTED ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {s.status === STATUS_SUBMITTED ? 'Review' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= STARTUP PERFORMANCE TABLE ================= */}
      {tab === 'startups' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Startup performance</h3>
            <SortControl sort={sort} setSort={setSort} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Startup</th>
                  <th className="py-3 px-4">Cohort</th>
                  <th className="py-3 px-4 text-right">Planned</th>
                  <th className="py-3 px-4 text-right">Submitted</th>
                  <th className="py-3 px-4 text-right">Verified</th>
                  <th className="py-3 px-4 text-right">Pending</th>
                  <th className="py-3 px-4">Completion</th>
                  <th className="py-3 px-4">Latest submission</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPerStartup.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-500">No startups match these filters.</td>
                  </tr>
                ) : (
                  sortedPerStartup.map(({ startup, summary }) => (
                    <tr key={startup.id} className="cursor-pointer" onClick={() => setStartupFor(startup)}>
                      <td className="py-3 px-4 font-bold text-slate-900">{startup.startup_name}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{startup.cohort || '–'}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{summary.planned}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{summary.submittedEver}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">{summary.verified}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-amber-700">{summary.awaiting}</td>
                      <td className="py-3 px-4 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${summary.completionPct}%` }} />
                          </div>
                          <span className="font-bold tabular-nums">{summary.completionPct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{formatDate(summary.latestSubmission) || '–'}</td>
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {startupFor && (
        <StartupProgressReport
          startup={startupFor}
          stages={stages}
          tasks={tasks}
          submissions={submissions.filter((s) => s.startup_id === startupFor.id)}
          onClose={() => setStartupFor(null)}
          onReview={(id) => setReviewId(id)}
        />
      )}

      {reviewSubmission && (
        <ReviewPanel
          submission={reviewSubmission}
          startup={startupById[reviewSubmission.startup_id]}
          task={taskById[reviewSubmission.task_id]}
          stage={stageById[taskById[reviewSubmission.task_id]?.stage_id]}
          onClose={() => setReviewId(null)}
          onDone={async (msg) => {
            setReviewId(null);
            showToast(msg);
            await load(true);
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

function SortControl({ sort, setSort }) {
  return (
    <label className="flex items-center gap-1.5 text-[12px] text-slate-600 shrink-0">
      <ArrowDownWideNarrow className="w-3.5 h-3.5" />
      <span className="sr-only">Sort</span>
      <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-700">
        <option value="desc">Highest completion</option>
        <option value="asc">Lowest completion</option>
        <option value="name">Name A–Z</option>
      </select>
    </label>
  );
}

// ================= ONE STARTUP'S PROGRESS REPORT =================
function StartupProgressReport({ startup, stages, tasks, submissions, onClose, onReview }) {
  const overall = summarize(tasks, submissions);
  const breakdown = stageBreakdown(stages, tasks, submissions);
  const byTask = Object.fromEntries(submissions.map((s) => [s.task_id, s]));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">{startup.startup_name}</h3>
            <p className="text-xs text-slate-500">
              {startup.founder_name}
              {startup.cohort ? ` · ${startup.cohort}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-500 hover:text-slate-700" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <ProgressRing value={overall.completionPct} label="verified" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 w-full">
              {[
                ['Planned', overall.planned],
                ['Submitted', overall.submittedEver],
                ['Verified', overall.verified],
                ['Awaiting', overall.awaiting]
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500">{k}</p>
                  <p className="text-lg font-black text-slate-900 tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          </div>
          {breakdown.map(({ stage, tasks: stTasks, summary, state }) => (
            <div key={stage.id} className="rounded-xl border border-slate-200">
              <div className="px-4 py-2.5 bg-slate-50 rounded-t-xl flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-900">
                  0{stage.stage_order} · {stage.title}
                  <span className="ml-2 font-semibold text-slate-500">{state === 'done' ? 'Completed' : state === 'active' ? 'Ongoing' : 'Upcoming'}</span>
                </p>
                <span className="text-[12px] text-slate-600 tabular-nums">{summary.verified}/{summary.planned} verified</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {stTasks.map((t) => {
                  const sub = byTask[t.id];
                  return (
                    <li key={t.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                        {sub?.submitted_at && <p className="text-[11px] text-slate-500">Submitted {formatDate(sub.submitted_at)}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={sub?.status || STATUS_NOT_STARTED} />
                        {sub?.submitted_at && (
                          <button onClick={() => onReview(sub.id)} className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[12px] font-semibold text-slate-700">
                            {sub.status === STATUS_SUBMITTED ? 'Review' : 'View'}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================= REVIEW PANEL =================
function ReviewPanel({ submission, startup, task, stage, onClose, onDone, onError }) {
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(null);
  const [formError, setFormError] = useState('');
  const pending = submission.status === STATUS_SUBMITTED;

  const decide = async (status) => {
    if (status === STATUS_CHANGES && !remarks.trim()) {
      setFormError('Explain what the founder needs to change.');
      return;
    }
    setBusy(status);
    setFormError('');
    try {
      await supabaseService.reviewTaskSubmission(submission.id, { status, admin_remarks: remarks });
      await onDone(
        status === STATUS_VERIFIED
          ? `"${task?.title}" verified for ${startup?.startup_name}.`
          : `Changes requested from ${startup?.startup_name}. The founder can now edit and resubmit.`
      );
    } catch (err) {
      setFormError(err.message);
      onError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {startup?.startup_name} · {stage?.title}
            </p>
            <h3 className="text-base font-bold text-slate-900">{task?.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={submission.status} />
              {submission.submission_count > 1 && <span className="text-[11px] text-slate-500">Resubmission #{submission.submission_count}</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-500 hover:text-slate-700" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <SubmissionFacts submission={submission} />

        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-2">Review history</h4>
          <SubmissionHistory submissionId={submission.id} refreshKey={submission.updated_at} />
        </div>

        {pending ? (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label htmlFor="review-remarks" className="block text-xs font-bold text-slate-800">
              Admin remarks <span className="font-normal text-slate-500">(required when requesting changes; visible to the founder)</span>
            </label>
            <textarea
              id="review-remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Please attach the signed UC with the CA stamp."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            {formError && <p className="text-[12px] text-rose-600" role="alert">{formError}</p>}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={() => decide(STATUS_CHANGES)}
                disabled={Boolean(busy)}
                className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {busy === STATUS_CHANGES ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
                Request changes
              </button>
              <button
                onClick={() => decide(STATUS_VERIFIED)}
                disabled={Boolean(busy)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {busy === STATUS_VERIFIED ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Verify activity
              </button>
            </div>
          </div>
        ) : (
          <p className="pt-3 border-t border-slate-100 text-xs text-slate-600">
            {submission.status === STATUS_IN_PROGRESS
              ? 'The founder has saved a draft but not submitted it yet.'
              : submission.status === STATUS_CHANGES
              ? 'Waiting for the founder to edit and resubmit.'
              : `Verified on ${formatDate(submission.reviewed_at)}.`}
          </p>
        )}
      </div>
    </div>
  );
}
