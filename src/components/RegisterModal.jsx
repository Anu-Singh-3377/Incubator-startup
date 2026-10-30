import React, { useState } from 'react';
import { X, Sparkles, Building2, User, Mail, Phone, Lock, CheckCircle, Loader2, AlertCircle, Rocket, Compass } from 'lucide-react';
import { supabaseService } from '../lib/supabaseClient';

export default function RegisterModal({ isOpen, onClose, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'founder',
    startupName: '',
    sector: 'DeepTech & Artificial Intelligence',
    dpiitNumber: '',
    password: '',
    confirmPassword: '',
    grantEligible: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  if (!isOpen) return null;

  const sectors = [
    'DeepTech & Artificial Intelligence',
    'AgriTech & Smart Farming',
    'HealthTech & Biomedical Devices',
    'CleanTech, Green Energy & EV',
    'FinTech & Open Financial Networks',
    'DefenceTech & Aerospace',
    'IoT, Robotics & Automation'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await supabaseService.signUpStartup({
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        phone: formData.phone,
        startup_name: formData.startupName,
        sector: formData.sector,
        dpiit_number: formData.dpiitNumber
      });

      if (res.success) {
        if (res.requiresEmailConfirmation) {
          setSuccessInfo(res.message);
        } else {
          onRegisterSuccess(res.user, res.message);
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.15)] p-5 sm:p-7 my-6 text-slate-800 max-h-[92vh] flex flex-col">
        {/* Subtle Accent Stripe on top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-600 to-emerald-700 rounded-t-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 pr-6 shrink-0">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Cohort 2026 Admissions Open</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Register with VentureBharat Incubation
          </h2>
          <p className="text-[0.75rem]/4 text-slate-500 mt-1 leading-relaxed">
            Apply for seed grant funding, deeptech lab facilities, and dedicated mentoring under AIM &amp; DST national schemes.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-[0.75rem]/4 text-rose-800 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successInfo ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Application &amp; Registration Submitted!
            </h3>
            <p className="text-[0.75rem]/4 text-slate-600 max-w-md mx-auto leading-relaxed">
              {successInfo}
            </p>
            <button
              type="button"
              onClick={() => {
                setSuccessInfo(null);
                onClose();
              }}
              className="mt-3 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[0.75rem]/4 rounded-xl shadow-xs transition"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 overflow-y-auto pr-1">
          {/* Role selector */}
          <div>
            <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1.5">
              Registration Category
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-[0.75rem]/4 font-semibold">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'founder' })}
                className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  formData.role === 'founder'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Startup Founder / Innovator</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'mentor' })}
                className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  formData.role === 'mentor'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Mentor / Industry Expert</span>
              </button>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[0.75rem]/4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@startup.in"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[0.75rem]/4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Phone & Venture Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1">
                Mobile Number (+91)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[0.75rem]/4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1">
                Startup / Venture Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required={formData.role === 'founder'}
                  value={formData.startupName}
                  onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                  placeholder="e.g. AgriSense Robotics"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[0.75rem]/4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Sector & DPIIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1">
                Primary Innovation Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[0.75rem]/4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1">
                DPIIT Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.dpiitNumber}
                onChange={(e) => setFormData({ ...formData, dpiitNumber: e.target.value })}
                placeholder="DIPP-XXXXX or leave blank"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[0.75rem]/4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1">
                Set Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[0.75rem]/4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-type password"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[0.75rem]/4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Indian Ecosystem Confirmation Box */}
          <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">
              By registering, you confirm that your venture is incorporated in India or founded by Indian residents, and agree to the Incubation Centre's code of ethics and IPR terms.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[0.75rem]/4 shadow-md shadow-emerald-700/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Cohort Application...</span>
              </>
            ) : (
              <span>Submit Incubation Registration</span>
            )}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
