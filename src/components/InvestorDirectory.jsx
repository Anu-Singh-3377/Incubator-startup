import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Check,
  AlertCircle,
  Building2,
  DollarSign,
  Globe,
  Linkedin,
  Mail,
  Phone,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';

export default function InvestorDirectory({ isAdmin = false, currentUser }) {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fund_name: '',
    investor_type: 'Venture Capital Fund',
    contact_name: '',
    email: '',
    phone: '',
    website_url: '',
    linkedin_url: '',
    focus_sectors: 'DeepTech & AI, AgriTech, CleanTech',
    preferred_stage: 'Seed',
    investment_range: '₹25 Lakh - ₹1 Crore',
    preferred_geography: 'India / Pan-India',
    relationship_status: 'Active Partner',
    internal_notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadInvestors = async () => {
    setLoading(true);
    try {
      const data = await supabaseService.getInvestors();
      setInvestors(data || []);
    } catch (err) {
      console.error('Failed to load investors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestors();
  }, []);

  // Validation
  const validate = () => {
    const errs = {};
    if (!formData.fund_name.trim()) errs.fund_name = 'Investor or Fund name is required.';
    if (!formData.contact_name.trim()) errs.contact_name = 'Primary contact person is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid official email is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      fund_name: '',
      investor_type: 'Venture Capital Fund',
      contact_name: '',
      email: '',
      phone: '',
      website_url: '',
      linkedin_url: '',
      focus_sectors: 'DeepTech & AI, AgriTech, CleanTech',
      preferred_stage: 'Seed',
      investment_range: '₹25 Lakh - ₹1 Crore',
      preferred_geography: 'India / Pan-India',
      relationship_status: 'Active Partner',
      internal_notes: ''
    });
    setFormErrors({});
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingId(inv.id);
    setFormData({
      fund_name: inv.fund_name || '',
      investor_type: inv.investor_type || 'Venture Capital Fund',
      contact_name: inv.contact_name || '',
      email: inv.email || '',
      phone: inv.phone || '',
      website_url: inv.website_url || '',
      linkedin_url: inv.linkedin_url || '',
      focus_sectors: inv.focus_sectors || '',
      preferred_stage: inv.preferred_stage || 'Seed',
      investment_range: inv.investment_range || '',
      preferred_geography: inv.preferred_geography || 'India / Pan-India',
      relationship_status: inv.relationship_status || 'Active Partner',
      internal_notes: inv.internal_notes || ''
    });
    setFormErrors({});
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      if (editingId) {
        await supabaseService.updateInvestor(editingId, formData);
        setFeedback({ type: 'success', message: 'Investor profile updated successfully.' });
      } else {
        await supabaseService.addInvestor(formData);
        setFeedback({ type: 'success', message: 'Investor added to VentureBharat Network.' });
      }
      await loadInvestors();
      setTimeout(() => {
        setIsFormOpen(false);
        setFeedback(null);
      }, 1000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove '${name}' from the investor network?`)) return;
    try {
      await supabaseService.deleteInvestor(id);
      await loadInvestors();
      if (selectedInvestor?.id === id) setSelectedInvestor(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Filter & Pagination
  const filteredInvestors = investors.filter((inv) => {
    const matchSearch =
      inv.fund_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.focus_sectors && inv.focus_sectors.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = typeFilter === 'All' || inv.investor_type === typeFilter;
    const matchStage = stageFilter === 'All' || inv.preferred_stage === stageFilter;

    return matchSearch && matchType && matchStage;
  });

  const totalPages = Math.ceil(filteredInvestors.length / pageSize) || 1;
  const paginatedInvestors = filteredInvestors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Summary Metrics
  const vcCount = investors.filter((i) => i.investor_type === 'Venture Capital Fund').length;
  const angelCount = investors.filter((i) => i.investor_type === 'Angel Investor').length;
  const syndicateCount = investors.filter((i) => i.investor_type === 'Syndicate').length;

  return (
    <div className="space-y-5">
      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Investor Network</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{investors.length}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Empanelled Capital Partners</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Venture Capital Funds</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{vcCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Institutional Lead Investors</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Angel Networks</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{angelCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Early-stage Angel Syndicates</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Specialty Syndicates</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{syndicateCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">DeepTech &amp; AgriTech Focus</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search investors by fund name, contact, sector..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Investor Types</option>
              <option value="Venture Capital Fund">VC Funds</option>
              <option value="Angel Investor">Angel Investors</option>
              <option value="Syndicate">Syndicates</option>
            </select>

            <select
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Preferred Stages</option>
              <option value="Idea">Idea Stage</option>
              <option value="Pre-seed">Pre-seed</option>
              <option value="Seed">Seed</option>
              <option value="Growth">Growth</option>
            </select>

            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition ml-auto md:ml-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Investor</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Investor Directory List */}
      {filteredInvestors.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/90 rounded-xl shadow-xs text-xs text-slate-500">
          <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-800 text-sm">No investors found</p>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || typeFilter !== 'All'
              ? 'No investment partners match your search filters.'
              : 'The investor network directory is currently being curated.'}
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              + Add First Investor
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Fund / Investor</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Focus Sectors</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Typical Ticket</th>
                  <th className="p-4">Primary Contact</th>
                  {isAdmin && <th className="p-4">Relationship</th>}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedInvestors.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedInvestor(inv)}
                        className="font-bold text-slate-900 hover:text-emerald-700 text-left block"
                      >
                        {inv.fund_name}
                      </button>
                      <span className="text-[11px] text-slate-400 font-mono">{inv.preferred_geography}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {inv.investor_type}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate font-medium text-slate-800">
                      {inv.focus_sectors}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {inv.preferred_stage}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-800">
                      {inv.investment_range}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{inv.contact_name}</p>
                      <p className="text-[11px] text-slate-500">{inv.email}</p>
                    </td>
                    {isAdmin && (
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {inv.relationship_status}
                        </span>
                      </td>
                    )}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedInvestor(inv)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                          title="View Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(inv)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
                              title="Edit Record"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(inv.id, inv.fund_name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredInvestors.length)} of {filteredInvestors.length} investors
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-semibold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investor Profile Detail Modal */}
      {selectedInvestor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 text-slate-800 text-xs">
            <button
              onClick={() => setSelectedInvestor(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-sm">
                <Building2 className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedInvestor.fund_name}</h3>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mt-0.5">
                  {selectedInvestor.investor_type} • {selectedInvestor.preferred_stage} Stage
                </span>
              </div>
            </div>

            <div className="py-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Ticket Range</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedInvestor.investment_range}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Geography</span>
                  <span className="font-bold text-slate-900">{selectedInvestor.preferred_geography}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Focus Sectors</label>
                <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-slate-800 font-medium">
                  {selectedInvestor.focus_sectors}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Information</span>
                <p className="font-semibold text-slate-900">{selectedInvestor.contact_name}</p>
                <div className="flex flex-wrap items-center gap-3 text-slate-600">
                  <span className="flex items-center gap-1 font-mono"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedInvestor.email}</span>
                  {selectedInvestor.phone && (
                    <span className="flex items-center gap-1 font-mono"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedInvestor.phone}</span>
                  )}
                </div>
              </div>

              {isAdmin && selectedInvestor.internal_notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">Internal Relationship Notes (Staff Only)</span>
                  <p className="text-xs leading-relaxed">{selectedInvestor.internal_notes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedInvestor.website_url && (
                  <a
                    href={selectedInvestor.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
                {selectedInvestor.linkedin_url && (
                  <a
                    href={selectedInvestor.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
              <button
                onClick={() => setSelectedInvestor(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal (Admin Only) */}
      {isFormOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 text-slate-800 text-xs max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingId ? 'Edit Investor Profile' : 'Add Investor to Network'}
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Enter fund thesis, stage preferences, and contact details.
            </p>

            {feedback && (
              <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fund / Investor Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fund_name}
                    onChange={(e) => setFormData({ ...formData, fund_name: e.target.value })}
                    placeholder="e.g. Bharat Seed Ventures"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {formErrors.fund_name && <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.fund_name}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Investor Type</label>
                  <select
                    value={formData.investor_type}
                    onChange={(e) => setFormData({ ...formData, investor_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Venture Capital Fund">Venture Capital Fund</option>
                    <option value="Angel Investor">Angel Investor</option>
                    <option value="Syndicate">Syndicate</option>
                    <option value="Family Office">Family Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="e.g. Vikram Gupta"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="deals@fund.vc"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Stage</label>
                  <select
                    value={formData.preferred_stage}
                    onChange={(e) => setFormData({ ...formData, preferred_stage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Investment Range</label>
                  <input
                    type="text"
                    value={formData.investment_range}
                    onChange={(e) => setFormData({ ...formData, investment_range: e.target.value })}
                    placeholder="e.g. ₹50 Lakh - ₹2 Crore"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship Status</label>
                  <select
                    value={formData.relationship_status}
                    onChange={(e) => setFormData({ ...formData, relationship_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Active Partner">Active Partner</option>
                    <option value="Network Member">Network Member</option>
                    <option value="Prospective">Prospective</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Focus Sectors</label>
                <input
                  type="text"
                  value={formData.focus_sectors}
                  onChange={(e) => setFormData({ ...formData, focus_sectors: e.target.value })}
                  placeholder="e.g. DeepTech & AI, AgriTech, CleanTech"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Relationship Notes (Restricted)</label>
                <textarea
                  rows={2}
                  value={formData.internal_notes}
                  onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                  placeholder="Private notes on partner interaction, past investments, terms..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Investor' : 'Save Investor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

