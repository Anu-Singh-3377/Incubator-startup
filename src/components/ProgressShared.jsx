import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Clock, Paperclip, Loader2, Send, RotateCcw, ShieldCheck, FileEdit } from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';
import { statusMeta, formatDate } from '../lib/progressMetrics';

// Status chip: colour is always paired with the text label
export function StatusBadge({ status, className = '' }) {
  const meta = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${meta.chip} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
      {status}
    </span>
  );
}

// Opens a private document through a short-lived signed URL
export function EvidenceLink({ path, name }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!path) return <span className="text-slate-500">No document attached</span>;
  const isLocal = path.startsWith('local/');

  const open = async () => {
    setBusy(true);
    setError('');
    try {
      const url = await supabaseService.getProgressEvidenceUrl(path);
      if (url) window.open(url, '_blank', 'noopener');
      else setError('Preview is only available when connected to Supabase.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={open}
        disabled={busy || isLocal}
        className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-800 disabled:text-slate-600 disabled:cursor-default"
        title={isLocal ? 'Stored in local preview only' : 'Open document'}
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
        <span className="break-all">{name || 'Supporting document'}</span>
      </button>
      {error && <span className="text-[11px] text-rose-600 mt-0.5">{error}</span>}
    </span>
  );
}

const EVENT_COPY = {
  draft_saved: { label: 'Draft saved', Icon: FileEdit, color: 'text-blue-600' },
  submitted: { label: 'Submitted for review', Icon: Send, color: 'text-amber-600' },
  resubmitted: { label: 'Resubmitted for review', Icon: RotateCcw, color: 'text-amber-600' },
  verified: { label: 'Verified by admin', Icon: ShieldCheck, color: 'text-emerald-600' },
  changes_requested: { label: 'Changes requested', Icon: AlertCircle, color: 'text-rose-600' }
};

// Review history from task_submission_events (written by a database trigger)
export function SubmissionHistory({ submissionId, refreshKey }) {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setEvents(null);
    supabaseService
      .getTaskSubmissionEvents(submissionId)
      .then((rows) => !cancelled && setEvents(rows))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [submissionId, refreshKey]);

  if (error) return <p className="text-xs text-rose-600">Could not load history: {error}</p>;
  if (!events) return <p className="text-xs text-slate-500 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading history…</p>;
  if (events.length === 0) return <p className="text-xs text-slate-500">No history yet.</p>;

  return (
    <ol className="relative border-l border-slate-200 ml-2 space-y-3">
      {events.map((e) => {
        const copy = EVENT_COPY[e.action] || { label: e.action, Icon: Clock, color: 'text-slate-500' };
        return (
          <li key={e.id} className="ml-4">
            <span className="absolute -left-[9px] w-[18px] h-[18px] rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <copy.Icon className={`w-2.5 h-2.5 ${copy.color}`} />
            </span>
            <p className="text-xs font-semibold text-slate-800">
              {copy.label}
              <span className="font-normal text-slate-500"> · {e.actor_role === 'admin' ? 'Incubation team' : 'Founder'} · {new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </p>
            {e.remarks && <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-line">{e.remarks}</p>}
          </li>
        );
      })}
    </ol>
  );
}

// Read-only facts of a submission, shared by the founder detail view and the admin review panel
export function SubmissionFacts({ submission }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
      <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">What was completed</dt>
        <dd className="text-slate-800 mt-1 whitespace-pre-line leading-relaxed">
          {submission.completion_description || <span className="text-slate-500">No description yet.</span>}
        </dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Completion date</dt>
        <dd className="text-slate-800 mt-0.5">{formatDate(submission.completion_date) || '–'}</dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Supporting document</dt>
        <dd className="mt-0.5">
          <EvidenceLink path={submission.evidence_path} name={submission.evidence_name} />
        </dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Submitted</dt>
        <dd className="text-slate-800 mt-0.5">
          {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not submitted yet'}
          {submission.submission_count > 1 && <span className="text-slate-500"> (submission #{submission.submission_count})</span>}
        </dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {submission.status === 'Submitted for Review' && submission.reviewed_at ? 'Last reviewed' : 'Reviewed'}
        </dt>
        <dd className="text-slate-800 mt-0.5">
          {submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not reviewed yet'}
        </dd>
      </div>
      {submission.founder_remarks && (
        <div className="sm:col-span-2">
          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Founder remarks</dt>
          <dd className="text-slate-700 mt-0.5 whitespace-pre-line">{submission.founder_remarks}</dd>
        </div>
      )}
      {submission.admin_remarks && (
        <div
          className={`sm:col-span-2 p-3 rounded-xl border ${
            submission.status === 'Changes Requested'
              ? 'bg-rose-50 border-rose-200'
              : submission.status === 'Verified by Admin'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {submission.status === 'Submitted for Review' ? 'Earlier admin feedback (addressed in this resubmission)' : 'Admin remarks'}
          </dt>
          <dd className="text-slate-800 mt-1 whitespace-pre-line">{submission.admin_remarks}</dd>
        </div>
      )}
    </dl>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
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
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3800);
  };
  return [toast, show];
}

// Small labelled KPI tile
export function StatTile({ label, value, hint, accent }) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <p className="text-[12px] font-semibold text-slate-500 flex items-center gap-1.5">
        {accent && <span className="w-2 h-2 rounded-sm" style={{ background: accent }} />}
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{value}</p>
      {hint && <p className="text-[12px] text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
}
