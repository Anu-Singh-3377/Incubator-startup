import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  PhoneCall,
  MessageSquare,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  User,
  Building2,
  Calendar,
  Lock,
  ChevronRight,
  RefreshCw,
  Phone,
  Mail,
  Shield
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';

export default function SupportDesk({ isAdmin = false, currentUser }) {
  const [activeTab, setActiveTab] = useState(isAdmin ? 'tickets-admin' : 'my-tickets'); 
  // Admin: 'tickets-admin' | 'callbacks-admin'
  // Startup: 'my-tickets' | 'raise-ticket' | 'request-callback'

  const [tickets, setTickets] = useState([]);
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isInternalReply, setIsInternalReply] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Raise Ticket Form State
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Grant Disbursal & UC',
    priority: 'Normal',
    description: ''
  });
  const [ticketErrors, setTicketErrors] = useState({});
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(null);

  // Callback Form State
  const [newCallback, setNewCallback] = useState({
    phone: currentUser?.phone || '+91 98765 43210',
    preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferred_time_window: 'Morning (10 AM - 1 PM)',
    reason: 'Grant Tranche Disbursal Inquiry',
    additional_details: ''
  });
  const [submittingCallback, setSubmittingCallback] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(null);

  // Admin status update state
  const [selectedCallback, setSelectedCallback] = useState(null);
  const [adminCallbackNote, setAdminCallbackNote] = useState('');

  // Request workflow (admin): active queue vs completed archive, completion message, feedback toast
  const [adminView, setAdminView] = useState('active'); // 'active' | 'completed'
  const [workflowAction, setWorkflowAction] = useState(null); // null | 'complete' | 'reject'
  const [workflowNote, setWorkflowNote] = useState('');
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Tickets are stored against the startups.id row, so prefer it over the auth profile id
      const startupId = !isAdmin ? currentUser?.startup_id || currentUser?.id || currentUser?.startup_name : null;
      const [tktData, cbData] = await Promise.all([
        supabaseService.getSupportTickets(startupId),
        supabaseService.getCallbackRequests(startupId)
      ]);
      setTickets(tktData || []);
      setCallbacks(cbData || []);

      // If viewing a ticket, refresh its detail
      if (selectedTicket) {
        const fresh = (tktData || []).find((t) => t.id === selectedTicket.id);
        if (fresh) setSelectedTicket(fresh);
      }
    } catch (err) {
      console.error('Failed to load support data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin, currentUser]);

  // Keep both sides in sync: refresh quietly every 30s while the desk is open
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') loadData(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [isAdmin, currentUser, selectedTicket?.id]);

  // Handle Raise Ticket
  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!newTicket.subject.trim()) errs.subject = 'Subject line is required.';
    if (!newTicket.description.trim() || newTicket.description.length < 15) {
      errs.description = 'Please provide detailed description (at least 15 characters).';
    }
    if (Object.keys(errs).length > 0) {
      setTicketErrors(errs);
      return;
    }

    setSubmittingTicket(true);
    setTicketErrors({});
    try {
      const res = await supabaseService.createSupportTicket({
        startup_id: currentUser?.startup_id || currentUser?.id || 'st_01',
        startup_name: currentUser?.startup_name || 'KisanSetu DeepTech Labs',
        founder_name: currentUser?.full_name || 'Aarav Sharma',
        founder_email: currentUser?.email || 'founder@venturebharat.in',
        subject: newTicket.subject,
        category: newTicket.category,
        priority: newTicket.priority,
        description: newTicket.description
      });

      setTicketSuccess(res.ticket?.ticket_number || 'VB-TKT-NEW');
      setNewTicket({
        subject: '',
        category: 'Grant Disbursal & UC',
        priority: 'Normal',
        description: ''
      });
      await loadData();
    } catch (err) {
      alert('Error creating ticket: ' + err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Handle Request Callback
  const handleRequestCallback = async (e) => {
    e.preventDefault();
    setSubmittingCallback(true);
    try {
      const res = await supabaseService.createCallbackRequest({
        startup_id: currentUser?.startup_id || currentUser?.id || 'st_01',
        startup_name: currentUser?.startup_name || 'KisanSetu DeepTech Labs',
        founder_name: currentUser?.full_name || 'Aarav Sharma',
        phone: newCallback.phone,
        preferred_date: newCallback.preferred_date,
        preferred_time_window: newCallback.preferred_time_window,
        reason: newCallback.reason,
        additional_details: newCallback.additional_details
      });

      setCallbackSuccess(res.callback?.reference_number || 'VB-CB-NEW');
      await loadData();
    } catch (err) {
      alert('Error scheduling callback: ' + err.message);
    } finally {
      setSubmittingCallback(false);
    }
  };

  // Handle Add Reply to Ticket
  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !selectedTicket) return;
    setSubmittingReply(true);
    try {
      const author = currentUser?.full_name || (isAdmin ? 'Directorate Support Desk' : 'Founder');
      const role = isAdmin ? 'Incubation Directorate' : 'Startup Founder';
      await supabaseService.addTicketResponse(selectedTicket.id, {
        author_name: author,
        responder_name: author,
        author_role: role,
        responder_role: role,
        message: ticketReplyText.trim(),
        is_internal: isAdmin ? isInternalReply : false
      });

      setTicketReplyText('');
      setIsInternalReply(false);
      await loadData();
    } catch (err) {
      alert('Error posting reply: ' + err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle Admin Update Ticket Status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      await supabaseService.updateTicketStatus(selectedTicket.id, newStatus);
      await loadData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Handle Admin Update Callback Status
  const handleUpdateCallback = async (cbId, newStatus) => {
    try {
      await supabaseService.updateCallbackStatus(cbId, newStatus, adminCallbackNote);
      setSelectedCallback(null);
      setAdminCallbackNote('');
      if (newStatus === 'Completed') showToast('Callback completed and removed from the active queue.');
      else if (newStatus === 'Scheduled') showToast('Callback verified and scheduled. The founder can see your message.');
      await loadData(true);
    } catch (err) {
      alert('Error updating callback: ' + err.message);
    }
  };

  // ================= REQUEST WORKFLOW: verify -> respond -> complete -> archive =================
  const isTicketDone = (t) => t.status === 'Resolved' || t.status === 'Closed';
  const isAdminReply = (r) => {
    const role = r.author_role || r.responder_role || '';
    return role === 'admin' || role.includes('Directorate');
  };
  const adminName = currentUser?.full_name || 'Directorate Support Desk';

  const postAdminMessage = (ticketId, message) =>
    supabaseService.addTicketResponse(ticketId, {
      author_name: adminName,
      responder_name: adminName,
      author_role: 'Incubation Directorate',
      responder_role: 'Incubation Directorate',
      message,
      is_internal: false
    });

  const closeWorkflowBox = () => {
    setWorkflowAction(null);
    setWorkflowNote('');
  };

  const handleVerifyTicket = async () => {
    if (!selectedTicket) return;
    setWorkflowBusy(true);
    try {
      await supabaseService.updateTicketStatus(selectedTicket.id, 'In Progress');
      await postAdminMessage(
        selectedTicket.id,
        'Your request has been verified by the incubation team and is now being worked on. We will update you on this thread.'
      );
      showToast(`${selectedTicket.ticket_number} verified. The founder has been notified.`);
      await loadData(true);
    } catch (err) {
      showToast('Could not verify request: ' + err.message, 'error');
    } finally {
      setWorkflowBusy(false);
    }
  };

  // Complete (Resolved) or reject (Closed): both send a final message, then leave the admin's active queue
  const handleFinishTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !workflowNote.trim()) return;
    const finalStatus = workflowAction === 'reject' ? 'Closed' : 'Resolved';
    setWorkflowBusy(true);
    try {
      await postAdminMessage(selectedTicket.id, workflowNote.trim());
      await supabaseService.updateTicketStatus(selectedTicket.id, finalStatus);
      showToast(
        finalStatus === 'Resolved'
          ? `${selectedTicket.ticket_number} completed and removed from the active queue.`
          : `${selectedTicket.ticket_number} closed and removed from the active queue.`
      );
      closeWorkflowBox();
      setSelectedTicket(null);
      await loadData(true);
    } catch (err) {
      showToast('Could not update request: ' + err.message, 'error');
    } finally {
      setWorkflowBusy(false);
    }
  };

  const handleReopenTicket = async (tkt) => {
    try {
      await supabaseService.updateTicketStatus(tkt.id, 'In Progress');
      showToast(`${tkt.ticket_number} reopened and moved back to the active queue.`);
      await loadData(true);
    } catch (err) {
      showToast('Could not reopen request: ' + err.message, 'error');
    }
  };

  const handleDeleteTicket = async (tkt) => {
    if (!window.confirm(`Permanently delete ${tkt.ticket_number} and its conversation? This cannot be undone.`)) return;
    try {
      await supabaseService.deleteSupportTicket(tkt.id);
      if (selectedTicket?.id === tkt.id) setSelectedTicket(null);
      showToast(`${tkt.ticket_number} deleted.`);
      await loadData(true);
    } catch (err) {
      showToast('Could not delete request: ' + err.message, 'error');
    }
  };

  const handleDeleteCallback = async (cb) => {
    if (!window.confirm(`Permanently delete callback ${cb.reference_number}? This cannot be undone.`)) return;
    try {
      await supabaseService.deleteCallbackRequest(cb.id);
      if (selectedCallback?.id === cb.id) setSelectedCallback(null);
      showToast(`${cb.reference_number} deleted.`);
      await loadData(true);
    } catch (err) {
      showToast('Could not delete callback: ' + err.message, 'error');
    }
  };

  // Founder side: highlight tickets with an incubator reply the founder has not opened yet
  const seenKey = (id) => `vb_ticket_seen_${id}`;
  const visibleReplies = (t) => (t.responses || []).filter((r) => !r.is_internal);
  const hasUnreadReply = (t) => {
    const replies = visibleReplies(t);
    const last = replies[replies.length - 1];
    if (!last || !isAdminReply(last)) return false;
    try {
      return localStorage.getItem(seenKey(t.id)) !== String(replies.length);
    } catch {
      return false;
    }
  };
  const openTicket = (tkt) => {
    if (!isAdmin) {
      try {
        localStorage.setItem(seenKey(tkt.id), String(visibleReplies(tkt).length));
      } catch {
        /* storage unavailable: badge simply stays */
      }
    }
    closeWorkflowBox();
    setSelectedTicket(tkt);
  };

  // Progress tracker shown to both sides inside the thread
  const ticketStage = (t) => {
    if (t.status === 'Resolved' || t.status === 'Closed') return 3;
    if (t.status === 'In Progress' || t.status === 'Under Review') return visibleReplies(t).some(isAdminReply) ? 2 : 1;
    return 0;
  };
  const TICKET_STAGES = ['Submitted', 'Verified', 'In progress', 'Completed'];

  const activeTickets = tickets.filter((t) => !isTicketDone(t));
  const completedTickets = tickets.filter(isTicketDone);
  const activeCallbacks = callbacks.filter((c) => c.status !== 'Completed');
  const completedCallbacks = callbacks.filter((c) => c.status === 'Completed');
  const unreadCount = tickets.filter(hasUnreadReply).length;

  // Admin works from the active queue; completed requests move to the archive view
  const baseTickets = isAdmin ? (adminView === 'active' ? activeTickets : completedTickets) : tickets;
  const baseCallbacks = isAdmin ? (adminView === 'active' ? activeCallbacks : completedCallbacks) : callbacks;

  // Ticket status colours for the summary bar (status palette, always shown with a text label)
  const TICKET_STATUS_META = [
    { key: 'Open', color: '#d97706' },
    { key: 'In Progress', color: '#2563eb' },
    { key: 'Under Review', color: '#7c3aed' },
    { key: 'Resolved', color: '#059669' },
    { key: 'Closed', color: '#94a3b8' }
  ];

  // Filtered Tickets
  const filteredTickets = baseTickets.filter((tkt) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      tkt.ticket_number?.toLowerCase().includes(term) ||
      tkt.subject?.toLowerCase().includes(term) ||
      tkt.startup_name?.toLowerCase().includes(term) ||
      tkt.founder_name?.toLowerCase().includes(term);

    const matchStatus = statusFilter === 'All' || tkt.status === statusFilter;
    const matchCategory = categoryFilter === 'All' || tkt.category === categoryFilter;
    const matchPriority = priorityFilter === 'All' || tkt.priority === priorityFilter;

    return matchSearch && matchStatus && matchCategory && matchPriority;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 mb-1">
            <LifeBuoy className="w-4 h-4 text-emerald-600" />
            <span>Incubation Operational Support</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Help Desk &amp; Founder Support Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Direct communication channel between incubated ventures and the incubation management directorate for grant tranches, lab slots, and compliance.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={loadData}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs transition"
            title="Refresh tickets"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto">
        {!isAdmin ? (
          <>
            <button
              onClick={() => { setActiveTab('my-tickets'); setTicketSuccess(null); }}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 whitespace-nowrap ${
                activeTab === 'my-tickets'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>My Support Tickets ({tickets.length})</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black" title="Tickets with a new reply from the incubator">
                  {unreadCount} new
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('raise-ticket'); setTicketSuccess(null); }}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 whitespace-nowrap ${
                activeTab === 'raise-ticket'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Raise Support Ticket</span>
            </button>

            <button
              onClick={() => { setActiveTab('request-callback'); setCallbackSuccess(null); }}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 whitespace-nowrap ${
                activeTab === 'request-callback'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Request Phone Callback ({callbacks.length})</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setActiveTab('tickets-admin'); setStatusFilter('All'); }}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 whitespace-nowrap ${
                activeTab === 'tickets-admin'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>All Active Support Tickets ({activeTickets.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('callbacks-admin'); setStatusFilter('All'); }}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 whitespace-nowrap ${
                activeTab === 'callbacks-admin'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Callback Request Queue ({activeCallbacks.length})</span>
            </button>
          </>
        )}
      </div>

      {/* Admin: active work queue vs completed archive */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold self-start" role="group" aria-label="Request queue view">
            <button
              onClick={() => { setAdminView('active'); setStatusFilter('All'); }}
              aria-pressed={adminView === 'active'}
              className={`px-3 py-1.5 rounded-lg transition ${adminView === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Active queue ({activeTab === 'callbacks-admin' ? activeCallbacks.length : activeTickets.length})
            </button>
            <button
              onClick={() => { setAdminView('completed'); setStatusFilter('All'); }}
              aria-pressed={adminView === 'completed'}
              className={`px-3 py-1.5 rounded-lg transition ${adminView === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Completed ({activeTab === 'callbacks-admin' ? completedCallbacks.length : completedTickets.length})
            </button>
          </div>
          <p className="text-[12px] text-slate-500">
            {adminView === 'active'
              ? 'Completed requests leave this queue automatically. Updates refresh every 30 seconds.'
              : 'Founders keep their copy of the conversation. Delete removes a request permanently.'}
          </p>
        </div>
      )}

      {/* ================= TAB 1: TICKETS LIST (STARTUP OR ADMIN) ================= */}
      {(activeTab === 'my-tickets' || activeTab === 'tickets-admin') && (
        <div className="space-y-4">
          {/* Ticket status summary: click a status to filter the list below */}
          {baseTickets.length > 0 && (
            <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-bold text-slate-900">Ticket status overview</p>
                {statusFilter !== 'All' && (
                  <button
                    onClick={() => setStatusFilter('All')}
                    className="text-[12px] font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <div className="flex h-2.5 w-full gap-[2px] rounded-full overflow-hidden bg-slate-100" role="img" aria-label="Ticket status distribution">
                {TICKET_STATUS_META.map((st) => {
                  const count = baseTickets.filter((t) => t.status === st.key).length;
                  return count > 0 ? (
                    <div
                      key={st.key}
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(count / baseTickets.length) * 100}%`,
                        background: st.color,
                        opacity: statusFilter === 'All' || statusFilter === st.key ? 1 : 0.3
                      }}
                    />
                  ) : null;
                })}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
                {TICKET_STATUS_META.map((st) => {
                  const count = baseTickets.filter((t) => t.status === st.key).length;
                  const selected = statusFilter === st.key;
                  return (
                    <button
                      key={st.key}
                      onClick={() => setStatusFilter(selected ? 'All' : st.key)}
                      aria-pressed={selected}
                      title={`Show ${st.key} tickets`}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/15'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: st.color }} />
                        {st.key}
                      </span>
                      <strong className="text-slate-900 tabular-nums">{count}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ticket number (VB-TKT-...), subject, or startup..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
              >
                <option value="All">All Priorities</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Category</th>
                    {isAdmin && <th className="py-3 px-4">Startup / Founder</th>}
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-500">
                        {isAdmin && adminView === 'active' && activeTickets.length === 0
                          ? 'All caught up. There are no open requests. Completed requests are in the Completed view.'
                          : isAdmin && adminView === 'completed' && completedTickets.length === 0
                          ? 'No completed requests yet.'
                          : 'No support tickets found matching criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((tkt) => (
                      <tr key={tkt.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {tkt.ticket_number}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                          {!isAdmin && hasUnreadReply(tkt) && (
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 align-middle" aria-label="New reply" />
                          )}
                          {tkt.subject}
                          {!isAdmin && hasUnreadReply(tkt) && (
                            <span className="ml-1.5 text-[11px] font-bold text-emerald-700">New reply</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {tkt.category}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{tkt.startup_name}</span>
                            <span className="text-[12px] text-slate-500">{tkt.founder_name}</span>
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              tkt.priority === 'Urgent'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : tkt.priority === 'High'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tkt.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              tkt.status === 'Resolved' || tkt.status === 'Closed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : tkt.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {tkt.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openTicket(tkt)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition"
                          >
                            {isAdmin && tkt.status === 'Open' ? 'Review & Verify' : 'Open Thread'} &rarr;
                          </button>
                          {isAdmin && adminView === 'completed' && (
                            <div className="inline-flex items-center gap-1.5 ml-1.5">
                              <button
                                onClick={() => handleReopenTicket(tkt)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                                title="Move back to the active queue"
                              >
                                Reopen
                              </button>
                              <button
                                onClick={() => handleDeleteTicket(tkt)}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                                title="Permanently delete this request"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: RAISE SUPPORT TICKET (STARTUP) ================= */}
      {!isAdmin && activeTab === 'raise-ticket' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Submit an Official Incubator Support Ticket
            </h3>
            <p className="text-xs text-slate-500">
              Your inquiry will be logged with a unique tracking ID and assigned to an incubator program officer.
            </p>
          </div>

          {ticketSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Ticket Created Successfully!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your ticket tracking number is <strong className="font-mono text-emerald-700">{ticketSuccess}</strong>.
                Incubator officers will reply directly through this ticket thread.
              </p>
              <button
                onClick={() => setActiveTab('my-tickets')}
                className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
              >
                View in My Tickets
              </button>
            </div>
          ) : (
            <form onSubmit={handleRaiseTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ticket Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. Tranche 2 Disbursal Utilization Certificate Verification"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                {ticketErrors.subject && (
                  <p className="text-rose-500 text-[11px] mt-1">{ticketErrors.subject}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option>Grant Disbursal &amp; UC</option>
                    <option>Lab &amp; Fabrication Facility</option>
                    <option>Legal &amp; IPR Advisory</option>
                    <option>Mentorship Scheduling</option>
                    <option>MCA / DPIIT Compliance</option>
                    <option>General Incubator Query</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Description &amp; Specific Assistance Required <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Provide all context, milestones completed, reference numbers, or obstacles..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                {ticketErrors.description && (
                  <p className="text-rose-500 text-[11px] mt-1">{ticketErrors.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition disabled:opacity-50"
                >
                  {submittingTicket ? 'Logging Ticket...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ================= TAB 3: REQUEST PHONE CALLBACK (STARTUP) ================= */}
      {!isAdmin && activeTab === 'request-callback' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Schedule a Phone Callback with Incubator Directorate
              </h3>
              <p className="text-xs text-slate-500">
                Choose a preferred date and time window. An officer will call your registered contact number.
              </p>
            </div>

            {callbackSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Callback Scheduled!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your reference number is <strong className="font-mono text-emerald-700">{callbackSuccess}</strong>.
                  Our officers will reach out on your selected date and time.
                </p>
                <button
                  onClick={() => setCallbackSuccess(null)}
                  className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg"
                >
                  Schedule Another Callback
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestCallback} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      value={newCallback.phone}
                      onChange={(e) => setNewCallback({ ...newCallback, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Reason for Callback
                    </label>
                    <select
                      value={newCallback.reason}
                      onChange={(e) => setNewCallback({ ...newCallback, reason: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option>Grant Tranche Disbursal Inquiry</option>
                      <option>Prototyping Lab Equipment Allocation</option>
                      <option>Investor Pitch Deck Guidance</option>
                      <option>DPIIT / MCA Statutory Compliance</option>
                      <option>MoU &amp; Incubation Agreement Terms</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={newCallback.preferred_date}
                      onChange={(e) => setNewCallback({ ...newCallback, preferred_date: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={newCallback.preferred_time_window}
                      onChange={(e) => setNewCallback({ ...newCallback, preferred_time_window: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option>Morning (10 AM - 1 PM)</option>
                      <option>Afternoon (2 PM - 5 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Specific Points or Context for Call
                  </label>
                  <textarea
                    rows={3}
                    value={newCallback.additional_details}
                    onChange={(e) => setNewCallback({ ...newCallback, additional_details: e.target.value })}
                    placeholder="Provide brief notes so the assigned officer can prepare before calling..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={submittingCallback}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition disabled:opacity-50"
                  >
                    {submittingCallback ? 'Requesting...' : 'Submit Callback Request'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Past Callback Requests */}
          {callbacks.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Your Past &amp; Upcoming Callbacks
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                {callbacks.map((cb) => (
                  <div key={cb.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-800">{cb.reference_number}</span>
                        <span className="font-semibold text-slate-900">{cb.reason}</span>
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        {cb.preferred_date} • {cb.preferred_time_window} • Phone: {cb.phone}
                      </p>
                      {cb.admin_notes && (
                        <p className="mt-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-[12px] text-emerald-900">
                          <strong>Incubator response:</strong> {cb.admin_notes}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        cb.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {cb.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: CALLBACKS QUEUE (ADMIN) ================= */}
      {isAdmin && activeTab === 'callbacks-admin' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Founder Phone Callback Requests
              </h3>
              <p className="text-xs text-slate-500">
                Queue of scheduled callback requests requiring incubator officer calls
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Startup / Founder</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Preferred Slot</th>
                  <th className="py-3 px-4">Topic / Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {baseCallbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      {adminView === 'active' ? 'No callback requests in the queue.' : 'No completed callbacks yet.'}
                    </td>
                  </tr>
                ) : (
                  baseCallbacks.map((cb) => (
                    <tr key={cb.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {cb.reference_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{cb.startup_name}</span>
                        <span className="text-[12px] text-slate-500">{cb.founder_name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {cb.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold block">{cb.preferred_date}</span>
                        <span className="text-[11px] text-slate-500">{cb.preferred_time_window}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 max-w-xs truncate">
                        {cb.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            cb.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : cb.status === 'Scheduled'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {cb.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {cb.status !== 'Completed' && (
                            <button
                              onClick={() => handleUpdateCallback(cb.id, 'Completed')}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px]"
                            >
                              Mark Done
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedCallback(cb); setAdminCallbackNote(cb.admin_notes || ''); }}
                            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[12px]"
                          >
                            {cb.status === 'Requested' ? 'Verify & reply' : 'Details'}
                          </button>
                          {cb.status === 'Completed' && (
                            <button
                              onClick={() => handleDeleteCallback(cb)}
                              className="px-2.5 py-1 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[12px]"
                              title="Permanently delete this callback"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TICKET CONVERSATION THREAD MODAL ================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedTicket.ticket_number}
                  </span>
                  <span className="text-[11px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedTicket.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedTicket.subject}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Raised by {selectedTicket.founder_name} ({selectedTicket.startup_name})
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                )}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Request progress tracker (both sides) */}
            <ol className="grid grid-cols-4 gap-1.5 pt-3 shrink-0" aria-label="Request progress">
              {TICKET_STAGES.map((label, i) => {
                const stage = ticketStage(selectedTicket);
                const rejected = selectedTicket.status === 'Closed' && i === 3;
                const reached = i <= stage;
                return (
                  <li key={label} className="min-w-0" aria-current={i === stage ? 'step' : undefined}>
                    <div className={`h-1.5 rounded-full ${reached ? (rejected ? 'bg-slate-400' : 'bg-emerald-500') : 'bg-slate-200'}`} />
                    <p className={`mt-1 text-[11px] font-semibold truncate ${reached ? 'text-slate-800' : 'text-slate-500'}`}>
                      {rejected ? 'Closed' : label}
                    </p>
                  </li>
                );
              })}
            </ol>

            {/* Admin workflow actions */}
            {isAdmin && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 shrink-0 space-y-2.5">
                {!workflowAction ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedTicket.status === 'Open' && (
                      <button
                        onClick={handleVerifyTicket}
                        disabled={workflowBusy}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                        title="Confirm this is a valid request and notify the founder"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {workflowBusy ? 'Verifying...' : 'Verify & accept'}
                      </button>
                    )}
                    {!isTicketDone(selectedTicket) && (
                      <>
                        <button
                          onClick={() => setWorkflowAction('complete')}
                          disabled={workflowBusy}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark completed
                        </button>
                        <button
                          onClick={() => setWorkflowAction('reject')}
                          disabled={workflowBusy}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50"
                          title="Close a request that is invalid or a duplicate"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                    {isTicketDone(selectedTicket) && (
                      <>
                        <span className="text-xs text-slate-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          This request is {selectedTicket.status.toLowerCase()} and is in the Completed archive.
                        </span>
                        <button
                          onClick={() => handleReopenTicket(selectedTicket)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs"
                        >
                          Reopen
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(selectedTicket)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                        >
                          Delete permanently
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleFinishTicket} className="space-y-2">
                    <label htmlFor="workflow-note" className="block text-xs font-bold text-slate-800">
                      {workflowAction === 'complete'
                        ? 'Resolution message to the founder'
                        : 'Reason for rejecting (sent to the founder)'}
                      <span className="text-rose-500"> *</span>
                    </label>
                    <textarea
                      id="workflow-note"
                      rows={3}
                      autoFocus
                      value={workflowNote}
                      onChange={(e) => setWorkflowNote(e.target.value)}
                      placeholder={
                        workflowAction === 'complete'
                          ? 'e.g. Tranche 2 has been released to your account. The UC has been accepted.'
                          : 'e.g. This is a duplicate of VB-TKT-1042, which we are already handling.'
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeWorkflowBox}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={workflowBusy || !workflowNote.trim()}
                        className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs disabled:opacity-50 ${
                          workflowAction === 'complete' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {workflowBusy
                          ? 'Saving...'
                          : workflowAction === 'complete'
                          ? 'Send & complete request'
                          : 'Send & close request'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Founder: completion notice */}
            {!isAdmin && isTicketDone(selectedTicket) && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  The incubation team marked this request <strong>{selectedTicket.status.toLowerCase()}</strong>. If you still need
                  help, raise a new support ticket so it reaches the active queue.
                </span>
              </div>
            )}

            {/* Conversation Messages Thread (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {/* Initial Ticket Description Message */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    {selectedTicket.founder_name} (Founder)
                  </span>
                  <span className="text-[12px] text-slate-500">
                    {new Date(selectedTicket.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Thread Responses */}
              {(selectedTicket.responses || []).map((resp) => {
                // Hide internal responses from founders!
                if (!isAdmin && resp.is_internal) return null;

                return (
                  <div
                    key={resp.id}
                    className={`p-4 rounded-xl text-xs space-y-1.5 border ${
                      resp.is_internal
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : (resp.author_role || resp.responder_role)?.includes('Directorate') || (resp.author_role || resp.responder_role) === 'admin'
                        ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{resp.author_name || resp.responder_name || 'VentureBharat Directorate'}</span>
                        <span className="text-[11px] text-slate-500">({resp.author_role || resp.responder_role || 'admin'})</span>
                        {resp.is_internal && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold text-[11px] uppercase">
                            Staff Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(resp.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-line">{resp.message}</p>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleAddReply} className="pt-3 border-t border-slate-100 shrink-0 space-y-2">
              {isAdmin && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-1.5 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalReply}
                      onChange={(e) => setIsInternalReply(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-amber-900">
                      Internal Staff Note (Hidden from Startup Founder)
                    </span>
                  </label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  placeholder={
                    isAdmin
                      ? isInternalReply
                        ? 'Write internal staff note...'
                        : 'Write official response to founder...'
                      : 'Add a follow-up reply...'
                  }
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={submittingReply || !ticketReplyText.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CALLBACK DETAILS MODAL (ADMIN) ================= */}
      {selectedCallback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                Callback: {selectedCallback.reference_number}
              </h3>
              <button
                onClick={() => setSelectedCallback(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <p><strong>Startup:</strong> {selectedCallback.startup_name}</p>
              <p><strong>Founder:</strong> {selectedCallback.founder_name}</p>
              <p><strong>Phone:</strong> {selectedCallback.phone}</p>
              <p><strong>Slot:</strong> {selectedCallback.preferred_date} • {selectedCallback.preferred_time_window}</p>
              <p><strong>Reason:</strong> {selectedCallback.reason}</p>
              {selectedCallback.additional_details && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-slate-600">{selectedCallback.additional_details}</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Message to founder <span className="font-normal text-slate-500">(visible to the startup)</span>
              </label>
              <textarea
                rows={2}
                value={adminCallbackNote}
                onChange={(e) => setAdminCallbackNote(e.target.value)}
                placeholder="e.g. Verified. An officer will call you on Wednesday at 11:30 AM."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
              <button
                onClick={() => handleUpdateCallback(selectedCallback.id, 'Scheduled')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Verify &amp; schedule
              </button>
              <button
                onClick={() => handleUpdateCallback(selectedCallback.id, 'Completed')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 left-5 sm:left-auto z-[60] max-w-sm px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-start gap-2 ${
            toast.tone === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-emerald-200 text-slate-800'
          }`}
        >
          {toast.tone === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

