import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Check,
  Building2,
  FileText,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Scale,
  DollarSign,
  Download,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';

export default function GuidanceCenter({ isAdmin = false, currentUser }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Incorporation & MCA',
    description: '',
    content_checklist: '',
    official_source_url: '',
    file_type: 'PDF Guide',
    is_published: true,
    is_restricted: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await supabaseService.getGuidanceDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to load guidance documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Document title is required.';
    if (!formData.description.trim()) errs.description = 'Description / summary is required.';
    if (!formData.content_checklist.trim()) errs.content_checklist = 'Guidance checklist or instructions are required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Incorporation & MCA',
      description: '',
      content_checklist: '',
      official_source_url: '',
      file_type: 'PDF Guide',
      is_published: true,
      is_restricted: false
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingId(doc.id);
    setFormData({
      title: doc.title || '',
      category: doc.category || 'Incorporation & MCA',
      description: doc.description || '',
      content_checklist: doc.content_checklist || '',
      official_source_url: doc.official_source_url || '',
      file_type: doc.file_type || 'PDF Guide',
      is_published: doc.is_published !== false,
      is_restricted: !!doc.is_restricted
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
        await supabaseService.updateGuidanceDocument(editingId, formData);
        setFeedback({ type: 'success', message: 'Guidance resource updated successfully.' });
      } else {
        await supabaseService.addGuidanceDocument(formData);
        setFeedback({ type: 'success', message: 'New guidance document published.' });
      }
      await loadDocuments();
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

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await supabaseService.deleteGuidanceDocument(id);
      await loadDocuments();
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (err) {
      alert('Error deleting document: ' + err.message);
    }
  };

  // Filtered List
  const filteredDocs = documents.filter((doc) => {
    // If not admin, hide unpublished docs
    if (!isAdmin && doc.is_published === false) return false;

    const term = searchTerm.toLowerCase();
    const matchSearch =
      doc.title?.toLowerCase().includes(term) ||
      doc.description?.toLowerCase().includes(term) ||
      doc.category?.toLowerCase().includes(term);

    const matchCategory =
      categoryFilter === 'All' || doc.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredDocs.length / pageSize) || 1;
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 mb-1">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Incubator Knowledge &amp; Compliance Vault</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Founder Guidance Center
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Authoritative regulatory checklists, DPIIT recognitions, patent filing protocols, grant utilization rules, and standard founder agreements.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow transition flex items-center space-x-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Guidance Resource</span>
          </button>
        )}
      </div>

      {/* Prominent Legal Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-600 text-xs flex items-start space-x-3">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">
            Advisory Notice for Cohort Founders
          </p>
          <p className="leading-relaxed text-[11px] text-slate-600">
            The guidance documents, statutory checklists, and contract templates provided in this center are curated for advisory orientation and general knowledge only. They do not constitute formal legal counsel or statutory audit certification. Founders are strongly encouraged to consult the incubator's empanelled legal and CA partners before finalizing filings.
          </p>
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
            placeholder="Search guidance topics (e.g. DPIIT, Patent, Section 56, Grant UC, MoU)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Incorporation & MCA">Incorporation &amp; MCA</option>
            <option value="DPIIT & Startup India">DPIIT &amp; Startup India</option>
            <option value="Intellectual Property & Patents">Intellectual Property &amp; Patents</option>
            <option value="Founder Agreements & Equity">Founder Agreements &amp; Equity</option>
            <option value="Tax Compliance & Section 56">Tax Compliance &amp; Section 56</option>
            <option value="Grants & Utilization">Grants &amp; Utilization</option>
            <option value="Incubator Policies">Incubator Policies</option>
          </select>
        </div>
      </div>

      {/* Grid of Guidance Cards */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading guidance center documents...</p>
        </div>
      ) : paginatedDocs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No guidance resources found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {paginatedDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Header: Category & File Type */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    {doc.category}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {doc.file_type || 'PDF Guide'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug mb-2">
                  {doc.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {doc.description}
                </p>

                {/* Metadata row */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Updated {new Date(doc.last_updated_at || doc.created_at || Date.now()).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {doc.official_source_url && (
                    <span className="text-emerald-700 font-medium">
                      Official Gazette / Govt Link
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {doc.official_source_url && (
                    <a
                      href={doc.official_source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-emerald-700 hover:underline font-bold"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition shadow-xs flex items-center space-x-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Checklist &amp; Guide</span>
                  </button>

                  {isAdmin && (
                    <div className="flex items-center space-x-1 ml-1">
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="Edit Document"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Document"
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
      {filteredDocs.length > pageSize && (
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredDocs.length)}</strong> of{' '}
            <strong>{filteredDocs.length}</strong> resources
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

      {/* ================= VIEW CHECKLIST & GUIDE MODAL ================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedDoc.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Executive Summary
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {selectedDoc.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Procedural Checklist &amp; Implementation Steps
                </h4>
                <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl text-slate-800 leading-relaxed font-sans whitespace-pre-line space-y-2">
                  {selectedDoc.content_checklist}
                </div>
              </div>

              {selectedDoc.official_source_url && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">Government Gazette or Portal</p>
                    <p className="text-[11px] text-blue-700 truncate max-w-md">
                      {selectedDoc.official_source_url}
                    </p>
                  </div>
                  <a
                    href={selectedDoc.official_source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shrink-0"
                  >
                    <span>Visit Official Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
              >
                Close Guidance
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
                {editingId ? 'Edit Guidance Resource' : 'Publish New Guidance Document'}
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
                    Document Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. DPIIT Startup Recognition Master Checklist"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                  {formErrors.title && (
                    <p className="text-rose-500 text-[10px] mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Incorporation & MCA">Incorporation &amp; MCA</option>
                    <option value="DPIIT & Startup India">DPIIT &amp; Startup India</option>
                    <option value="Intellectual Property & Patents">Intellectual Property &amp; Patents</option>
                    <option value="Founder Agreements & Equity">Founder Agreements &amp; Equity</option>
                    <option value="Tax Compliance & Section 56">Tax Compliance &amp; Section 56</option>
                    <option value="Grants & Utilization">Grants &amp; Utilization</option>
                    <option value="Incubator Policies">Incubator Policies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Executive Summary / Overview <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clear description explaining what founders will learn from this document..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                {formErrors.description && (
                  <p className="text-rose-500 text-[10px] mt-1">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Step-by-step Guidance Checklist / Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={formData.content_checklist}
                  onChange={(e) => setFormData({ ...formData, content_checklist: e.target.value })}
                  placeholder="1. Prepare Certificate of Incorporation (MCA SPICe+)...&#10;2. Draft one-page writeup describing innovation...&#10;3. Verify digital signature certificate (DSC)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
                {formErrors.content_checklist && (
                  <p className="text-rose-500 text-[10px] mt-1">{formErrors.content_checklist}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Portal or Gazette Link
                  </label>
                  <input
                    type="url"
                    value={formData.official_source_url}
                    onChange={(e) => setFormData({ ...formData, official_source_url: e.target.value })}
                    placeholder="https://startupindia.gov.in"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format Type</label>
                  <select
                    value={formData.file_type}
                    onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="PDF Guide">PDF Guide</option>
                    <option value="Template Document">Template Document (DOCX)</option>
                    <option value="Statutory Portal Link">Statutory Portal Link</option>
                    <option value="Official Gazette">Official Gazette</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-700">Published (Visible to Startups)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_restricted}
                    onChange={(e) => setFormData({ ...formData, is_restricted: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-700">Restricted to Active Cohort</span>
                </label>
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
                  {submitting ? 'Saving...' : editingId ? 'Update Guidance' : 'Publish Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

