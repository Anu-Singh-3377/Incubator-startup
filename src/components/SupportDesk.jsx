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

  const loadData = async () => {
    setLoading(true);
    try {
      const startupId = !isAdmin ? currentUser?.id || currentUser?.startup_name : null;
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
        startup_id: currentUser?.id || 'st_01',
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
        startup_id: currentUser?.id || 'st_01',
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
      await supabaseService.addTicketResponse(selectedTicket.id, {
        author_name: currentUser?.full_name || (isAdmin ? 'Directorate Support Desk' : 'Founder'),
        author_role: isAdmin ? 'Incubation Directorate' : 'Startup Founder',
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
      await loadData();
    } catch (err) {
      alert('Error updating callback: ' + err.message);
    }
  };

  // Filtered Tickets
  const filteredTickets = tickets.filter((tkt) => {
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
      <div className="flex items-center space-x-2 border-b border-slate-200">
        {!isAdmin ? (
          <>
            <button
              onClick={() => { setActiveTab('my-tickets'); setTicketSuccess(null); }}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'my-tickets'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>My Support Tickets ({tickets.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('raise-ticket'); setTicketSuccess(null); }}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
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
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
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
              onClick={() => setActiveTab('tickets-admin')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'tickets-admin'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>All Active Support Tickets ({tickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('callbacks-admin')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'callbacks-admin'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Callback Request Queue ({callbacks.length})</span>
            </button>
          </>
        )}
      </div>

      {/* ================= TAB 1: TICKETS LIST (STARTUP OR ADMIN) ================= */}
      {(activeTab === 'my-tickets' || activeTab === 'tickets-admin') && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
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
                      <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-400">
                        No support tickets found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((tkt) => (
                      <tr key={tkt.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {tkt.ticket_number}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                          {tkt.subject}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {tkt.category}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{tkt.startup_name}</span>
                            <span className="text-[11px] text-slate-500">{tkt.founder_name}</span>
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                            onClick={() => setSelectedTicket(tkt)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition"
                          >
                            Open Thread &rarr;
                          </button>
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
                  <p className="text-rose-500 text-[10px] mt-1">{ticketErrors.subject}</p>
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
                  <p className="text-rose-500 text-[10px] mt-1">{ticketErrors.description}</p>
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
                  <div key={cb.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-800">{cb.reference_number}</span>
                        <span className="font-semibold text-slate-900">{cb.reason}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {cb.preferred_date} • {cb.preferred_time_window} • Phone: {cb.phone}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
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
                {callbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No callback requests in the queue.
                    </td>
                  </tr>
                ) : (
                  callbacks.map((cb) => (
                    <tr key={cb.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {cb.reference_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{cb.startup_name}</span>
                        <span className="text-[11px] text-slate-500">{cb.founder_name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {cb.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold block">{cb.preferred_date}</span>
                        <span className="text-[10px] text-slate-400">{cb.preferred_time_window}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 max-w-xs truncate">
                        {cb.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              Mark Done
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCallback(cb)}
                            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px]"
                          >
                            Details
                          </button>
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
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
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
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Thread (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {/* Initial Ticket Description Message */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    {selectedTicket.founder_name} (Founder)
                  </span>
                  <span className="text-[11px] text-slate-400">
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
                        : resp.author_role?.includes('Directorate')
                        ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{resp.author_name}</span>
                        <span className="text-[10px] text-slate-500">({resp.author_role})</span>
                        {resp.is_internal && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold text-[9px] uppercase">
                            Staff Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
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
                className="p-1 rounded text-slate-400 hover:text-slate-700"
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
                Admin Disposition Notes
              </label>
              <textarea
                rows={2}
                value={adminCallbackNote}
                onChange={(e) => setAdminCallbackNote(e.target.value)}
                placeholder="Log discussion outcomes or action items..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
              <button
                onClick={() => handleUpdateCallback(selectedCallback.id, 'Scheduled')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Mark Scheduled
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
    </div>
  );
}

