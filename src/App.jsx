import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RoleSelector from './components/RoleSelector';
import LoginForm from './components/LoginForm';
import OtpLoginForm from './components/OtpLoginForm';
import QuickDemoBar from './components/QuickDemoBar';
import HeroSection from './components/HeroSection';
import RegisterModal from './components/RegisterModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import StartupDashboard from './components/StartupDashboard';
import AdminDashboard from './components/AdminDashboard';
import SupabaseGuideModal from './components/SupabaseGuideModal';
import { supabaseService, isSupabaseConfigured } from './lib/supabaseClient';
import { authApi } from './services/api';
import { Lock, Smartphone, ShieldCheck, CheckCircle2, Database } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRole, setActiveRole] = useState('startup'); // 'startup' | 'admin'
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'

  // Credentials
  const [email, setEmail] = useState('founder@venturebharat.in');
  const [password, setPassword] = useState('Startup@2026');
  const [identifier, setIdentifier] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('123456');

  // Status flags
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Platform stats
  const [stats, setStats] = useState(null);

  // Hydrate session on initial mount
  useEffect(() => {
    supabaseService.getCurrentUser().then((u) => {
      if (u) setCurrentUser(u);
    });

    authApi.getStats()
      .then((res) => {
        if (res?.stats) setStats(res.stats);
      })
      .catch(() => {
        setStats({
          totalStartupsIncubated: 248,
          totalGrantsDisbursed: '₹34.8 Cr',
          mentorsNetwork: 120,
          patentsFiled: 87
        });
      });
  }, []);

  // Role toggle
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setError('');
    setSuccessMsg('');
    if (role === 'startup') {
      setEmail('founder@venturebharat.in');
      setPassword('Startup@2026');
      setIdentifier('+91 98765 43210');
    } else {
      setEmail('admin@venturebharat.in');
      setPassword('Admin@2026');
      setIdentifier('+91 99000 11223');
    }
  };

  // Demo Autofill
  const handleSelectDemo = (profile) => {
    setActiveRole(profile.role);
    setEmail(profile.email);
    setPassword(profile.password);
    setIdentifier(profile.phone);
    setError('');
    setSuccessMsg(`Autofilled demo credentials for ${profile.title}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Supabase / Password Login
  const handlePasswordLogin = async ({ email, password, role }) => {
    try {
      setLoading(true);
      setError('');
      const res = await supabaseService.signIn({ email, password, role });
      if (res.success) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Request
  const handleSendOtp = async (inputIdentifier) => {
    try {
      setSendingOtp(true);
      setError('');
      const res = await authApi.sendOtp(inputIdentifier);
      if (res.success) {
        setOtpSent(true);
        if (res.demoOtp) setDemoOtpCode(res.demoOtp);
        setSuccessMsg(res.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch OTP. Please check mobile/email.');
    } finally {
      setSendingOtp(false);
    }
  };

  // OTP Verification
  const handleVerifyOtp = async (inputIdentifier, otpCode) => {
    try {
      setVerifyingOtp(true);
      setError('');
      const res = await authApi.verifyOtp(inputIdentifier, otpCode);
      if (res.success) {
        // Map role to startup/admin
        const userObj = {
          ...res.user,
          role: res.user.role === 'admin' ? 'admin' : 'startup'
        };
        localStorage.setItem('vb_active_user', JSON.stringify(userObj));
        setCurrentUser(userObj);
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please retry.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabaseService.signOut();
    authApi.logout();
    setCurrentUser(null);
  };

  // ================= RENDER ROLE DASHBOARDS IF LOGGED IN =================
  if (currentUser) {
    if (currentUser.role === 'admin') {
      return (
        <>
          <AdminDashboard
            user={currentUser}
            onLogout={handleLogout}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
          <SupabaseGuideModal
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
          />
        </>
      );
    }

    // Default to Startup Dashboard
    return (
      <>
        <StartupDashboard
          user={currentUser}
          onLogout={handleLogout}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
        <SupabaseGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      </>
    );
  }

  // ================= RENDER DUAL GATEWAY LOGIN PAGE =================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Authentication & Showcase Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Incubation Center Mission & Impact */}
          <div className="lg:col-span-7">
            <HeroSection
              stats={stats}
              onOpenRegister={() => setIsRegisterOpen(true)}
            />
          </div>

          {/* Right Column: Portal Authentication Card */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
              {/* Subtle Tricolor Accent Indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

              {/* Portal Header */}
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Portal Authentication
                  </h2>
                  <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Supabase RLS Enabled</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Single Sign-On for Startup Innovators & Incubation Center Administrators
                </p>
              </div>

              {/* Role Switcher: Startup Innovator vs Admin */}
              <RoleSelector
                activeRole={activeRole}
                onRoleChange={handleRoleChange}
              />

              {/* Login Method Tabs: Password vs Mobile OTP */}
              <div className="flex rounded-lg bg-slate-950 p-1 mb-5 border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-md flex items-center justify-center space-x-2 transition ${
                    authMode === 'password'
                      ? 'bg-slate-850 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password Login (Supabase)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('otp');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-md flex items-center justify-center space-x-2 transition ${
                    authMode === 'otp'
                      ? 'bg-slate-850 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile OTP (+91)</span>
                </button>
              </div>

              {/* Notification Message */}
              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center space-x-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form Content */}
              {authMode === 'password' ? (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  role={activeRole}
                  onSubmit={handlePasswordLogin}
                  loading={loading}
                  error={error}
                  onOpenForgot={() => setIsForgotOpen(true)}
                />
              ) : (
                <OtpLoginForm
                  identifier={identifier}
                  setIdentifier={setIdentifier}
                  onSendOtp={handleSendOtp}
                  onVerifyOtp={handleVerifyOtp}
                  sendingOtp={sendingOtp}
                  verifyingOtp={verifyingOtp}
                  otpSent={otpSent}
                  error={error}
                  demoOtpCode={demoOtpCode}
                />
              )}

              {/* One-Click Quick Fill Demo Credentials */}
              <QuickDemoBar
                onSelectDemo={handleSelectDemo}
              />

              {/* Registration Prompt Link */}
              <div className="mt-5 pt-4 text-center border-t border-slate-800/80 text-xs text-slate-400">
                <span>New innovation venture? </span>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="text-orange-400 hover:text-orange-300 font-bold underline transition"
                >
                  Apply for Incubation & Grants
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={(newUser) => {
          setCurrentUser(newUser);
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />

      <SupabaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
