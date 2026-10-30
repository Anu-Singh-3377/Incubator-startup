// ================= PROGRESS METRICS =================
// Single source for every progress number shown on the founder and admin dashboards.
//
// Calculation rules
// - Planned activities = active milestone_tasks (the same 20 for every startup). This is the denominator.
// - Each startup has at most one task_submissions row per task, so resubmissions are never double-counted.
// - A task with no row is "Not Started".
// - "Verified" counts only rows an admin set to 'Verified by Admin'. Founder submissions are counted separately.
// - Completion % = verified / planned. Submitted % = (awaiting review + verified) / planned.
// - Monthly "submitted" uses the row's reporting_month (month of its latest submission);
//   monthly "verified" uses the month of reviewed_at.

export const STATUS_NOT_STARTED = 'Not Started';
export const STATUS_IN_PROGRESS = 'In Progress';
export const STATUS_SUBMITTED = 'Submitted for Review';
export const STATUS_VERIFIED = 'Verified by Admin';
export const STATUS_CHANGES = 'Changes Requested';

// Order keeps red and green apart for colour-blind readers; always shown with text labels.
export const TASK_STATUSES = [
  { key: STATUS_VERIFIED, short: 'Verified', color: '#059669', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: STATUS_SUBMITTED, short: 'Awaiting review', color: '#d97706', chip: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: STATUS_CHANGES, short: 'Changes requested', color: '#e11d48', chip: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: STATUS_IN_PROGRESS, short: 'In progress', color: '#2563eb', chip: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: STATUS_NOT_STARTED, short: 'Not started', color: '#94a3b8', chip: 'bg-slate-50 text-slate-600 border-slate-200' }
];
export const statusMeta = (key) => TASK_STATUSES.find((s) => s.key === key) || TASK_STATUSES[4];

// ---- months ----
export const monthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
export const toMonthKey = (value) => (value ? `${String(value).slice(0, 7)}-01` : null);
export const monthLabel = (key, style = 'long') => {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(
    'en-IN',
    style === 'short' ? { month: 'short', year: '2-digit' } : { month: 'long', year: 'numeric' }
  );
};
export const lastMonths = (count, end = monthKey()) => {
  const [y, m] = end.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => monthKey(new Date(y, m - 1 - (count - 1 - i), 1)));
};
export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// ---- core ----
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

export const emptyCounts = () => ({
  [STATUS_NOT_STARTED]: 0,
  [STATUS_IN_PROGRESS]: 0,
  [STATUS_SUBMITTED]: 0,
  [STATUS_VERIFIED]: 0,
  [STATUS_CHANGES]: 0
});

// Summary for one startup (or any set of tasks + that startup's submissions)
export function summarize(tasks, submissions) {
  const taskIds = new Set(tasks.map((t) => t.id));
  const rows = submissions.filter((s) => taskIds.has(s.task_id));
  const counts = emptyCounts();
  rows.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });
  counts[STATUS_NOT_STARTED] = Math.max(tasks.length - rows.length, 0);
  const planned = tasks.length;
  const verified = counts[STATUS_VERIFIED];
  const awaiting = counts[STATUS_SUBMITTED];
  const submittedEver = rows.filter((r) => r.submitted_at).length;
  const latest = rows.reduce((max, r) => (r.submitted_at && (!max || r.submitted_at > max) ? r.submitted_at : max), null);
  return {
    planned,
    counts,
    verified,
    awaiting,
    changes: counts[STATUS_CHANGES],
    inProgress: counts[STATUS_IN_PROGRESS],
    notStarted: counts[STATUS_NOT_STARTED],
    submittedEver,
    completionPct: pct(verified, planned),
    submittedPct: pct(verified + awaiting, planned),
    latestSubmission: latest
  };
}

// Per-stage breakdown with timeline state: done (all verified), active (first unfinished), upcoming
export function stageBreakdown(stages, tasks, submissions) {
  let activeAssigned = false;
  return [...stages]
    .sort((a, b) => a.stage_order - b.stage_order)
    .map((stage) => {
      const stageTasks = tasks.filter((t) => t.stage_id === stage.id).sort((a, b) => a.sort_order - b.sort_order);
      const summary = summarize(stageTasks, submissions);
      let state = 'upcoming';
      if (stageTasks.length > 0 && summary.verified === stageTasks.length) state = 'done';
      else if (!activeAssigned) {
        state = 'active';
        activeAssigned = true;
      }
      return { stage, tasks: stageTasks, summary, state };
    });
}

// Submitted vs verified per month
export function monthlyTrend(submissions, months) {
  return months.map((m) => ({
    month: m,
    label: monthLabel(m, 'short'),
    submitted: submissions.filter((s) => s.submitted_at && toMonthKey(s.reporting_month) === m).length,
    verified: submissions.filter((s) => s.status === STATUS_VERIFIED && toMonthKey(s.reviewed_at) === m).length
  }));
}

// Months that have any activity, newest first
export function activeMonths(submissions) {
  const set = new Set();
  submissions.forEach((s) => {
    if (s.reporting_month) set.add(toMonthKey(s.reporting_month));
    if (s.status === STATUS_VERIFIED && s.reviewed_at) set.add(toMonthKey(s.reviewed_at));
  });
  return [...set].sort().reverse();
}

// Monthly report for one startup, generated from its submission rows
export function monthlyReport(month, tasks, submissions) {
  const monthEnd = (() => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m, 1).toISOString();
  })();
  const inMonth = submissions.filter((s) => s.submitted_at && toMonthKey(s.reporting_month) === month);
  const verifiedInMonth = submissions.filter((s) => s.status === STATUS_VERIFIED && toMonthKey(s.reviewed_at) === month);
  const verifiedByMonthEnd = submissions.filter((s) => s.status === STATUS_VERIFIED && s.reviewed_at && s.reviewed_at < monthEnd).length;
  return {
    month,
    planned: tasks.length,
    submitted: inMonth.length,
    awaiting: inMonth.filter((s) => s.status === STATUS_SUBMITTED),
    verified: inMonth.filter((s) => s.status === STATUS_VERIFIED),
    changes: inMonth.filter((s) => s.status === STATUS_CHANGES),
    verifiedInMonth: verifiedInMonth.length,
    completionPct: pct(verifiedByMonthEnd, tasks.length),
    founderRemarks: inMonth.filter((s) => s.founder_remarks).map((s) => ({ id: s.id, task_id: s.task_id, text: s.founder_remarks })),
    adminRemarks: [...inMonth, ...verifiedInMonth]
      .filter((s, i, arr) => s.admin_remarks && arr.findIndex((x) => x.id === s.id) === i)
      .map((s) => ({ id: s.id, task_id: s.task_id, text: s.admin_remarks, status: s.status }))
  };
}
