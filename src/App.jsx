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
import { supabaseService } from './lib/supabaseClient';
import { authApi } from './services/api';
import { Lock, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
        />
      </>
    );
  }

  // ================= RENDER DUAL GATEWAY LOGIN PAGE =================
  return (
    <div className="min-h-screen bg-[#F6F8F4] text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Navigation */}
      <Navbar
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      {/* Main Authentication & Showcase Area */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
          
          {/* Left Column: Incubation Center Mission & Impact */}
          <div className="order-2 lg:order-1 min-h-[320px] sm:min-h-[400px] lg:min-h-[680px]">
            <HeroSection
              stats={stats}
              onOpenRegister={() => setIsRegisterOpen(true)}
            />
          </div>

          {/* Right Column: Portal Authentication Card */}
          <div className="order-1 lg:order-2 flex items-center">
            <div className="w-full bg-white rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_12px_45px_rgba(37,55,43,0.08)] relative overflow-hidden border border-[#E4EAE2]">

              {/* Portal Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">VentureBharat Portal</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      Welcome back
                    </h2>
                  </div>
                  <span className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secure access</span>
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Continue your startup journey with us.
                </p>
              </div>

              {/* Role Switcher: Startup Innovator vs Admin */}
              <RoleSelector
                activeRole={activeRole}
                onRoleChange={handleRoleChange}
              />

              {/* Login Method Tabs: Password vs Mobile OTP */}
              <div className="flex rounded-xl bg-[#F4F7F3] p-1 mb-5 border border-[#E7ECE5] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-md flex items-center justify-center space-x-2 transition ${
                    authMode === 'password'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Email &amp; Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('otp');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-md flex items-center justify-center space-x-2 transition ${
                    authMode === 'otp'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile OTP (+91)</span>
                </button>
              </div>

              {/* Notification Message */}
              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
              <div className="mt-5 pt-4 text-center border-t border-slate-100 text-xs text-slate-500">
                <span>New innovation venture? </span>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 transition"
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

    </div>
  );
}
