import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  AlertCircle,
  CircleDot,
  TrendingUp,
  ChevronDown,
  X,
  Upload,
  Loader2,
  ClipboardList,
  BarChart3,
  Eye,
  Pencil,
  Send,
  Save,
  Lock,
  Info,
  RefreshCw
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
  monthlyReport,
  lastMonths,
  monthKey,
  monthLabel,
  toMonthKey,
  formatDate
} from '../lib/progressMetrics';
import { ChartCard, ProgressRing, DonutChart, HBarChart, LineChart } from './charts/Charts';
import { StatusBadge, SubmissionFacts, SubmissionHistory, Toast, useToast, StatTile } from './ProgressShared';

const STATUS_ICON = {
  [STATUS_VERIFIED]: { Icon: CheckCircle2, cls: 'text-emerald-600' },
  [STATUS_SUBMITTED]: { Icon: Clock, cls: 'text-amber-600' },
  [STATUS_CHANGES]: { Icon: AlertCircle, cls: 'text-rose-600' },
  [STATUS_IN_PROGRESS]: { Icon: CircleDot, cls: 'text-blue-600' },
  [STATUS_NOT_STARTED]: { Icon: Circle, cls: 'text-slate-400' }
};

// ================= DATA HOOK: one startup's programme + submissions, kept live =================
function useStartupProgress(startupId) {
  const [program, setProgram] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [monthlyNotes, setMonthlyNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (silent = false) => {
      if (!startupId) {
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      try {
        const [prog, subs, notes] = await Promise.all([
          supabaseService.getMilestoneProgram(),
          supabaseService.getTaskSubmissions(startupId),
          supabaseService.getMonthlyReports(startupId).catch(() => [])
        ]);
        setProgram(prog);
        setSubmissions(subs);
        setMonthlyNotes(notes || []);
        setError('');
      } catch (err) {
        setError(err.message || 'Could not load progress.');
      } finally {
        setLoading(false);
      }
    },
    [startupId]
  );

  useEffect(() => {
    load();
    if (!startupId) return undefined;
    return supabaseService.subscribeToTaskSubmissions(() => load(true));
  }, [load, startupId]);

  return { program, submissions, monthlyNotes, loading, error, reload: load };
}

// ================= MAIN =================
export default function MilestoneTracker({ startupRecord, fallback }) {
  const startupId = startupRecord?.id || null;
  const { program, submissions, monthlyNotes, loading, error, reload } = useStartupProgress(startupId);
  const [selectedStage, setSelectedStage] = useState(null);
  const [formFor, setFormFor] = useState(null); // { task, submission }
  const [detailFor, setDetailFor] = useState(null); // { task, submission }
  const [toast, showToast] = useToast();
  const lifecycleRef = useRef(null);

  const tasks = program?.tasks || [];
  const stages = program?.stages || [];
  const byTask = Object.fromEntries(submissions.map((s) => [s.task_id, s]));
  const taskById = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const stageById = Object.fromEntries(stages.map((s) => [s.id, s]));
  const breakdown = stageBreakdown(stages, tasks, submissions);
  const overall = summarize(tasks, submissions);
  const activeStage = breakdown.find((b) => b.state === 'active');
  const openStageId = selectedStage || activeStage?.stage.id || breakdown[0]?.stage.id;

  const openTask = (task) => {
    const submission = byTask[task.id];
    if (!submission || submission.status === STATUS_IN_PROGRESS || submission.status === STATUS_CHANGES) {
      setFormFor({ task, submission });
    } else {
      setDetailFor({ task, submission });
    }
  };

  const focusStage = (stageId) => {
    setSelectedStage(stageId);
    lifecycleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---------- states without data ----------
  if (!startupId) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          Your login is not yet linked to a startup record, so activities cannot be submitted yet. Please contact the incubation team.
        </div>
        {fallback}
      </div>
    );
  }

  if (loading && !program) {
    return (
      <ChartCard title="Incubation Lifecycle Journey (AIC Framework)" subtitle="Loading your activities…" icon={TrendingUp}>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-pulse" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100" />
          ))}
        </div>
      </ChartCard>
    );
  }

  if (error && !program) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Progress tracking is unavailable right now.</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button onClick={() => reload()} className="px-2.5 py-1 rounded-lg border border-amber-300 bg-white font-semibold hover:bg-amber-100 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
        {fallback}
      </div>
    );
  }

  const openBreakdown = breakdown.find((b) => b.stage.id === openStageId);

  return (
    <>
      {/* ================= INTERACTIVE LIFECYCLE ================= */}
      <div ref={lifecycleRef} className="scroll-mt-4">
        <ChartCard
          title="Incubation Lifecycle Journey (AIC Framework)"
          subtitle={
            activeStage
              ? `Stage ${activeStage.stage.stage_order} of ${stages.length}: ${activeStage.stage.title}. Click a stage to see its activities.`
              : 'All stages verified. Congratulations!'
          }
          icon={TrendingUp}
          action={
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          }
        >
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex lg:flex-col items-center gap-3 shrink-0">
              <ProgressRing value={overall.completionPct} label="verified" />
              <div className="text-[12px] text-slate-600 lg:text-center max-w-[160px] space-y-0.5">
                <p><strong className="text-slate-900">{overall.verified}</strong> of {overall.planned} activities verified</p>
                {overall.awaiting > 0 && <p className="text-amber-700">{overall.awaiting} awaiting review</p>}
                {overall.changes > 0 && <p className="text-rose-700">{overall.changes} need changes</p>}
              </div>
            </div>

            {/* Stage timeline */}
            <ol className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-5 gap-2" aria-label="Lifecycle stages">
              {breakdown.map(({ stage, summary, state }) => {
                const selected = stage.id === openStageId;
                const StateIcon = state === 'done' ? CheckCircle2 : state === 'active' ? Clock : Layers;
                return (
                  <li key={stage.id} className="min-w-0">
                    <button
                      onClick={() => setSelectedStage(stage.id)}
                      aria-expanded={selected}
                      aria-current={state === 'active' ? 'step' : undefined}
                      className={`w-full h-full text-left p-3 rounded-xl border transition group ${
                        selected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white shadow-sm'
                          : state === 'done'
                          ? 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-400'
                          : state === 'active'
                          ? 'border-emerald-300 bg-white hover:border-emerald-500'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            state === 'done' ? 'bg-emerald-600 text-white' : state === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <StateIcon className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-black text-slate-400 tabular-nums">0{stage.stage_order}</span>
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-900 leading-snug">{stage.title}</p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{stage.description}</p>
                      <div className="mt-2 flex h-1.5 w-full gap-[2px] rounded-full overflow-hidden bg-slate-200/70" aria-hidden="true">
                        {summary.verified > 0 && <div className="h-full bg-emerald-600" style={{ width: `${(summary.verified / summary.planned) * 100}%` }} />}
                        {summary.awaiting > 0 && <div className="h-full bg-amber-500" style={{ width: `${(summary.awaiting / summary.planned) * 100}%` }} />}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 tabular-nums">
                        {summary.verified}/{summary.planned} verified
                        <span className="text-slate-500"> · {state === 'done' ? 'Completed' : state === 'active' ? 'Ongoing' : 'Upcoming'}</span>
                      </p>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Expanded stage: activities */}
          {openBreakdown && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 text-emerald-600" />
                    {openBreakdown.stage.title}: activities
                  </h4>
                  <p className="text-xs text-slate-500 ml-6">
                    {openBreakdown.summary.verified} verified · {openBreakdown.summary.awaiting} awaiting review · {openBreakdown.summary.notStarted} not started
                  </p>
                </div>
                <div className="sm:w-48 ml-6 sm:ml-0">
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${openBreakdown.summary.completionPct}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 text-right">{openBreakdown.summary.completionPct}% of this stage verified</p>
                </div>
              </div>

              <ul className="space-y-2">
                {openBreakdown.tasks.map((task) => {
                  const sub = byTask[task.id];
                  const status = sub?.status || STATUS_NOT_STARTED;
                  const { Icon, cls } = STATUS_ICON[status];
                  const editable = !sub || status === STATUS_IN_PROGRESS || status === STATUS_CHANGES;
                  return (
                    <li key={task.id} className={`p-3 sm:p-4 rounded-xl border transition ${status === STATUS_CHANGES ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => openTask(task)}
                          className={`mt-0.5 shrink-0 rounded-full ${cls} hover:scale-110 transition`}
                          title={status === STATUS_NOT_STARTED ? 'Mark as completed' : status}
                          aria-label={`${task.title}: ${status}`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`text-xs font-bold ${status === STATUS_VERIFIED ? 'text-slate-700' : 'text-slate-900'}`}>{task.title}</p>
                            <StatusBadge status={status} />
                          </div>
                          <p className="text-[12px] text-slate-500 mt-0.5">{task.description}</p>
                          <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            {sub?.completion_date && sub.submitted_at && <span>Completed {formatDate(sub.completion_date)}</span>}
                            {status === STATUS_IN_PROGRESS && <span>Draft saved {formatDate(sub.updated_at)}</span>}
                            {sub?.submitted_at && <span>Submitted {formatDate(sub.submitted_at)}</span>}
                            {sub?.reviewed_at && status === STATUS_VERIFIED && <span className="text-emerald-700">Verified {formatDate(sub.reviewed_at)}</span>}
                            {!sub && task.evidence_hint && <span>Evidence: {task.evidence_hint}</span>}
                          </p>
                          {status === STATUS_CHANGES && sub.admin_remarks && (
                            <p className="mt-2 p-2 rounded-lg bg-white border border-rose-200 text-[12px] text-rose-800">
                              <strong>Changes requested:</strong> {sub.admin_remarks}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col sm:flex-row gap-1.5">
                          {sub && sub.submitted_at && (
                            <button
                              onClick={() => setDetailFor({ task, submission: sub })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[12px] flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          )}
                          {editable && (
                            <button
                              onClick={() => setFormFor({ task, submission: sub })}
                              className={`px-2.5 py-1.5 rounded-lg font-bold text-[12px] flex items-center gap-1 ${
                                status === STATUS_CHANGES ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {status === STATUS_NOT_STARTED ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                              {status === STATUS_NOT_STARTED ? 'Mark complete' : status === STATUS_CHANGES ? 'Edit & resubmit' : 'Continue'}
                            </button>
                          )}
                          {status === STATUS_SUBMITTED && (
                            <button
                              onClick={() => setFormFor({ task, submission: sub })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[12px] flex items-center gap-1"
                              title="Update this submission while it awaits review"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                          )}
                          {status === STATUS_VERIFIED && (
                            <span className="px-2 py-1.5 text-[11px] text-slate-500 flex items-center gap-1" title="Verified activities are locked">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ================= MONTHLY PROGRESS REPORTS ================= */}
      <MonthlyReports
        tasks={tasks}
        submissions={submissions}
        monthlyNotes={monthlyNotes}
        taskById={taskById}
        stageById={stageById}
        onOpen={(sub) => setDetailFor({ task: taskById[sub.task_id], submission: sub })}
      />

      {/* ================= ANALYTICS ================= */}
      <StartupAnalytics
        tasks={tasks}
        submissions={submissions}
        breakdown={breakdown}
        overall={overall}
        byTask={byTask}
        stageById={stageById}
        onStageClick={focusStage}
        onOpenTask={openTask}
      />

      {formFor && (
        <SubmissionForm
          startupId={startupId}
          task={formFor.task}
          stage={stageById[formFor.task.stage_id]}
          submission={formFor.submission}
          onClose={() => setFormFor(null)}
          onSaved={async (msg) => {
            setFormFor(null);
            showToast(msg);
            await reload(true);
          }}
        />
      )}

      {detailFor && (
        <SubmissionDetail
          task={detailFor.task}
          stage={stageById[detailFor.task?.stage_id]}
          submission={byTask[detailFor.task?.id] || detailFor.submission}
          onClose={() => setDetailFor(null)}
          onEdit={() => {
            const t = detailFor.task;
            setDetailFor(null);
            setFormFor({ task: t, submission: byTask[t.id] });
          }}
        />
      )}

      <Toast toast={toast} />
    </>
  );
}

// ================= SUBMISSION FORM (draft / submit / resubmit) =================
function SubmissionForm({ startupId, task, stage, submission, onClose, onSaved }) {
  const today = new Date().toISOString().slice(0, 10);
  const [description, setDescription] = useState(submission?.completion_description || '');
  const [date, setDate] = useState(submission?.completion_date || today);
  const [remarks, setRemarks] = useState(submission?.founder_remarks || '');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(null); // 'draft' | 'submit'
  const [serverError, setServerError] = useState('');
  const isResubmission = submission?.status === STATUS_CHANGES;

  const save = async (mode) => {
    const errs = {};
    if (mode === 'submit') {
      if (description.trim().length < 20) errs.description = 'Describe what was completed (at least 20 characters).';
      if (!date) errs.date = 'Choose the completion date.';
    }
    if (date && date > today) errs.date = 'The completion date cannot be in the future.';
    if (file && file.size > 10 * 1024 * 1024) errs.file = 'Files must be 10 MB or smaller.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(mode);
    setServerError('');
    try {
      let evidence = {};
      if (file) {
        const up = await supabaseService.uploadProgressEvidence(startupId, task.id, file);
        evidence = { evidence_path: up.path, evidence_name: up.name };
      }
      await supabaseService.saveTaskSubmission({
        id: submission?.id,
        startup_id: startupId,
        task_id: task.id,
        status: mode === 'submit' ? STATUS_SUBMITTED : STATUS_IN_PROGRESS,
        completion_description: description,
        completion_date: date,
        founder_remarks: remarks,
        ...evidence
      });
      await onSaved(
        mode === 'submit'
          ? `"${task.title}" ${isResubmission ? 'resubmitted' : 'submitted'} for review. The incubation team has been notified.`
          : `Draft saved for "${task.title}".`
      );
    } catch (err) {
      setServerError(err.message || 'Could not save. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save('submit');
        }}
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4 text-xs"
      >
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{stage?.title}</p>
            <h3 className="text-base font-bold text-slate-900">{isResubmission ? 'Edit & resubmit' : 'Mark activity complete'}: {task.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-500 hover:text-slate-700" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isResubmission && submission.admin_remarks && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
            <p className="font-bold">Changes requested by the incubation team</p>
            <p className="mt-0.5 whitespace-pre-line">{submission.admin_remarks}</p>
          </div>
        )}

        <div>
          <label htmlFor="ms-desc" className="block font-semibold text-slate-700 mb-1">
            Completion description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="ms-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What exactly was done, with any reference numbers, quantities or outcomes…"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
          <div className="flex justify-between mt-1">
            {errors.description ? <p className="text-rose-600 text-[11px]">{errors.description}</p> : <span />}
            <span className="text-[11px] text-slate-500 tabular-nums">{description.trim().length} characters</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="ms-date" className="block font-semibold text-slate-700 mb-1">
              Completion date <span className="text-rose-500">*</span>
            </label>
            <input id="ms-date" type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
            {errors.date && <p className="text-rose-600 text-[11px] mt-1">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="ms-file" className="block font-semibold text-slate-700 mb-1">
              Supporting document <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <label htmlFor="ms-file" className="flex items-center gap-2 w-full p-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-white hover:border-emerald-400">
              <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate text-slate-600">
                {file ? file.name : submission?.evidence_name ? `Replace ${submission.evidence_name}` : task.evidence_hint || 'PDF, PNG, JPG or WEBP, up to 10 MB'}
              </span>
            </label>
            <input id="ms-file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {errors.file && <p className="text-rose-600 text-[11px] mt-1">{errors.file}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="ms-remarks" className="block font-semibold text-slate-700 mb-1">
            Remarks <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea id="ms-remarks" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Anything the reviewer should know…" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
        </div>

        <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          Submitting sends this activity to the incubation team. It counts as complete only after an admin verifies it.
        </p>

        {serverError && (
          <p className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800" role="alert">
            {serverError}
          </p>
        )}

        <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          {submission?.status !== STATUS_SUBMITTED && (
            <button
              type="button"
              onClick={() => save('draft')}
              disabled={Boolean(saving)}
              className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saving === 'draft' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save draft
            </button>
          )}
          <button
            type="submit"
            disabled={Boolean(saving)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {saving === 'submit' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {isResubmission ? 'Resubmit Progress' : submission?.status === STATUS_SUBMITTED ? 'Update Submission' : 'Submit Progress'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ================= SUBMISSION DETAIL (read-only + history) =================
function SubmissionDetail({ task, stage, submission, onClose, onEdit }) {
  if (!submission) return null;
  const canEdit = submission.status !== STATUS_VERIFIED;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{stage?.title}</p>
            <h3 className="text-base font-bold text-slate-900">{task?.title}</h3>
            <div className="mt-1">
              <StatusBadge status={submission.status} />
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
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 text-xs">
            Close
          </button>
          {canEdit && (
            <button onClick={onEdit} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              {submission.status === STATUS_CHANGES ? 'Edit & resubmit' : 'Edit submission'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ================= MONTHLY PROGRESS REPORTS (generated from submission records) =================
function MonthlyReports({ tasks, submissions, monthlyNotes, taskById, stageById, onOpen }) {
  const months = activeMonths(submissions);
  const [month, setMonth] = useState(null);
  const current = month && months.includes(month) ? month : months[0];
  const report = current ? monthlyReport(current, tasks, submissions) : null;
  const note = current ? monthlyNotes.find((n) => toMonthKey(n.report_month) === current) : null;

  const Item = ({ sub }) => (
    <li>
      <button onClick={() => onOpen(sub)} className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 transition">
        <p className="text-xs font-semibold text-slate-900">{taskById[sub.task_id]?.title || sub.task_id}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {stageById[taskById[sub.task_id]?.stage_id]?.title} · submitted {formatDate(sub.submitted_at)}
        </p>
      </button>
    </li>
  );

  const columns = report
    ? [
        { title: 'Awaiting review', items: report.awaiting, status: STATUS_SUBMITTED, empty: 'Nothing waiting.' },
        { title: 'Verified', items: report.verified, status: STATUS_VERIFIED, empty: 'None verified yet.' },
        { title: 'Changes requested', items: report.changes, status: STATUS_CHANGES, empty: 'No changes requested.' }
      ]
    : [];

  return (
    <ChartCard
      title="Monthly Progress Reports"
      subtitle="Built automatically from the activities you submit each month"
      icon={ClipboardList}
    >
      {!report ? (
        <div className="py-8 text-center max-w-md mx-auto">
          <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No monthly report yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Mark an activity complete in the lifecycle above and submit it. Your report for {monthLabel(monthKey())} will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Reporting month">
            {months.map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={m === current}
                onClick={() => setMonth(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition ${
                  m === current ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {monthLabel(m)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { label: 'Planned (programme)', value: report.planned },
              { label: 'Submitted this month', value: report.submitted },
              { label: 'Verified', value: report.verified.length, color: statusMeta(STATUS_VERIFIED).color },
              { label: 'Awaiting review', value: report.awaiting.length, color: statusMeta(STATUS_SUBMITTED).color },
              { label: 'Changes requested', value: report.changes.length, color: statusMeta(STATUS_CHANGES).color },
              { label: 'Completion at month end', value: `${report.completionPct}%` }
            ].map((k) => (
              <div key={k.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  {k.color && <span className="w-2 h-2 rounded-sm" style={{ background: k.color }} />}
                  {k.label}
                </p>
                <p className="text-lg font-black text-slate-900 tabular-nums mt-0.5">{k.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {columns.map((col) => (
              <div key={col.title} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background: statusMeta(col.status).color }} />
                  {col.title} <span className="text-slate-500 font-semibold">({col.items.length})</span>
                </p>
                {col.items.length === 0 ? (
                  <p className="text-[12px] text-slate-500 py-2">{col.empty}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {col.items.map((s) => (
                      <Item key={s.id} sub={s} />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1.5">Your remarks</p>
              {report.founderRemarks.length === 0 ? (
                <p className="text-slate-500">No remarks added this month.</p>
              ) : (
                <ul className="space-y-1.5">
                  {report.founderRemarks.map((r) => (
                    <li key={r.id} className="text-slate-700">
                      <strong className="text-slate-900">{taskById[r.task_id]?.title}:</strong> {r.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1.5">Admin remarks</p>
              {report.adminRemarks.length === 0 && !note ? (
                <p className="text-slate-500">No feedback from the incubation team yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {note && (
                    <li className="text-slate-700">
                      <strong className="text-slate-900">Monthly note:</strong> {note.work_summary}
                    </li>
                  )}
                  {report.adminRemarks.map((r) => (
                    <li key={r.id} className="text-slate-700">
                      <strong className="text-slate-900">{taskById[r.task_id]?.title}:</strong> {r.text}
                      {r.status === STATUS_SUBMITTED && <span className="text-slate-500"> (earlier feedback, since resubmitted)</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

// ================= MY STARTUP PROGRESS ANALYTICS =================
function StartupAnalytics({ tasks, submissions, breakdown, overall, byTask, stageById, onStageClick, onOpenTask }) {
  const [period, setPeriod] = useState(6);
  const [statusFilter, setStatusFilter] = useState(null);
  const thisMonth = monthlyReport(monthKey(), tasks, submissions);
  const trend = monthlyTrend(submissions, lastMonths(period));

  const overallData = [
    { label: 'Verified by admin', value: overall.verified, color: statusMeta(STATUS_VERIFIED).color },
    { label: 'Submitted, awaiting review', value: overall.awaiting, color: statusMeta(STATUS_SUBMITTED).color },
    { label: 'In progress or needs changes', value: overall.inProgress + overall.changes, color: statusMeta(STATUS_IN_PROGRESS).color },
    { label: 'Not started', value: overall.notStarted, color: statusMeta(STATUS_NOT_STARTED).color }
  ];
  const statusData = TASK_STATUSES.map((s) => ({ label: s.key, value: overall.counts[s.key] || 0, color: s.color }));
  const stageData = breakdown.map(({ stage, summary }) => ({
    label: stage.title,
    value: summary.completionPct,
    stageId: stage.id,
    tooltip: [`${summary.verified} of ${summary.planned} verified`, `${summary.awaiting} awaiting review`, 'Click to open this stage']
  }));
  const filteredTasks = statusFilter ? tasks.filter((t) => (byTask[t.id]?.status || STATUS_NOT_STARTED) === statusFilter) : [];

  return (
    <section className="space-y-4" aria-labelledby="my-analytics-title">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h3 id="my-analytics-title" className="text-base font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> My Startup Progress Analytics
          </h3>
          <p className="text-xs text-slate-500">
            Based on your {overall.planned} planned programme activities. Only admin-verified activities count as complete.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label={`Planned activities`} value={overall.planned} hint="Across all 5 stages" />
        <StatTile label={`Submitted in ${monthLabel(monthKey(), 'short')}`} value={thisMonth.submitted} hint={`${overall.submittedEver} submitted overall`} />
        <StatTile label={`Verified in ${monthLabel(monthKey(), 'short')}`} value={thisMonth.verifiedInMonth} hint={`${overall.verified} verified overall`} accent={statusMeta(STATUS_VERIFIED).color} />
        <StatTile label="Awaiting review" value={overall.awaiting} hint={overall.changes ? `${overall.changes} need changes` : 'Nothing needs changes'} accent={statusMeta(STATUS_SUBMITTED).color} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Overall incubation progress" subtitle="Share of your planned activities by review stage" icon={TrendingUp}>
          {overall.submittedEver + overall.inProgress === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">Analytics will appear after you save or submit your first activity.</p>
          ) : (
            <DonutChart data={overallData} centerValue={`${overall.completionPct}%`} centerLabel="verified" />
          )}
        </ChartCard>

        <ChartCard title="Task status distribution" subtitle="Click a status to list those activities" icon={BarChart3}>
          <DonutChart
            data={statusData}
            centerValue={overall.planned}
            centerLabel="activities"
            selectedLabel={statusFilter}
            onSegmentClick={(d) => setStatusFilter(statusFilter === d.label ? null : d.label)}
          />
        </ChartCard>
      </div>

      {statusFilter && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <StatusBadge status={statusFilter} /> {filteredTasks.length} activit{filteredTasks.length === 1 ? 'y' : 'ies'}
            </p>
            <button onClick={() => setStatusFilter(null)} className="text-[12px] font-semibold text-emerald-700 hover:text-emerald-800">
              Clear
            </button>
          </div>
          {filteredTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">No activities with this status.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredTasks.map((t) => (
                <li key={t.id}>
                  <button onClick={() => onOpenTask(t)} className="w-full flex items-center justify-between gap-3 py-2 text-left hover:bg-slate-50 rounded px-1">
                    <span className="text-xs">
                      <strong className="text-slate-900">{t.title}</strong>
                      <span className="text-slate-500"> · {stageById[t.stage_id]?.title}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 shrink-0">{formatDate(byTask[t.id]?.submitted_at) || 'Open →'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly progress"
          subtitle="Activities you submitted and those the admin verified, per month"
          icon={TrendingUp}
          action={
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              aria-label="Reporting period"
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-700 shrink-0"
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
          }
        >
          <LineChart
            points={trend}
            series={[
              { key: 'submitted', label: 'Submitted', color: statusMeta(STATUS_SUBMITTED).color },
              { key: 'verified', label: 'Verified', color: statusMeta(STATUS_VERIFIED).color }
            ]}
            emptyText="No submissions in this period yet."
          />
        </ChartCard>

        <ChartCard title="Milestone completion" subtitle="Verified share of each stage. Click a stage to open it." icon={Layers}>
          <HBarChart data={stageData} max={100} valueFormat={(v) => `${v}%`} onBarClick={(d) => onStageClick(d.stageId)} />
        </ChartCard>
      </div>
    </section>
  );
}
