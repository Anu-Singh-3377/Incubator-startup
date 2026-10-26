import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  PlusCircle,
  FileCheck,
  FileText,
  Shield,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Bell,
  Calendar,
  Phone,
  Mail,
  Edit3,
  Trash2,
  X,
  TrendingUp,
  Award,
  Sparkles,
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  Check,
  ChevronDown,
  Menu,
  ArrowLeft
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';

// ================= REUSABLE PAGINATION BAR COMPONENT =================
function PaginationBar({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemName = 'records',
  pageSizeOptions = [10, 25, 50]
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing <strong className="text-slate-800 font-bold">{startItem}–{endItem}</strong> of{' '}
          <strong className="text-slate-800 font-bold">{totalItems}</strong> {itemName}
        </span>
        {pageSizeOptions && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1.5 ml-1 sm:ml-3">
            <span className="text-[11px] text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition"
        >
          Previous
        </button>
        <span className="px-3 py-1 font-semibold text-slate-800">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard({ user, onLogout }) {
  // Navigation: 'overview' | 'portfolio' | 'add-startup' | 'documents' | 'applications'
  const [activeNav, setActiveNav] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [startups, setStartups] = useState([]);
  const [applications, setApplications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= 1. PORTFOLIO DIRECTORY STATE =================
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Alumni'
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [portfolioPageSize, setPortfolioPageSize] = useState(10);

  // ================= 2. DOCUMENTS & COMPLIANCE STATE =================
  const [docSearch, setDocSearch] = useState('');
  const [docStatusFilter, setDocStatusFilter] = useState('All'); // 'All' | 'Verified' | 'Pending'
  const [docPage, setDocPage] = useState(1);
  const [docPageSize, setDocPageSize] = useState(10);

  // ================= 3. COHORT APPLICATIONS STATE =================
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('All'); // 'All' | 'Under Review' | 'Interview Scheduled' | 'Accepted' | 'Rejected'
  const [appPage, setAppPage] = useState(1);
  const [appPageSize, setAppPageSize] = useState(10);

  // Selected Startup for Details Modal
  const [selectedStartup, setSelectedStartup] = useState(null);

  // Add / Edit Startup Form State (Dedicated Page)
  const [editingStartupId, setEditingStartupId] = useState(null);
  const [formData, setFormData] = useState({
    startup_name: '',
    founder_name: '',
    founder_phone: '',
    founder_email: '',
    company_overview: '',
    status: 'Active',
    sector: 'DeepTech & AI',
    mca_number: '',
    incorporation_date: '',
    incorporation_status: 'Incorporated (Pvt Ltd)',
    dpiit_number: '',
    cohort: 'Cohort 12 (Spring 2026)',
    sanctioned_grant: '2500000',
    disbursed_grant: '0'
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null);

  // Document Feedback
  const [docFeedback, setDocFeedback] = useState('');

  // Top Popovers
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [startupsData, appsData, ancData] = await Promise.all([
        supabaseService.getStartups(),
        supabaseService.getApplications(),
        supabaseService.getAnnouncements()
      ]);
      setStartups(startupsData || []);
      setApplications(appsData || []);
      setAnnouncements(ancData || []);
    } catch (err) {
      console.error('Failed to load incubator data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format Current Date
  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate Metrics from Actual Data
  const totalCount = startups.length;
  const activeCount = startups.filter((s) => s.status === 'Active' || s.stage !== 'Graduated').length;
  const alumniCount = startups.filter((s) => s.status === 'Alumni' || s.stage === 'Graduated').length;
  const pendingAppsCount = applications.filter((a) => a.status === 'Under Review' || a.status === 'Interview Scheduled').length;

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (!formData.startup_name.trim()) errors.startup_name = 'Company name is required.';
    if (!formData.founder_name.trim()) errors.founder_name = 'Founder name is required.';
    
    // Phone validation
    const phoneClean = formData.founder_phone.replace(/[^0-9]/g, '');
    if (!formData.founder_phone.trim()) {
      errors.founder_phone = 'Primary phone number is required.';
    } else if (phoneClean.length < 10) {
      errors.founder_phone = 'Please enter a valid phone number (at least 10 digits).';
    }

    if (!formData.company_overview.trim()) {
      errors.company_overview = 'Company overview is required.';
    } else if (formData.company_overview.trim().length < 15) {
      errors.company_overview = 'Overview must be at least 15 characters long.';
    }

    // Duplicate company name check (if adding new)
    if (!editingStartupId) {
      const duplicate = startups.find(
        (s) => s.startup_name.toLowerCase() === formData.startup_name.trim().toLowerCase()
      );
      if (duplicate) {
        errors.startup_name = 'A startup with this company name already exists in the portfolio.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Add Startup as Dedicated Page
  const handleOpenAdd = () => {
    setEditingStartupId(null);
    setFormData({
      startup_name: '',
      founder_name: '',
      founder_phone: '',
      founder_email: '',
      company_overview: '',
      status: 'Active',
      sector: 'DeepTech & AI',
      mca_number: '',
      incorporation_date: '',
      incorporation_status: 'Incorporated (Pvt Ltd)',
      dpiit_number: '',
      cohort: 'Cohort 12 (Spring 2026)',
      sanctioned_grant: '2500000',
      disbursed_grant: '0'
    });
    setFormErrors({});
    setFormFeedback(null);
    setActiveNav('add-startup');
  };

  // Open Edit Startup as Dedicated Page
  const handleOpenEdit = (startup) => {
    setEditingStartupId(startup.id);
    setFormData({
      startup_name: startup.startup_name || '',
      founder_name: startup.founder_name || '',
      founder_phone: startup.founder_phone || '',
      founder_email: startup.founder_email || '',
      company_overview: startup.company_overview || '',
      status: startup.status || (startup.stage === 'Graduated' ? 'Alumni' : 'Active'),
      sector: startup.sector || 'DeepTech & AI',
      mca_number: startup.mca_number || '',
      incorporation_date: startup.incorporation_date || '',
      incorporation_status: startup.incorporation_status || 'Incorporated (Pvt Ltd)',
      dpiit_number: startup.dpiit_number || '',
      cohort: startup.cohort || 'Cohort 12 (Spring 2026)',
      sanctioned_grant: String(startup.sanctioned_grant || '2500000'),
      disbursed_grant: String(startup.disbursed_grant || '0')
    });
    setFormErrors({});
    setFormFeedback(null);
    setActiveNav('add-startup');
  };

  // Save Startup (Add or Edit)
  const handleSaveStartup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormSubmitting(true);
    setFormFeedback(null);

    try {
      if (editingStartupId) {
        const res = await supabaseService.updateStartup(editingStartupId, formData);
        setStartups((prev) =>
          prev.map((s) => (s.id === editingStartupId ? { ...s, ...res.startup } : s))
        );
        setFormFeedback({
          type: 'success',
          message: `Successfully updated '${formData.startup_name}'.`
        });
      } else {
        const res = await supabaseService.addStartup(formData);
        setStartups((prev) => [res.startup, ...prev]);
        setFormFeedback({
          type: 'success',
          message: `Successfully enrolled '${formData.startup_name}' to the incubator portfolio.`
        });
      }

      await loadData();

      setTimeout(() => {
        setFormFeedback(null);
        setActiveNav('portfolio');
      }, 1200);
    } catch (err) {
      setFormFeedback({
        type: 'error',
        message: err.message || 'Failed to save startup record.'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Startup
  const handleDeleteStartup = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove '${name}' from the portfolio directory?`)) {
      return;
    }
    try {
      await supabaseService.deleteStartup(id);
      setStartups((prev) => prev.filter((s) => s.id !== id));
      if (selectedStartup?.id === id) setSelectedStartup(null);
    } catch (err) {
      alert('Failed to delete startup: ' + err.message);
    }
  };

  // Update Document Status (e.g. Mark Verified)
  const handleUpdateDocStatus = async (startupId, docId, newStatus) => {
    try {
      await supabaseService.updateDocumentStatus(startupId, docId, newStatus, `Verified by ${user.full_name || 'Admin'}`);
      setStartups((prev) =>
        prev.map((st) => {
          if (st.id === startupId) {
            const updatedDocs = (st.documents || []).map((d) =>
              d.id === docId ? { ...d, status: newStatus, verified_at: new Date().toISOString() } : d
            );
            return { ...st, documents: updatedDocs };
          }
          return st;
        })
      );
      if (selectedStartup && selectedStartup.id === startupId) {
        setSelectedStartup((prev) => ({
          ...prev,
          documents: (prev.documents || []).map((d) =>
            d.id === docId ? { ...d, status: newStatus, verified_at: new Date().toISOString() } : d
          )
        }));
      }
      setDocFeedback(`Document marked as ${newStatus}.`);
      setTimeout(() => setDocFeedback(''), 3000);
    } catch (err) {
      alert('Error updating document: ' + err.message);
    }
  };

  // Cohort Application status update
  const handleAppStatusChange = async (appId, newStatus) => {
    try {
      await supabaseService.updateApplicationStatus(appId, newStatus, `Reviewed by ${user.full_name || 'Admin'}`);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      alert('Error updating application: ' + err.message);
    }
  };

  // ================= 1. PORTFOLIO FILTER & PAGINATION LOGIC =================
  const filteredStartups = startups
    .filter((s) => {
      const matchSearch =
        s.startup_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.founder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.mca_number && s.mca_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.dpiit_number && s.dpiit_number.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Active'
          ? s.status === 'Active' || s.stage !== 'Graduated'
          : s.status === 'Alumni' || s.stage === 'Graduated';

      const matchSector = sectorFilter === 'All' || (s.sector && s.sector.includes(sectorFilter));

      return matchSearch && matchStatus && matchSector;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.startup_name.localeCompare(b.startup_name);
      if (sortBy === 'name-desc') return b.startup_name.localeCompare(a.startup_name);
      if (sortBy === 'date-newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'date-oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      return 0;
    });

  const paginatedStartups = filteredStartups.slice(
    (portfolioPage - 1) * portfolioPageSize,
    portfolioPage * portfolioPageSize
  );

  // ================= 2. DOCUMENTS FILTER & PAGINATION LOGIC =================
  const filteredDocStartups = startups.filter((st) => {
    const matchSearch =
      st.startup_name.toLowerCase().includes(docSearch.toLowerCase()) ||
      st.founder_name.toLowerCase().includes(docSearch.toLowerCase()) ||
      (st.mca_number && st.mca_number.toLowerCase().includes(docSearch.toLowerCase()));

    if (!matchSearch) return false;

    if (docStatusFilter === 'All') return true;

    const allVerified = (st.documents || []).length > 0 &&
      st.documents.every((d) => d.status === 'Verified');

    if (docStatusFilter === 'Verified') return allVerified;
    if (docStatusFilter === 'Pending') return !allVerified;

    return true;
  });

  const paginatedDocStartups = filteredDocStartups.slice(
    (docPage - 1) * docPageSize,
    docPage * docPageSize
  );

  // ================= 3. APPLICATIONS FILTER & PAGINATION LOGIC =================
  const filteredApplications = applications.filter((app) => {
    const matchSearch =
      app.startup_name.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.founder_name.toLowerCase().includes(appSearch.toLowerCase()) ||
      (app.sector && app.sector.toLowerCase().includes(appSearch.toLowerCase()));

    const matchStatus = appStatusFilter === 'All' || app.status === appStatusFilter;

    return matchSearch && matchStatus;
  });

  const paginatedApplications = filteredApplications.slice(
    (appPage - 1) * appPageSize,
    appPage * appPageSize
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Subtle Tri-color Growth Ribbon */}
      <div className="w-full h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-600 shrink-0 z-30" />

      {/* ================= FIXED TOP NAVBAR ================= */}
      <header className="h-16 w-full bg-white/95 border-b border-slate-200/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Incubator Dashboard</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Portfolio Management
              </span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Nurture innovation. Track progress. Build what's next.
            </p>
          </div>
        </div>

        {/* Right Top Actions (Add Startup duplicate removed) */}
        <div className="flex items-center space-x-3">
          {/* Live Formatted Date */}
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 relative transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingAppsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-40 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{pendingAppsCount} pending</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pendingAppsCount > 0 ? (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900">
                      <p className="font-semibold text-xs">{pendingAppsCount} applications pending screening</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">Cohort admissions evaluation in progress.</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 py-2 text-center">No unread notifications.</p>
                  )}
                  {announcements.slice(0, 2).map((a) => (
                    <div key={a.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="font-bold text-slate-800 text-[11px]">{a.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{a.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 pl-2 border-l border-slate-200 text-left hover:opacity-90 transition"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {user?.full_name ? user.full_name[0] : 'V'}
              </div>
              <div className="hidden xl:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.full_name || 'Incubation Director'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {user?.role || 'Admin'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden xl:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-40 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900">{user?.full_name || 'Incubation Director'}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Incubator Directorate
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition font-medium text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= BODY WRAPPER: FIXED SIDEBAR + SCROLLABLE MAIN ================= */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
        
        {/* ================= FIXED SIDEBAR NAVIGATION ================= */}
        <aside className="hidden lg:flex lg:flex-col w-64 h-full bg-white border-r border-slate-200/90 shadow-xs shrink-0 z-10 overflow-y-auto">
          {/* Logo & Incubator Identity */}
          <div className="p-5 border-b border-slate-100 flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-black text-white shadow-sm">
              VB
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                VentureBharat
              </h2>
              <p className="text-[11px] font-semibold text-emerald-700">
                Incubator &amp; Portfolio Hub
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
            <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Portfolio Management
            </div>

            <button
              onClick={() => setActiveNav('overview')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                activeNav === 'overview'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeNav === 'overview' ? 'text-emerald-700' : 'text-slate-500'}`} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveNav('portfolio')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                activeNav === 'portfolio'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FolderKanban className={`w-4 h-4 ${activeNav === 'portfolio' ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span>Startup Portfolio</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            </button>

            {/* Dedicated Add Startup Page link in Sidebar */}
            <button
              onClick={handleOpenAdd}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                activeNav === 'add-startup'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/60'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${activeNav === 'add-startup' ? 'text-emerald-700' : 'text-emerald-600'}`} />
              <span>Add New Startup</span>
            </button>

            <button
              onClick={() => setActiveNav('documents')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                activeNav === 'documents'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCheck2 className={`w-4 h-4 ${activeNav === 'documents' ? 'text-emerald-700' : 'text-slate-500'}`} />
              <span>Documents &amp; Compliance</span>
            </button>

            <div className="pt-4 px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Admissions &amp; System
            </div>

            <button
              onClick={() => setActiveNav('applications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                activeNav === 'applications'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className={`w-4 h-4 ${activeNav === 'applications' ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span>Cohort Applications</span>
              </div>
              {pendingAppsCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {pendingAppsCount}
                </span>
              )}
            </button>
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 p-4 space-y-2 text-xs shadow-lg">
            <button
              onClick={() => { setActiveNav('overview'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-2 p-2.5 rounded-lg ${activeNav === 'overview' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'}`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => { setActiveNav('portfolio'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-2 p-2.5 rounded-lg ${activeNav === 'portfolio' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'}`}
            >
              <FolderKanban className="w-4 h-4 text-emerald-600" />
              <span>Startup Portfolio</span>
            </button>
            <button
              onClick={() => { handleOpenAdd(); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-2 p-2.5 rounded-lg ${activeNav === 'add-startup' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-emerald-700'}`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Add New Startup</span>
            </button>
            <button
              onClick={() => { setActiveNav('documents'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-2 p-2.5 rounded-lg ${activeNav === 'documents' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'}`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Documents &amp; Compliance</span>
            </button>
            <button
              onClick={() => { setActiveNav('applications'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-2 p-2.5 rounded-lg ${activeNav === 'applications' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'}`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Cohort Applications</span>
            </button>
          </div>
        )}

        {/* ================= MAIN SCROLLABLE CONTENT AREA ================= */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#F8FAFC]">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

            {/* ================= OVERVIEW CARDS (Visible on Overview & Portfolio) ================= */}
            {activeNav !== 'add-startup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Startups Card */}
                <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Total Startups
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {totalCount}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Nurtured across all active &amp; graduated cohorts
                  </p>
                </div>

                {/* 2. Active Startups Card */}
                <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Active Incubatees
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-700 tracking-tight">
                    {activeCount}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Currently in prototype fabrication &amp; pilot stages
                  </p>
                </div>

                {/* 3. Alumni Startups Card */}
                <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Alumni Startups
                    </span>
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-blue-800 tracking-tight">
                    {alumniCount}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Successfully graduated with market traction &amp; funding
                  </p>
                </div>

                {/* 4. Pending Applications / Documents */}
                <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Pending Clearance
                    </span>
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-700 tracking-tight">
                    {pendingAppsCount}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Cohort applications awaiting panel review
                  </p>
                </div>

              </div>
            )}

            {/* ================= VIEW 1: OVERVIEW ================= */}
            {activeNav === 'overview' && (
              <div className="space-y-6">
                
                {/* Welcome Callout Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white shadow-sm relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-emerald-100 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Portfolio Management System Active</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                      Welcome, {user?.full_name || 'Incubation Director'}
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100 mt-1.5 leading-relaxed">
                      Monitor active deeptech ventures, manage MCA compliance and government seed grants, and support innovative founders from lab to market.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-700" />
                        <span>Add Startup to Portfolio</span>
                      </button>
                      <button
                        onClick={() => setActiveNav('portfolio')}
                        className="px-4 py-2 bg-emerald-900/60 hover:bg-emerald-900/80 text-white border border-white/20 rounded-lg text-xs font-semibold transition"
                      >
                        View Full Directory
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Highlights: Sector breakdown & Recent additions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Recent Portfolio Additions Table */}
                  <div className="lg:col-span-8 p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Recent Portfolio Additions
                        </h3>
                        <p className="text-xs text-slate-500">
                          Latest ventures registered in the incubator directory
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveNav('portfolio')}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {startups.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No startups added yet.</p>
                        <p className="text-slate-500 mt-0.5">Click "Add Startup" to create your first portfolio entry.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 mt-2">
                        {startups.slice(0, 4).map((s) => (
                          <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                {s.startup_name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{s.startup_name}</h4>
                                <p className="text-slate-500 text-[11px]">
                                  Founder: <span className="text-slate-700 font-medium">{s.founder_name}</span> • {s.sector}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  s.status === 'Alumni' || s.stage === 'Graduated'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {s.status || (s.stage === 'Graduated' ? 'Alumni' : 'Active')}
                              </span>
                              <button
                                onClick={() => setSelectedStartup(s)}
                                className="text-slate-400 hover:text-slate-700 text-xs font-semibold p-1"
                                title="View Details"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Incubator Compliance & Quick Overview */}
                  <div className="lg:col-span-4 p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Incubator Compliance Summary</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Verification tracking for Certificate of Incorporation, MoA/AoA, PAN, and Utilization Certificates across portfolio companies.
                    </p>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Incorporation Rate</span>
                        <span className="font-bold text-emerald-700">100% Pvt Ltd</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                        <span className="text-slate-600 font-medium">DPIIT Recognition</span>
                        <span className="font-bold text-emerald-700">92% Certified</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                        <span className="text-slate-600 font-medium">UC Audit Status</span>
                        <span className="font-bold text-amber-700">1 Under Review</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveNav('documents')}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition text-center"
                    >
                      Open Compliance Tracker
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* ================= VIEW 2: PORTFOLIO DIRECTORY ================= */}
            {activeNav === 'portfolio' && (
              <div className="space-y-4">
                
                {/* Search, Filter & Actions Toolbar */}
                <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-3">
                  <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPortfolioPage(1);
                        }}
                        placeholder="Search by company name, founder, MCA/CIN, or DPIIT..."
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 transition"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      
                      {/* Status Filter */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                        {['All', 'Active', 'Alumni'].map((st) => (
                          <button
                            key={st}
                            onClick={() => { setStatusFilter(st); setPortfolioPage(1); }}
                            className={`px-3 py-1.5 rounded-md transition ${
                              statusFilter === st
                                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      {/* Sector Filter */}
                      <select
                        value={sectorFilter}
                        onChange={(e) => { setSectorFilter(e.target.value); setPortfolioPage(1); }}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
                      >
                        <option value="All">All Innovation Sectors</option>
                        <option value="AgriTech">AgriTech &amp; AI</option>
                        <option value="HealthTech">HealthTech &amp; BioSensors</option>
                        <option value="CleanTech">CleanTech &amp; Energy</option>
                        <option value="DeepTech">DeepTech &amp; Aerospace</option>
                        <option value="FinTech">FinTech</option>
                      </select>

                      {/* Sort dropdown */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
                      >
                        <option value="name-asc">Sort: Name (A-Z)</option>
                        <option value="name-desc">Sort: Name (Z-A)</option>
                        <option value="date-newest">Sort: Date Added (Newest)</option>
                        <option value="date-oldest">Sort: Date Added (Oldest)</option>
                      </select>

                      {/* Add Startup Button in Toolbar */}
                      <button
                        onClick={handleOpenAdd}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition ml-auto md:ml-0"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Startup</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Directory Content: Desktop Table & Mobile Cards */}
                {filteredStartups.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-200/90 rounded-xl shadow-xs">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-900">No startups found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchTerm || statusFilter !== 'All'
                        ? 'No portfolio ventures match your search filters. Try adjusting or clearing filters.'
                        : 'No startups added yet. Start by adding a venture to the portfolio.'}
                    </p>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      + Add New Startup
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                    
                    {/* Desktop Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                          <tr>
                            <th className="p-4">Company Name</th>
                            <th className="p-4">Founder</th>
                            <th className="p-4">Phone Number</th>
                            <th className="p-4">Sector</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Incorporation / MCA</th>
                            <th className="p-4">Date Added</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {paginatedStartups.map((st) => (
                            <tr key={st.id} className="hover:bg-slate-50/70 transition">
                              <td className="p-4">
                                <button
                                  onClick={() => setSelectedStartup(st)}
                                  className="font-bold text-slate-900 hover:text-emerald-700 text-left"
                                >
                                  {st.startup_name}
                                </button>
                                <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                                  {st.company_overview || 'No overview provided.'}
                                </p>
                              </td>
                              <td className="p-4 font-medium text-slate-900">
                                {st.founder_name}
                              </td>
                              <td className="p-4 font-mono text-slate-600">
                                {st.founder_phone || '—'}
                              </td>
                              <td className="p-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                                  {st.sector}
                                </span>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    st.status === 'Alumni' || st.stage === 'Graduated'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  {st.status || (st.stage === 'Graduated' ? 'Alumni' : 'Active')}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-[11px]">
                                {st.mca_number ? (
                                  <div>
                                    <span className="font-semibold text-slate-800">{st.mca_number}</span>
                                    <p className="text-[10px] text-slate-400 font-sans">{st.incorporation_status}</p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">Pending MCA</span>
                                )}
                              </td>
                              <td className="p-4 text-slate-500 text-[11px] font-mono">
                                {st.created_at ? new Date(st.created_at).toLocaleDateString() : '—'}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    onClick={() => setSelectedStartup(st)}
                                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                                    title="View Details &amp; Documents"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEdit(st)}
                                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
                                    title="Edit Startup"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStartup(st.id, st.startup_name)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Consistent Pagination Bar */}
                    <PaginationBar
                      currentPage={portfolioPage}
                      totalItems={filteredStartups.length}
                      pageSize={portfolioPageSize}
                      onPageChange={setPortfolioPage}
                      onPageSizeChange={setPortfolioPageSize}
                      itemName="startups"
                      pageSizeOptions={[10, 25, 50]}
                    />

                  </div>
                )}

              </div>
            )}

            {/* ================= VIEW 3: DEDICATED FULL-PAGE ADD / EDIT STARTUP ================= */}
            {activeNav === 'add-startup' && (
              <div className="space-y-6">
                
                {/* Page Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setActiveNav('portfolio')}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 transition"
                      title="Back to Startup Portfolio"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                        <span>{editingStartupId ? 'Edit Startup Record' : 'Add New Startup to Portfolio'}</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {editingStartupId
                          ? `Modify company incorporation, founder contacts, and grant details for ${formData.startup_name || 'startup'}.`
                          : 'Enroll a new venture into the incubator portfolio with MCA, founder, and compliance records.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveNav('portfolio')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition"
                  >
                    Back to Portfolio
                  </button>
                </div>

                {/* Form Feedback Alert */}
                {formFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs border flex items-center gap-2.5 ${
                      formFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {formFeedback.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-medium">{formFeedback.message}</span>
                  </div>
                )}

                {/* Main Form Container */}
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 sm:p-8">
                  <form onSubmit={handleSaveStartup} className="space-y-5 text-xs">
                    
                    {/* Row 1: Company Name & Founder Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          Company / Startup Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.startup_name}
                          onChange={(e) => setFormData({ ...formData, startup_name: e.target.value })}
                          placeholder="e.g. KisanSetu DeepTech Labs"
                          className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition ${
                            formErrors.startup_name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                          }`}
                        />
                        {formErrors.startup_name && (
                          <p className="text-rose-600 text-[11px] mt-1 font-medium">{formErrors.startup_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          Founder Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.founder_name}
                          onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                          placeholder="e.g. Aarav Sharma"
                          className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition ${
                            formErrors.founder_name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                          }`}
                        />
                        {formErrors.founder_name && (
                          <p className="text-rose-600 text-[11px] mt-1 font-medium">{formErrors.founder_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          Primary Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.founder_phone}
                          onChange={(e) => setFormData({ ...formData, founder_phone: e.target.value })}
                          placeholder="e.g. +91 98765 43210"
                          className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition ${
                            formErrors.founder_phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                          }`}
                        />
                        {formErrors.founder_phone && (
                          <p className="text-rose-600 text-[11px] mt-1 font-medium">{formErrors.founder_phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          Founder Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.founder_email}
                          onChange={(e) => setFormData({ ...formData, founder_email: e.target.value })}
                          placeholder="e.g. founder@venture.in"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Row 3: Company Overview */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1.5">
                        Company Overview <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.company_overview}
                        onChange={(e) => setFormData({ ...formData, company_overview: e.target.value })}
                        placeholder="Describe the startup's core innovation, product architecture, target market, and value proposition..."
                        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition ${
                          formErrors.company_overview ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.company_overview && (
                        <p className="text-rose-600 text-[11px] mt-1 font-medium">{formErrors.company_overview}</p>
                      )}
                    </div>

                    {/* Row 4: Status & Sector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          Startup Status <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        >
                          <option value="Active">Active (Currently Incubated)</option>
                          <option value="Alumni">Alumni (Graduated)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          Innovation Sector
                        </label>
                        <select
                          value={formData.sector}
                          onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        >
                          <option value="DeepTech & AI">DeepTech &amp; AI</option>
                          <option value="AgriTech & Edge AI">AgriTech &amp; Edge AI</option>
                          <option value="HealthTech & BioSensors">HealthTech &amp; BioSensors</option>
                          <option value="CleanTech & Energy">CleanTech &amp; Energy</option>
                          <option value="FinTech & Open Networks">FinTech &amp; Open Networks</option>
                          <option value="DeepTech & Aerospace">DeepTech &amp; Aerospace</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 5: MCA Registration Number & Incorporation Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          MCA / CIN Registration Number
                        </label>
                        <input
                          type="text"
                          value={formData.mca_number}
                          onChange={(e) => setFormData({ ...formData, mca_number: e.target.value })}
                          placeholder="e.g. U72900DL2025PTC384910"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          Incorporation Date
                        </label>
                        <input
                          type="date"
                          value={formData.incorporation_date}
                          onChange={(e) => setFormData({ ...formData, incorporation_date: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                    </div>

                    {/* Row 6: DPIIT Number & Sanctioned Grant */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          DPIIT Recognition Number
                        </label>
                        <input
                          type="text"
                          value={formData.dpiit_number}
                          onChange={(e) => setFormData({ ...formData, dpiit_number: e.target.value })}
                          placeholder="e.g. DIPP-IN-98214"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1.5">
                          Sanctioned Seed Grant (INR)
                        </label>
                        <input
                          type="number"
                          value={formData.sanctioned_grant}
                          onChange={(e) => setFormData({ ...formData, sanctioned_grant: e.target.value })}
                          placeholder="2500000"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setActiveNav('portfolio')}
                        className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {formSubmitting ? (
                          <span>Saving Record...</span>
                        ) : editingStartupId ? (
                          <span>Update Startup Record</span>
                        ) : (
                          <span>Save &amp; Enroll Startup</span>
                        )}
                      </button>
                    </div>

                  </form>
                </div>

              </div>
            )}

            {/* ================= VIEW 4: DOCUMENTS & COMPLIANCE REPOSITORY ================= */}
            {activeNav === 'documents' && (
              <div className="space-y-4">
                
                {/* Header card with search & filter */}
                <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FileCheck2 className="w-5 h-5 text-emerald-600" />
                        <span>Document Repository &amp; Compliance Checklist</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Track mandatory legal, tax, and government grant compliance documentation across all incubator portfolio companies.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                      MCA21 &amp; DPIIT Compliant
                    </span>
                  </div>

                  {docFeedback && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{docFeedback}</span>
                    </div>
                  )}

                  {/* Search & Filter Bar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={docSearch}
                        onChange={(e) => {
                          setDocSearch(e.target.value);
                          setDocPage(1);
                        }}
                        placeholder="Search compliance by company name or founder..."
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      />
                    </div>

                    <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold w-full sm:w-auto">
                      {['All', 'Verified', 'Pending'].map((st) => (
                        <button
                          key={st}
                          onClick={() => { setDocStatusFilter(st); setDocPage(1); }}
                          className={`px-3 py-1 rounded-md transition ${
                            docStatusFilter === st
                              ? 'bg-white text-emerald-800 shadow-xs font-bold'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {st === 'All' ? 'All Records' : st === 'Verified' ? 'Fully Verified' : 'Action Required'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compliance Checklist per Startup with Pagination */}
                {filteredDocStartups.length === 0 ? (
                  <div className="p-10 text-center bg-white border border-slate-200/90 rounded-xl shadow-xs text-xs text-slate-500">
                    <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No compliance records found</p>
                    <p className="text-slate-500 mt-0.5">Try clearing search filters or add new startups.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedDocStartups.map((st) => (
                      <div key={st.id} className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-slate-900 text-sm">{st.startup_name}</h3>
                              <span className="text-[10px] font-mono text-slate-500">
                                {st.mca_number || 'CIN Pending'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Founder: {st.founder_name} • Phone: {st.founder_phone}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border self-start sm:self-auto ${
                              st.status === 'Alumni'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {st.status || 'Active'}
                          </span>
                        </div>

                        {/* Documents Table for this startup */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              <tr>
                                <th className="py-2">Required Document</th>
                                <th className="py-2">Mandatory</th>
                                <th className="py-2">Status</th>
                                <th className="py-2">File Uploaded</th>
                                <th className="py-2 text-right">Verification Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(st.documents || []).map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 font-medium text-slate-900">
                                    {doc.document_name}
                                  </td>
                                  <td className="py-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      doc.mandatory ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                      {doc.mandatory ? 'Mandatory' : 'Optional'}
                                    </span>
                                  </td>
                                  <td className="py-2.5">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                        doc.status === 'Verified'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : doc.status === 'Under Review'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-slate-100 text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      {doc.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 font-mono text-[11px] text-slate-600">
                                    {doc.file_name || 'No file uploaded yet'}
                                  </td>
                                  <td className="py-2.5 text-right">
                                    {doc.status === 'Verified' ? (
                                      <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Verified</span>
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleUpdateDocStatus(st.id, doc.id, 'Verified')}
                                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold transition"
                                      >
                                        Mark Verified
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {/* Pagination Bar for Documents */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                      <PaginationBar
                        currentPage={docPage}
                        totalItems={filteredDocStartups.length}
                        pageSize={docPageSize}
                        onPageChange={setDocPage}
                        onPageSizeChange={setDocPageSize}
                        itemName="startup compliance records"
                        pageSizeOptions={[5, 10, 25]}
                      />
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ================= VIEW 5: COHORT APPLICATIONS ================= */}
            {activeNav === 'applications' && (
              <div className="space-y-4">
                
                {/* Header Toolbar */}
                <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Cohort Admissions Pipeline</h3>
                      <p className="text-slate-500 mt-0.5">Evaluating new innovation proposals for upcoming cohort intake.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold self-start sm:self-auto">
                      {applications.length} Submissions
                    </span>
                  </div>

                  {/* Search & Filter */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={appSearch}
                        onChange={(e) => {
                          setAppSearch(e.target.value);
                          setAppPage(1);
                        }}
                        placeholder="Search proposals by startup name, founder, or sector..."
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      />
                    </div>

                    <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold w-full sm:w-auto">
                      {['All', 'Under Review', 'Interview Scheduled', 'Accepted', 'Rejected'].map((st) => (
                        <button
                          key={st}
                          onClick={() => { setAppStatusFilter(st); setAppPage(1); }}
                          className={`px-2.5 py-1 rounded-md transition ${
                            appStatusFilter === st
                              ? 'bg-white text-emerald-800 shadow-xs font-bold'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {filteredApplications.length === 0 ? (
                  <div className="p-10 text-center bg-white border border-slate-200/90 rounded-xl shadow-xs text-xs text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No applications match your filter</p>
                    <p className="text-slate-500 mt-0.5">Try adjusting status or search terms.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {paginatedApplications.map((app) => (
                        <div
                          key={app.id}
                          className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-bold text-slate-900">{app.startup_name}</h4>
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {app.dpiit_number || 'DPIIT Pending'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    app.status === 'Accepted'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : app.status === 'Interview Scheduled'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : app.status === 'Rejected'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Founder: <strong className="text-slate-700">{app.founder_name}</strong> • Sector:{' '}
                                <span className="text-emerald-700 font-medium">{app.sector}</span> • Phone: {app.founder_phone}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <button
                                onClick={() => handleAppStatusChange(app.id, 'Accepted')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleAppStatusChange(app.id, 'Interview Scheduled')}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                              >
                                Interview
                              </button>
                              <button
                                onClick={() => handleAppStatusChange(app.id, 'Rejected')}
                                className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition"
                              >
                                Decline
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                            "{app.pitch_summary}"
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Bar for Applications */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                      <PaginationBar
                        currentPage={appPage}
                        totalItems={filteredApplications.length}
                        pageSize={appPageSize}
                        onPageChange={setAppPage}
                        onPageSizeChange={setAppPageSize}
                        itemName="applications"
                        pageSizeOptions={[5, 10, 25]}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>

      </div>

      {/* ================= POPUP DETAILS MODAL FOR A STARTUP ================= */}
      {selectedStartup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 my-8 text-slate-900 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedStartup(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start space-x-3.5 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs">
                {selectedStartup.startup_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedStartup.startup_name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedStartup.status === 'Alumni' || selectedStartup.stage === 'Graduated'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {selectedStartup.status || (selectedStartup.stage === 'Graduated' ? 'Alumni' : 'Active')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedStartup.legal_name || `${selectedStartup.startup_name} Private Limited`}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4 text-xs">
              
              {/* Overview */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Company Overview
                </label>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                  {selectedStartup.company_overview || 'No description provided.'}
                </p>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Founder Details</span>
                  <p className="font-bold text-slate-900">{selectedStartup.founder_name}</p>
                  <p className="text-slate-600 font-mono text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{selectedStartup.founder_phone}</span>
                  </p>
                  <p className="text-slate-600 font-mono text-[11px] flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{selectedStartup.founder_email}</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Incorporation &amp; MCA</span>
                  <p className="font-bold text-slate-900">{selectedStartup.incorporation_status}</p>
                  <p className="text-slate-600 font-mono text-[11px]">CIN / MCA: {selectedStartup.mca_number || 'Pending'}</p>
                  <p className="text-slate-500 text-[11px]">
                    Incorporation Date: {selectedStartup.incorporation_date || 'Not recorded'}
                  </p>
                </div>
              </div>

              {/* Government Schemes & Lab Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">DPIIT Number</span>
                  <span className="font-mono font-bold text-slate-800">{selectedStartup.dpiit_number || '—'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Grant Sanctioned</span>
                  <span className="font-bold text-emerald-700">₹{(Number(selectedStartup.sanctioned_grant) / 100000).toFixed(1)} Lakh</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Incubation Cohort</span>
                  <span className="font-bold text-slate-800">{selectedStartup.cohort}</span>
                </div>
              </div>

              {/* Compliance Documents Checklist for this startup */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Compliance Documents Status
                </label>
                <div className="space-y-1.5">
                  {(selectedStartup.documents || []).map((doc) => (
                    <div key={doc.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-slate-900">{doc.document_name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{doc.file_name || 'No file uploaded'}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          doc.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : doc.status === 'Under Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const toEdit = selectedStartup;
                  setSelectedStartup(null);
                  handleOpenEdit(toEdit);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Startup Record</span>
              </button>

              <button
                onClick={() => setSelectedStartup(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
