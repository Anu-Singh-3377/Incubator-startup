import React, { useState, useEffect } from 'react';
import {
  Users,
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
  Calendar,
  Linkedin,
  Mail,
  Phone,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';

export default function MentorDirectory({ isAdmin = false, currentUser }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Tabs: 'directory' | 'bookings'
  const [activeTab, setActiveTab] = useState('directory');
  const [bookings, setBookings] = useState([]);

  // Modals
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [officeHoursModal, setOfficeHoursModal] = useState(null);
  const [officeHoursSent, setOfficeHoursSent] = useState(false);
  const [officeHoursRef, setOfficeHoursRef] = useState('');
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [bookingTimeWindow, setBookingTimeWindow] = useState('Morning (10 AM - 1 PM)');
  const [bookingMode, setBookingMode] = useState('Virtual Video Conference');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Admin action modal on booking
  const [selectedBookingForAction, setSelectedBookingForAction] = useState(null);
  const [actionMeetingLink, setActionMeetingLink] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    organization: '',
    email: '',
    phone: '',
    areas_of_expertise: 'Product & Go-To-Market',
    industry_skills: 'Product Strategy, B2B Sales, Market Sizing',
    mentoring_topics: 'Go-to-market strategy, Customer discovery, SaaS pricing models',
    availability: 'Bi-weekly (2 Hours)',
    mentoring_format: 'Virtual (1:1)',
    linkedin_url: '',
    bio: '',
    status: 'Active',
    internal_notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadMentors = async () => {
    setLoading(true);
    try {
      const data = await supabaseService.getMentors();
      setMentors(data || []);
    } catch (err) {
      console.error('Failed to load mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const startupId = !isAdmin ? currentUser?.startup_id || currentUser?.id : null;
      const data = await supabaseService.getMentorBookings(startupId);
      setBookings(data || []);
    } catch (err) {
      console.warn('Failed to load mentor bookings:', err);
    }
  };

  useEffect(() => {
    loadMentors();
    loadBookings();
  }, [currentUser?.id]);

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Mentor name is required.';
    if (!formData.designation.trim()) errs.designation = 'Current designation is required.';
    if (!formData.organization.trim()) errs.organization = 'Organization or firm is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid official email is required.';
    if (!formData.bio.trim() || formData.bio.length < 20) errs.bio = 'Bio must be at least 20 characters.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      full_name: '',
      designation: '',
      organization: '',
      email: '',
      phone: '',
      areas_of_expertise: 'Product & Go-To-Market',
      industry_skills: 'Product Strategy, B2B Sales, Market Sizing',
      mentoring_topics: 'Go-to-market strategy, Customer discovery, SaaS pricing models',
      availability: 'Bi-weekly (2 Hours)',
      mentoring_format: 'Virtual (1:1)',
      linkedin_url: '',
      bio: '',
      status: 'Active',
      internal_notes: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (mentor) => {
    setEditingId(mentor.id);
    setFormData({
      full_name: mentor.full_name || '',
      designation: mentor.designation || '',
      organization: mentor.organization || '',
      email: mentor.email || '',
      phone: mentor.phone || '',
      areas_of_expertise: mentor.areas_of_expertise || 'Product & Go-To-Market',
      industry_skills: mentor.industry_skills || '',
      mentoring_topics: mentor.mentoring_topics || '',
      availability: mentor.availability || 'Bi-weekly (2 Hours)',
      mentoring_format: mentor.mentoring_format || 'Virtual (1:1)',
      linkedin_url: mentor.linkedin_url || '',
      bio: mentor.bio || '',
      status: mentor.status || 'Active',
      internal_notes: mentor.internal_notes || ''
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
        await supabaseService.updateMentor(editingId, formData);
        setFeedback({ type: 'success', message: 'Mentor profile updated successfully.' });
      } else {
        await supabaseService.addMentor(formData);
        setFeedback({ type: 'success', message: 'New mentor registered successfully.' });
      }
      await loadMentors();
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
    if (!window.confirm(`Are you sure you want to remove ${name} from the mentor roster?`)) return;
    try {
      await supabaseService.deleteMentor(id);
      await loadMentors();
      if (selectedMentor?.id === id) setSelectedMentor(null);
    } catch (err) {
      alert('Error deleting mentor: ' + err.message);
    }
  };

  const handleRequestOfficeHours = async (e) => {
    e.preventDefault();
    if (!bookingTopic.trim()) {
      alert('Please specify the topic or challenge for discussion.');
      return;
    }
    setSubmittingBooking(true);
    try {
      const res = await supabaseService.createMentorBooking({
        mentor_id: officeHoursModal.id,
        mentor_name: officeHoursModal.full_name,
        mentor_organization: officeHoursModal.organization,
        startup_id: currentUser?.startup_id || currentUser?.id,
        startup_name: currentUser?.startup_name || 'Agri',
        founder_name: currentUser?.full_name || 'Founder',
        founder_email: currentUser?.email || 'founder@venturebharat.in',
        topic: bookingTopic.trim(),
        preferred_date: bookingDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        preferred_time_window: bookingTimeWindow,
        preferred_mode: bookingMode
      });
      setOfficeHoursRef(res.booking?.reference_number || 'VB-MB-NEW');
      setOfficeHoursSent(true);
      await loadBookings();
    } catch (err) {
      alert('Error requesting advisory session: ' + err.message);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus, notes = '', link = '') => {
    setActionSubmitting(true);
    try {
      await supabaseService.updateMentorBookingStatus(bookingId, newStatus, notes, link);
      setSelectedBookingForAction(null);
      setActionMeetingLink('');
      setActionNotes('');
      await loadBookings();
    } catch (err) {
      alert('Error updating booking: ' + err.message);
    } finally {
      setActionSubmitting(false);
    }
  };

  // Filtered List
  const filteredMentors = mentors.filter((m) => {
    // If founder, do not display inactive/archived mentors
    if (!isAdmin && m.status !== 'Active') return false;

    const term = searchTerm.toLowerCase();
    const matchSearch =
      m.full_name?.toLowerCase().includes(term) ||
      m.organization?.toLowerCase().includes(term) ||
      m.designation?.toLowerCase().includes(term) ||
      m.areas_of_expertise?.toLowerCase().includes(term) ||
      m.industry_skills?.toLowerCase().includes(term) ||
      m.mentoring_topics?.toLowerCase().includes(term);

    const matchExpertise =
      expertiseFilter === 'All' || m.areas_of_expertise?.includes(expertiseFilter);

    const matchAvailability =
      availabilityFilter === 'All' || m.availability?.includes(availabilityFilter);

    const matchStatus =
      statusFilter === 'All' || m.status === statusFilter;

    return matchSearch && matchExpertise && matchAvailability && matchStatus;
  });

  const totalPages = Math.ceil(filteredMentors.length / pageSize) || 1;
  const paginatedMentors = filteredMentors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 mb-1">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Incubator Advisory Roster</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Mentor &amp; Domain Expert Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Vetted sector specialists, seasoned founders, intellectual property counsels, and deeptech advisors empanelled to guide cohort ventures.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow transition flex items-center space-x-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Empanel New Mentor</span>
          </button>
        )}
      </div>

      {/* Sub-Tabs: Empanelled Directory vs Bookings */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'directory'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Empanelled Mentors ({mentors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'bookings'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isAdmin ? 'Advisory Sessions & Bookings' : 'My Booked Advisory Sessions'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            bookings.filter((b) => b.status === 'Requested').length > 0
              ? 'bg-amber-100 text-amber-800 animate-pulse'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {bookings.length}
          </span>
        </button>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Total Mentors</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{mentors.length}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Empanelled advisors</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Active Advisors</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {mentors.filter((m) => m.status === 'Active').length}
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">Accepting cohort 1:1s</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">IP &amp; Regulatory</p>
              <p className="text-2xl font-black text-blue-700 mt-1">
                {mentors.filter((m) => m.areas_of_expertise?.includes('IPR') || m.areas_of_expertise?.includes('Regulatory')).length}
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">Patents &amp; CDSCO / MCA</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Fundraising Mentors</p>
              <p className="text-2xl font-black text-amber-700 mt-1">
                {mentors.filter((m) => m.areas_of_expertise?.includes('Fundraising') || m.areas_of_expertise?.includes('Finance')).length}
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">Seed &amp; Series-A prep</p>
            </div>
          </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search mentors by name, firm, expertise, or skills (e.g. AI, Patent, B2B)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Filter */}
          <select
            value={expertiseFilter}
            onChange={(e) => {
              setExpertiseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Expertise Domains</option>
            <option value="Product">Product &amp; Go-To-Market</option>
            <option value="Hardware">Hardware &amp; IoT Prototyping</option>
            <option value="IPR">IPR, Patents &amp; Trademarks</option>
            <option value="DeepTech">DeepTech, AI &amp; Algorithms</option>
            <option value="Finance">Fundraising &amp; Financial Modeling</option>
            <option value="Biotech">Biotech &amp; Medical Devices</option>
          </select>

          {/* Availability Filter */}
          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Availabilities</option>
            <option value="Weekly">Weekly Office Hours</option>
            <option value="Bi-weekly">Bi-weekly (2 Hours)</option>
            <option value="Monthly">Monthly Reviews</option>
            <option value="On-Demand">On-Demand / Flexible</option>
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
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Archived">Archived</option>
            </select>
          )}
        </div>
      </div>

      {/* Grid of Mentors */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading mentor profiles...</p>
        </div>
      ) : paginatedMentors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No mentors match your search criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the expertise domain filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Header: Name, Designation & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {mentor.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                        {mentor.full_name}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium truncate max-w-[180px]">
                        {mentor.designation}
                      </p>
                      <p className="text-[12px] text-slate-500 truncate max-w-[180px]">
                        {mentor.organization}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                      mentor.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : mentor.status === 'On Leave'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {mentor.status}
                  </span>
                </div>

                {/* Primary Expertise Tag */}
                <div className="mb-3">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[12px] font-semibold bg-emerald-50/80 text-emerald-800 border border-emerald-100">
                    {mentor.areas_of_expertise}
                  </span>
                </div>

                {/* Bio Summary */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {mentor.bio}
                </p>

                {/* Skills tags */}
                {mentor.industry_skills && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mentor.industry_skills.split(',').slice(0, 3).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-600"
                      >
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Availability & Format */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[12px] text-slate-500">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{mentor.availability}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{mentor.mentoring_format}</span>
                  </div>
                </div>

                {/* Internal notes banner for Admin */}
                {isAdmin && mentor.internal_notes && (
                  <div className="mt-3 p-2 bg-amber-50/80 border border-amber-200/70 rounded-lg text-[12px] text-amber-900 leading-tight">
                    <span className="font-bold">Staff Note: </span>
                    <span className="line-clamp-2">{mentor.internal_notes}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {mentor.linkedin_url && (
                    <a
                      href={mentor.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white transition border border-transparent hover:border-slate-200"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {mentor.email && (
                    <a
                      href={`mailto:${mentor.email}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-white transition border border-transparent hover:border-slate-200"
                      title={mentor.email}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200 transition"
                  >
                    View Details
                  </button>

                  {!isAdmin ? (
                    <button
                      onClick={() => setOfficeHoursModal(mentor)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                    >
                      Request 1:1
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(mentor)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="Edit Mentor"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(mentor.id, mentor.full_name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Mentor"
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
      {filteredMentors.length > pageSize && (
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredMentors.length)}</strong> of{' '}
            <strong>{filteredMentors.length}</strong> mentors
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
      </>
      ) : (
        /* ================= ADVISORY SESSIONS & BOOKINGS TAB ================= */
        <div className="space-y-4">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Total Requests</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Advisory 1:1 sessions</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-amber-600">Awaiting Action</p>
              <p className="text-2xl font-black text-amber-700 mt-1">
                {bookings.filter((b) => b.status === 'Requested').length}
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">Needs meeting link</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-blue-600">Scheduled / Confirmed</p>
              <p className="text-2xl font-black text-blue-700 mt-1">
                {bookings.filter((b) => b.status === 'Scheduled').length}
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">Active upcoming sessions</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-emerald-600">Completed</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {bookings.filter((b) => b.status === 'Completed').length}
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">Conducted 1:1 hours</p>
            </div>
          </div>

          {/* Bookings List / Cards */}
          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No advisory sessions booked yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                {isAdmin
                  ? 'When startups request 1:1 sessions with empanelled mentors, they will appear here.'
                  : 'Browse empanelled advisors and click "Request Office Hours" to book your 1:1 advisory session.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {booking.reference_number || 'VB-MB'}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          booking.status === 'Requested'
                            ? 'bg-amber-100 text-amber-800'
                            : booking.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">{booking.mentor_name}</h4>
                      <p className="text-[11px] text-slate-500">{booking.mentor_organization}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-800 block">{booking.startup_name}</span>
                      <span className="text-[10px] text-slate-500">{booking.founder_name}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">Discussion Challenge / Topic:</span>
                      <p className="text-slate-800 font-medium mt-0.5">{booking.topic}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                      <span><strong>Date:</strong> {booking.preferred_date}</span>
                      <span><strong>Window:</strong> {booking.preferred_time_window}</span>
                      <span><strong>Format:</strong> {booking.preferred_mode}</span>
                    </div>
                  </div>

                  {booking.meeting_link && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-blue-900 font-semibold flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
                        Meeting Invite:
                      </span>
                      <a
                        href={booking.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:text-blue-900 font-bold underline truncate max-w-[200px]"
                      >
                        {booking.meeting_link}
                      </a>
                    </div>
                  )}

                  {booking.admin_notes && (
                    <p className="text-[11px] text-slate-500 italic">Directorate Note: {booking.admin_notes}</p>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                      {booking.status === 'Requested' && (
                        <button
                          onClick={() => {
                            setSelectedBookingForAction(booking);
                            setActionMeetingLink(booking.meeting_link || '');
                            setActionNotes(booking.admin_notes || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                        >
                          Confirm &amp; Set Link
                        </button>
                      )}
                      {booking.status === 'Scheduled' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'Completed')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                        >
                          Mark Completed
                        </button>
                      )}
                      {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'Cancelled')}
                          className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= ADMIN SCHEDULE / CONFIRM BOOKING MODAL ================= */}
      {selectedBookingForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Schedule Advisory Session</h3>
                <p className="text-[11px] text-slate-500">
                  {selectedBookingForAction.reference_number} • {selectedBookingForAction.startup_name} with {selectedBookingForAction.mentor_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedBookingForAction(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Virtual Meeting Link (Google Meet / Zoom / Teams)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={actionMeetingLink}
                  onChange={(e) => setActionMeetingLink(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Admin / Coordinator Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="E.g., Confirmed with Dr. Radhika for Wednesday 11:30 AM IST."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedBookingForAction(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={actionSubmitting}
                onClick={() =>
                  handleUpdateBookingStatus(
                    selectedBookingForAction.id,
                    'Scheduled',
                    actionNotes,
                    actionMeetingLink
                  )
                }
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {actionSubmitting ? 'Saving...' : 'Confirm & Schedule Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DETAILS MODAL ================= */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center">
                  {selectedMentor.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedMentor.full_name}</h3>
                  <p className="text-xs text-slate-600">
                    {selectedMentor.designation} • {selectedMentor.organization}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[12px] mb-1">
                  Expertise &amp; Focus Area
                </h4>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200">
                  {selectedMentor.areas_of_expertise}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[12px] mb-1">
                  Professional Biography
                </h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedMentor.bio}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[12px] mb-1">
                  Key Mentoring Topics
                </h4>
                <p className="text-slate-700 font-medium">
                  {selectedMentor.mentoring_topics || 'General deeptech product, regulatory compliance, and market access.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[11px] text-slate-500 uppercase font-bold">Availability</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedMentor.availability}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[11px] text-slate-500 uppercase font-bold">Mentoring Format</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedMentor.mentoring_format}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[11px] text-slate-500 uppercase font-bold">Official Email</span>
                  <p className="font-semibold text-slate-800 mt-0.5 font-mono">{selectedMentor.email}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[11px] text-slate-500 uppercase font-bold">Phone Number</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedMentor.phone || 'Available upon session booking'}</p>
                </div>
              </div>

              {isAdmin && selectedMentor.internal_notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                  <span className="font-bold uppercase tracking-wider text-[11px] block mb-1">
                    Internal Staff Notes (Staff Only)
                  </span>
                  <p>{selectedMentor.internal_notes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                {selectedMentor.linkedin_url && (
                  <a
                    href={selectedMentor.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:underline font-semibold"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>View LinkedIn Profile</span>
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                {!isAdmin && (
                  <button
                    onClick={() => {
                      setOfficeHoursModal(selectedMentor);
                      setSelectedMentor(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Request Office Hours
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REQUEST OFFICE HOURS MODAL (STARTUP) ================= */}
      {officeHoursModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Request Advisory Session
                </h3>
                <p className="text-xs text-slate-500">
                  Booking with {officeHoursModal.full_name} ({officeHoursModal.organization})
                </p>
              </div>
              <button
                onClick={() => setOfficeHoursModal(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {officeHoursSent ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Advisory Session Dispatched!</h4>
                <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs rounded-full font-bold">
                  Reference: {officeHoursRef}
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2">
                  The Incubation Office has received your advisory request with <strong>{officeHoursModal.full_name}</strong>. You will receive a calendar invite with the meeting link shortly.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setOfficeHoursSent(false);
                      setOfficeHoursModal(null);
                      setActiveTab('bookings');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    View My Booked Sessions
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestOfficeHours} className="py-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Specific Challenge or Topic for Discussion <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    placeholder="E.g., Reviewing our provisional patent claim drafting and SISFS Tranche 2 milestone criteria..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Time Window</label>
                    <select
                      value={bookingTimeWindow}
                      onChange={(e) => setBookingTimeWindow(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option>Morning (10 AM - 1 PM)</option>
                      <option>Afternoon (2 PM - 5 PM)</option>
                      <option>Evening (5 PM - 7 PM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preferred Mode</label>
                    <select
                      value={bookingMode}
                      onChange={(e) => setBookingMode(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option>Virtual Video Conference</option>
                      <option>In-Person (Incubation Lab)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-[12px] text-emerald-900">
                  <p>
                    <strong>Advisor Availability:</strong> {officeHoursModal.availability} • {officeHoursModal.mentoring_format}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setOfficeHoursModal(null)}
                    className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center space-x-1"
                  >
                    <span>{submittingBooking ? 'Submitting...' : 'Submit Session Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= ADMIN ADD/EDIT FORM MODAL ================= */}
      {isAdmin && isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? 'Edit Mentor Profile' : 'Empanel New Advisory Mentor'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-700"
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
                    Mentor Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Sundaram"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                  {formErrors.full_name && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Chief Patent Counsel / Partner"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                  {formErrors.designation && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.designation}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Organization / Firm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. TechLaw Associates / Ex-ISRO"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                  {formErrors.organization && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.organization}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@techlaw.in"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                  {formErrors.email && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Area of Expertise
                  </label>
                  <select
                    value={formData.areas_of_expertise}
                    onChange={(e) => setFormData({ ...formData, areas_of_expertise: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Product & Go-To-Market">Product &amp; Go-To-Market</option>
                    <option value="Hardware & IoT Prototyping">Hardware &amp; IoT Prototyping</option>
                    <option value="IPR, Patents & Trademarks">IPR, Patents &amp; Trademarks</option>
                    <option value="DeepTech & AI Architecture">DeepTech &amp; AI Architecture</option>
                    <option value="Fundraising & Financial Modeling">Fundraising &amp; Financial Modeling</option>
                    <option value="Regulatory Affairs & CDSCO">Regulatory Affairs &amp; CDSCO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Availability Window</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="e.g. Bi-weekly (2 Hours) / Saturday mornings"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mentoring Format</label>
                  <select
                    value={formData.mentoring_format}
                    onChange={(e) => setFormData({ ...formData, mentoring_format: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Virtual (1:1)">Virtual (1:1)</option>
                    <option value="In-Person (Incubator Lab)">In-Person (Incubator Lab)</option>
                    <option value="Hybrid (Virtual & In-Person)">Hybrid (Virtual &amp; In-Person)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Industry Skills &amp; Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.industry_skills}
                  onChange={(e) => setFormData({ ...formData, industry_skills: e.target.value })}
                  placeholder="e.g. Edge AI, Firmware, Patent Drafting, B2B Sales"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Professional Bio / Experience Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Highlight past achievements, corporate experience, or startup investments..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                {formErrors.bio && (
                  <p className="text-rose-500 text-[11px] mt-1">{formErrors.bio}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Internal Staff Notes (Staff Only - Hidden from Startups)
                </label>
                <textarea
                  rows={2}
                  value={formData.internal_notes}
                  onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                  placeholder="Confidential notes on engagement history, honorarium terms, or preferences..."
                  className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg text-xs"
                />
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
                  {submitting ? 'Saving...' : editingId ? 'Update Mentor' : 'Empanel Mentor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

