import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  Settings,
  Eye,
  Edit3,
  Sparkles,
  ExternalLink,
  Search,
  Check,
  X,
  RefreshCw,
  HelpCircle,
  Copy,
  Inbox
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';
import { communicationApi } from '../services/api';

export default function CommunicationHub({ isAdmin = true, currentUser }) {
  const [subTab, setSubTab] = useState('compose'); // 'compose' | 'templates' | 'history'
  const [resendStatus, setResendStatus] = useState({ configured: false, fromEmail: '' });
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Templates & Logs
  const [templates, setTemplates] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Composer State
  const [audience, setAudience] = useState('All Active Cohort Startups');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [senderName, setSenderName] = useState('VentureBharat Incubation Directorate');
  const [senderEmail, setSenderEmail] = useState('director@venturebharat.in');
  const [subject, setSubject] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [testEmailAddress, setTestEmailAddress] = useState(currentUser?.email || '');
  
  // Feedback & Modal states
  const [actionFeedback, setActionFeedback] = useState(null);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [templateEditModal, setTemplateEditModal] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    id: '',
    template_name: '',
    category: 'General',
    subject: '',
    body_content: '',
    supported_variables: []
  });

  // Check Resend Status
  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await communicationApi.getStatus();
      setResendStatus(res || { configured: false });
      if (res?.fromEmail) {
        setSenderEmail(res.fromEmail);
      }
    } catch (err) {
      console.warn('Communication service check note:', err);
      setResendStatus({ configured: false, note: err.message });
    } finally {
      setCheckingStatus(false);
    }
  };

  const loadTemplatesAndLogs = async () => {
    setLoadingTemplates(true);
    try {
      const [tplData, logData] = await Promise.all([
        supabaseService.getEmailTemplates(),
        supabaseService.getEmailLogs()
      ]);
      setTemplates(tplData || []);
      setEmailLogs(logData || []);
    } catch (err) {
      console.error('Failed loading templates/logs:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    checkStatus();
    loadTemplatesAndLogs();
  }, []);

  // When a template is picked from dropdown, fill subject and body
  const handleSelectTemplate = (id) => {
    setSelectedTemplateId(id);
    if (!id) return;
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      setSubject(tpl.subject || '');
      setBodyContent(tpl.body_content || '');
    }
  };

  // Insert variable tag into body
  const handleInsertVariable = (variable) => {
    setBodyContent((prev) => prev + ' ' + variable);
  };

  // Estimated count based on audience
  const getAudienceCount = () => {
    switch (audience) {
      case 'All Active Cohort Startups':
        return 14;
      case 'Cohort 12 (Spring 2026)':
        return 8;
      case 'Cohort 11 (Winter 2025)':
        return 6;
      case 'Pending Applicants':
        return 9;
      case 'Empanelled Mentors':
        return 16;
      case 'Investor Network':
        return 12;
      default:
        return 10;
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) {
      setActionFeedback({ type: 'error', message: 'Please provide a valid test recipient email address.' });
      return;
    }
    if (!subject.trim()) {
      setActionFeedback({ type: 'error', message: 'Email subject is required.' });
      return;
    }

    setSendingTest(true);
    setActionFeedback(null);

    try {
      const response = await communicationApi.sendTestEmail({
        to: testEmailAddress.trim(),
        subject,
        html: bodyContent
      });

      if (response.success) {
        setActionFeedback({
          type: 'success',
          message: `Test email successfully sent to ${testEmailAddress} via Resend.`
        });
        await supabaseService.logEmailSend({
          recipient_group: 'Test Recipient',
          recipient_count: 1,
          subject,
          status: 'Delivered',
          sender: senderEmail
        });
        loadTemplatesAndLogs();
      } else {
        setActionFeedback({
          type: 'error',
          message: response.error || 'Failed to dispatch test email.'
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Resend API call failed. Verify RESEND_API_KEY in .env.'
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Send Broadcast
  const handleSendBroadcast = async () => {
    if (!subject.trim()) {
      setActionFeedback({ type: 'error', message: 'Email subject cannot be empty.' });
      return;
    }
    if (!bodyContent.trim()) {
      setActionFeedback({ type: 'error', message: 'Email message body cannot be empty.' });
      return;
    }

    // Explicit instruction: DO NOT simulate successful delivery when unconfigured!
    if (!resendStatus.configured) {
      setActionFeedback({
        type: 'error',
        message: 'Resend API is not configured. Delivery blocked. Please configure RESEND_API_KEY in your .env file before broadcasting real emails.'
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to broadcast this communication to ${getAudienceCount()} recipients in "${audience}"?`)) {
      return;
    }

    setSendingBroadcast(true);
    setActionFeedback(null);

    try {
      const response = await communicationApi.sendBroadcast({
        audience,
        subject,
        html: bodyContent,
        senderName,
        fromEmail: senderEmail
      });

      if (response.success) {
        setActionFeedback({
          type: 'success',
          message: `Broadcast successfully dispatched to ${response.sentCount || getAudienceCount()} recipients in ${audience} via Resend.`
        });
        await supabaseService.logEmailSend({
          recipient_group: audience,
          recipient_count: response.sentCount || getAudienceCount(),
          subject,
          status: 'Delivered',
          sender: senderEmail
        });
        loadTemplatesAndLogs();
      } else {
        setActionFeedback({
          type: 'error',
          message: response.error || 'Failed to dispatch broadcast.'
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Error communicating with Resend server endpoint.'
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Open Template Edit Modal
  const handleOpenEditTemplate = (tpl) => {
    setTemplateForm({
      id: tpl.id,
      template_name: tpl.template_name,
      category: tpl.category || 'General',
      subject: tpl.subject,
      body_content: tpl.body_content,
      supported_variables: tpl.supported_variables || []
    });
    setTemplateEditModal(tpl);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      await supabaseService.saveEmailTemplate(templateForm);
      await loadTemplatesAndLogs();
      setTemplateEditModal(null);
    } catch (err) {
      alert('Error saving template: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 mb-1">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Official Incubator Outreach Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Email Communication Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Official announcements, admissions notices, grant disbursal letters, and milestone reminders powered by Resend transactional infrastructure.
          </p>
        </div>

        {/* Resend Status Pill */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={checkStatus}
            disabled={checkingStatus}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs transition"
            title="Refresh Resend status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
          </button>

          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-2 ${
              resendStatus.configured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                resendStatus.configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>
              {resendStatus.configured ? 'Resend Service Active' : 'Resend Key Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Resend Warning Callout Banner if not configured */}
      {!resendStatus.configured && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-950 text-xs">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="font-bold text-amber-900">
                Resend API Key Not Yet Configured in Environment (.env)
              </h3>
              <p className="text-amber-800 leading-relaxed">
                The communication hub is running in safe mode. Real transactional emails require a free Resend API key.
                Per incubator protocol, real deliveries are blocked to prevent false delivery confirmations.
              </p>
              <div className="mt-2 p-2.5 bg-white/70 rounded-lg border border-amber-200/60 font-mono text-[11px] space-y-1 text-slate-800">
                <p>1. Sign up for free at <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">resend.com</a></p>
                <p>2. Create an API Key under <strong>API Keys</strong> &gt; <strong>Create API Key</strong></p>
                <p>3. Set in your <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code> file: <code className="text-emerald-800 font-bold">RESEND_API_KEY=re_your_api_key_here</code></p>
                <p>4. Set sender email: <code className="text-emerald-800 font-bold">RESEND_FROM_EMAIL=onboarding@resend.dev</code> (or verified domain)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setSubTab('compose')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            subTab === 'compose'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Compose &amp; Broadcast</span>
        </button>

        <button
          onClick={() => setSubTab('templates')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            subTab === 'templates'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Email Template Library ({templates.length})</span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            subTab === 'history'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Dispatched Send Logs ({emailLogs.length})</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= SUB-TAB 1: COMPOSE & BROADCAST ================= */}
      {subTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Email Composer (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  New Communication Draft
                </h3>
                {/* Template quick loader */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 font-medium">Load Template:</span>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[220px]"
                  >
                    <option value="">-- Choose From 12 Templates --</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.template_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Audience & From Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Recipient Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <option>All Active Cohort Startups</option>
                    <option>Cohort 12 (Spring 2026)</option>
                    <option>Cohort 11 (Winter 2025)</option>
                    <option>Pending Applicants</option>
                    <option>Empanelled Mentors</option>
                    <option>Investor Network</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    From Sender Identity
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Subject Line */}
              <div className="text-xs">
                <label className="block font-semibold text-slate-700 mb-1">
                  Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Important Notice: Milestone Review Schedule - VentureBharat"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Dynamic Variable Insertion Pills */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-600 font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Insert Dynamic Variables (click to insert into message):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '{{founder_name}}',
                    '{{startup_name}}',
                    '{{cohort_name}}',
                    '{{dpiit_number}}',
                    '{{milestone_name}}',
                    '{{portal_link}}'
                  ].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="px-2 py-1 rounded bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-[11px] font-mono font-medium text-slate-700 transition shadow-2xs"
                    >
                      + {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Content Editor */}
              <div className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Message Body (HTML / Rich Text Supported) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="inline-flex items-center space-x-1 text-emerald-700 hover:underline font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open HTML Preview</span>
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={bodyContent}
                  onChange={(e) => setBodyContent(e.target.value)}
                  placeholder="<p>Dear {{founder_name}},</p><p>We are writing to share an important update regarding {{startup_name}}...</p>"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {/* Footer preview note */}
              <div className="p-3 rounded-lg bg-slate-100/70 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <strong>Statutory Footer Appended Automatically:</strong> All dispatched emails automatically include incubator address (Atal Incubation Centre, Tech Innovation Park, New Delhi), anti-spam compliance, and founder privacy protection.
              </div>

              {/* Actions Toolbar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1.5"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Preview Email</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSendBroadcast}
                    disabled={sendingBroadcast}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {sendingBroadcast ? 'Broadcasting...' : `Broadcast to ${getAudienceCount()} Startups`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar & Test Email Tool (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Audience Summary Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Broadcast Audience Summary
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Group:</span>
                  <span className="font-bold text-slate-800">{audience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Estimated Reach:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {getAudienceCount()} Recipients
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">From Address:</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate max-w-[170px]">
                    {senderEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Email Dispatch Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-slate-800">
                <Mail className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Send Test Verification
                </h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Safely verify rendering and formatting in an inbox before broadcasting to all founders.
              </p>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Recipient Test Address
                </label>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={sendingTest}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingTest ? 'Sending Test...' : 'Send Test Email'}</span>
                </button>
              </div>
            </div>

            {/* Resend Architecture Info Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Enterprise Delivery Engine</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Transactional messaging runs over TLS-encrypted REST endpoints with DMARC, DKIM, and SPF validation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: TEMPLATE LIBRARY ================= */}
      {subTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Pre-approved Incubator Email Templates (12 Core Notices)
            </h3>
            <span className="text-xs text-slate-500">
              Click any template to customize wording or preview message
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      Standard Template
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                    {tpl.template_name}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mb-3 truncate">
                    Subject: {tpl.subject}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 line-clamp-3 mb-3 font-mono">
                    {tpl.body_content.replace(/<[^>]+>/g, ' ')}
                  </div>

                  {tpl.supported_variables && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tpl.supported_variables.map((v, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono text-emerald-800 border border-emerald-100"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      handleSelectTemplate(tpl.id);
                      setSubTab('compose');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    Use in Composer &rarr;
                  </button>
                  <button
                    onClick={() => handleOpenEditTemplate(tpl)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    title="Edit Template"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: SEND LOGS & HISTORY ================= */}
      {subTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Historical Outbound Communication Logs
              </h3>
              <p className="text-xs text-slate-500">
                Audited transactional emails sent to cohort founders, mentors, and partners
              </p>
            </div>
            <button
              onClick={loadTemplatesAndLogs}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4">Subject Line</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4 text-center">Recipients</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No communications logged yet.
                    </td>
                  </tr>
                ) : (
                  emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.sent_at).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.subject}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.recipient_group}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {log.recipient_count}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {log.sender}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= HTML PREVIEW MODAL ================= */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Outbound Email Live Preview
              </h3>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p><strong>From:</strong> {senderName} &lt;{senderEmail}&gt;</p>
                <p><strong>To:</strong> Sample Founder &lt;founder@startup.in&gt;</p>
                <p><strong>Subject:</strong> {subject || '(No subject provided)'}</p>
              </div>

              {/* Rendered HTML Box */}
              <div className="p-6 bg-white rounded-xl border border-slate-300 shadow-inner prose prose-sm max-w-none text-slate-800 text-xs">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      bodyContent ||
                      '<p className="text-slate-400 italic">No message content entered yet.</p>'
                  }}
                />
                
                {/* Official email footer */}
                <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 leading-tight">
                  <p>VentureBharat Incubation Foundation (AIC - DST Recognized)</p>
                  <p>Technology Innovation &amp; Prototyping Hub, Okhla Phase III, New Delhi 110020</p>
                  <p className="mt-1">You are receiving this communication as a registered founder under VentureBharat Incubation Cohort.</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT TEMPLATE MODAL ================= */}
      {templateEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Template: {templateForm.template_name}
              </h3>
              <button
                onClick={() => setTemplateEditModal(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={templateForm.template_name}
                  onChange={(e) => setTemplateForm({ ...templateForm, template_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option>Admissions</option>
                  <option>Funding</option>
                  <option>Operations</option>
                  <option>Governance</option>
                  <option>General</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Subject</label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Body HTML Content</label>
                <textarea
                  rows={8}
                  value={templateForm.body_content}
                  onChange={(e) => setTemplateForm({ ...templateForm, body_content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTemplateEditModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

