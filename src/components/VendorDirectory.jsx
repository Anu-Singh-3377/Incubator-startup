import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Check,
  Building2,
  Calendar,
  Gift,
  Mail,
  Phone,
  ShieldCheck,
  Copy,
  CreditCard,
  FileCheck2,
  Server,
  Scale,
  Award
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';

export default function VendorDirectory({ isAdmin = false, currentUser }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Modals
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [redemptionModal, setRedemptionModal] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    service_category: 'Cloud & Infrastructure',
    description: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    perks_summary: '',
    eligibility: 'All active VentureBharat incubated cohort startups.',
    expiry_date: '2027-12-31',
    redemption_instructions: '',
    approval_status: 'Approved',
    internal_notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await supabaseService.getVendors();
      setVendors(data || []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.company_name.trim()) errs.company_name = 'Vendor company name is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    if (!formData.perks_summary.trim()) errs.perks_summary = 'Perks summary is required.';
    if (!formData.contact_email.trim() || !formData.contact_email.includes('@')) {
      errs.contact_email = 'Valid partner email is required.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      company_name: '',
      service_category: 'Cloud & Infrastructure',
      description: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      website_url: '',
      perks_summary: '',
      eligibility: 'All active VentureBharat incubated cohort startups.',
      expiry_date: '2027-12-31',
      redemption_instructions: '',
      approval_status: 'Approved',
      internal_notes: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vnd) => {
    setEditingId(vnd.id);
    setFormData({
      company_name: vnd.company_name || '',
      service_category: vnd.service_category || 'Cloud & Infrastructure',
      description: vnd.description || '',
      contact_person: vnd.contact_person || '',
      contact_email: vnd.contact_email || '',
      contact_phone: vnd.contact_phone || '',
      website_url: vnd.website_url || '',
      perks_summary: vnd.perks_summary || '',
      eligibility: vnd.eligibility || 'All active VentureBharat incubated cohort startups.',
      expiry_date: vnd.expiry_date || '2027-12-31',
      redemption_instructions: vnd.redemption_instructions || '',
      approval_status: vnd.approval_status || 'Approved',
      internal_notes: vnd.internal_notes || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      if (editingId) {
        await supabaseService.updateVendor(editingId, formData);
        setFeedback({ type: 'success', message: 'Vendor partner details updated successfully.' });
      } else {
        await supabaseService.addVendor(formData);
        setFeedback({ type: 'success', message: 'New approved vendor registered successfully.' });
      }
      await loadVendors();
      setTimeout(() => {
        setIsFormOpen(false);
        setFeedback(null);
      }, 900);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from approved vendor partners?`)) return;
    try {
      await supabaseService.deleteVendor(id);
      await loadVendors();
      if (selectedVendor?.id === id) setSelectedVendor(null);
    } catch (err) {
      alert('Error deleting vendor: ' + err.message);
    }
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered List
  const filteredVendors = vendors.filter((v) => {
    // If founder, do not display unapproved vendors
    if (!isAdmin && v.approval_status !== 'Approved') return false;

    const term = searchTerm.toLowerCase();
    const matchSearch =
      v.company_name?.toLowerCase().includes(term) ||
      v.service_category?.toLowerCase().includes(term) ||
      v.description?.toLowerCase().includes(term) ||
      v.perks_summary?.toLowerCase().includes(term);

    const matchCategory =
      categoryFilter === 'All' || v.service_category === categoryFilter;

    const matchStatus =
      statusFilter === 'All' || v.approval_status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.ceil(filteredVendors.length / pageSize) || 1;
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 mb-1">
            <Gift className="w-4 h-4 text-emerald-600" />
            <span>Incubation Partner Ecosystem</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Approved Vendor Catalog &amp; Startup Perks
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Empanelled corporate partners offering pre-negotiated startup credits, cloud infrastructure, legal IPR support, and audit subsidies.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow transition flex items-center space-x-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Approved Vendor</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Partner Vendors</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{vendors.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Empanelled organizations</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cloud &amp; DevOps</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {vendors.filter((v) => v.service_category?.includes('Cloud')).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">AWS, Azure &amp; GCP</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Legal &amp; Patents</p>
          <p className="text-2xl font-black text-blue-700 mt-1">
            {vendors.filter((v) => v.service_category?.includes('Legal')).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Govt subsidized IPR</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Credit Value</p>
          <p className="text-2xl font-black text-amber-700 mt-1">₹45+ Lakh</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Available per cohort venture</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search vendor perks, credits, or partner names (e.g. AWS, Razorpay, CA)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Cloud & Infrastructure">Cloud &amp; Infrastructure</option>
            <option value="Legal & IPR">Legal &amp; IPR</option>
            <option value="Accounting & Audit">Accounting &amp; Audit</option>
            <option value="Banking & FinTech">Banking &amp; FinTech</option>
            <option value="Prototyping & Testing Labs">Prototyping &amp; Testing Labs</option>
            <option value="HR & Payroll">HR &amp; Payroll</option>
          </select>

          {isAdmin && (
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Under Review">Under Review</option>
              <option value="Expired">Expired</option>
            </select>
          )}
        </div>
      </div>

      {/* Grid of Vendors */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading partner vendors...</p>
        </div>
      ) : paginatedVendors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Gift className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No vendors found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedVendors.map((vnd) => (
            <div
              key={vnd.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Header: Company & Category */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1.5">
                      {vnd.service_category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                      {vnd.company_name}
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      vnd.approval_status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {vnd.approval_status}
                  </span>
                </div>

                {/* Highlighted Perks Callout Box */}
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-950 mb-3">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-800 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Incubator Exclusive Perk</span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed">
                    {vnd.perks_summary}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {vnd.description}
                </p>

                {/* Eligibility & Expiry */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Eligibility:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">
                      {vnd.eligibility}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Valid Till:</span>
                    <span className="font-semibold text-slate-700">{vnd.expiry_date}</span>
                  </div>
                </div>

                {/* Internal notes banner for Admin */}
                {isAdmin && vnd.internal_notes && (
                  <div className="mt-3 p-2 bg-amber-50/80 border border-amber-200/70 rounded-lg text-[11px] text-amber-900 leading-tight">
                    <span className="font-bold">Staff Note: </span>
                    <span className="line-clamp-2">{vnd.internal_notes}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {vnd.website_url && (
                    <a
                      href={vnd.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-white transition border border-transparent hover:border-slate-200"
                      title="Partner Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {vnd.contact_email && (
                    <a
                      href={`mailto:${vnd.contact_email}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-white transition border border-transparent hover:border-slate-200"
                      title={vnd.contact_email}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setRedemptionModal(vnd)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                  >
                    Claim Perk
                  </button>

                  {isAdmin && (
                    <div className="flex items-center space-x-1 ml-1">
                      <button
                        onClick={() => handleOpenEdit(vnd)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="Edit Vendor"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vnd.id, vnd.company_name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredVendors.length > pageSize && (
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredVendors.length)}</strong> of{' '}
            <strong>{filteredVendors.length}</strong> partners
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ================= CLAIM PERK / REDEMPTION MODAL ================= */}
      {redemptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {redemptionModal.service_category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Claim {redemptionModal.company_name} Perk
                </h3>
              </div>
              <button
                onClick={() => setRedemptionModal(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Exclusive Offer Details
                </span>
                <p className="font-semibold text-emerald-950 text-sm">
                  {redemptionModal.perks_summary}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">
                  Redemption Instructions
                </h4>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                  {redemptionModal.redemption_instructions || 'Please contact incubator team for partner redemption voucher.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Partner Contact</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{redemptionModal.contact_person || 'Partner Desk'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{redemptionModal.contact_email}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Offer Validity</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{redemptionModal.expiry_date}</p>
                  <p className="text-[11px] text-slate-500">{redemptionModal.eligibility}</p>
                </div>
              </div>

              {redemptionModal.redemption_instructions && (
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-600 font-semibold truncate mr-2">
                    Copy partner redemption instructions
                  </span>
                  <button
                    onClick={() => handleCopyCode(redemptionModal.redemption_instructions)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-700 flex items-center space-x-1.5 shrink-0"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Info'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {redemptionModal.website_url ? (
                <a
                  href={redemptionModal.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:underline font-bold"
                >
                  <span>Visit Partner Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : <div />}

              <button
                onClick={() => setRedemptionModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADMIN ADD/EDIT FORM MODAL ================= */}
      {isAdmin && isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? 'Edit Vendor Partner' : 'Add New Approved Vendor'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div
                className={`my-3 p-3 rounded-lg text-xs font-semibold ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. AWS Activate or Zoho for Startups"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  {formErrors.company_name && (
                    <p className="text-rose-500 text-[10px] mt-1">{formErrors.company_name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Service Category
                  </label>
                  <select
                    value={formData.service_category}
                    onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Cloud & Infrastructure">Cloud &amp; Infrastructure</option>
                    <option value="Legal & IPR">Legal &amp; IPR</option>
                    <option value="Accounting & Audit">Accounting &amp; Audit</option>
                    <option value="Banking & FinTech">Banking &amp; FinTech</option>
                    <option value="Prototyping & Testing Labs">Prototyping &amp; Testing Labs</option>
                    <option value="HR & Payroll">HR &amp; Payroll</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Exclusive Perks Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.perks_summary}
                  onChange={(e) => setFormData({ ...formData, perks_summary: e.target.value })}
                  placeholder="e.g. $5,000 AWS Activate Cloud Credits + 1 Year Business Support"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
                {formErrors.perks_summary && (
                  <p className="text-rose-500 text-[10px] mt-1">{formErrors.perks_summary}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description of Offer &amp; Services <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of what this vendor partner provides to incubated startups..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                {formErrors.description && (
                  <p className="text-rose-500 text-[10px] mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Vikramaditya (Ecosystem Manager)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="partners@vendor.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  {formErrors.contact_email && (
                    <p className="text-rose-500 text-[10px] mt-1">{formErrors.contact_email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://vendor.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+91 80 4000 5000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Eligibility</label>
                  <input
                    type="text"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Redemption Instructions &amp; Partner Promo Code
                </label>
                <textarea
                  rows={3}
                  value={formData.redemption_instructions}
                  onChange={(e) => setFormData({ ...formData, redemption_instructions: e.target.value })}
                  placeholder="e.g. Visit partner portal, enter incubator referral code: VB-INNOVATE-2026, and attach DPIIT certificate."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approval Status</label>
                  <select
                    value={formData.approval_status}
                    onChange={(e) => setFormData({ ...formData, approval_status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Internal Staff Notes (Hidden from Startups)
                  </label>
                  <input
                    type="text"
                    value={formData.internal_notes}
                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                    placeholder="e.g. Empanelled partner under DST-NIDHI scheme."
                    className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

