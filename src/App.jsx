import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RoleSelector from './components/RoleSelector';
import LoginForm from './components/LoginForm';
import HeroSection from './components/HeroSection';
import RegisterModal from './components/RegisterModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import StartupDashboard from './components/StartupDashboard';
import AdminDashboard from './components/AdminDashboard';
import { supabaseService } from './lib/supabaseClient';
import { authApi } from './services/api';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const currentUserRef = useRef(null);
  currentUserRef.current = currentUser;
  const [authChecking, setAuthChecking] = useState(true);
  const [activeRole, setActiveRole] = useState('admin'); // 'admin' | 'startup'

  // Credentials (empty by default - no hardcoded demo credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status flags
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Platform stats
  const [stats, setStats] = useState(null);

  // Check URL route hash and enforce role protection
  const syncRouteWithRole = (user) => {
    const hash = window.location.hash || '';
    if (!user) {
      if (hash.includes('admin') || hash.includes('startup')) {
        window.location.hash = '#/login';
        setError('Please sign in to access the incubation portal.');
      }
      return;
    }

    if (user.role === 'admin') {
      if (!hash.includes('admin')) {
        window.location.hash = '#/admin';
      }
    } else if (user.role === 'startup') {
      if (hash.includes('admin')) {
        // Startup user attempted to access admin route!
        window.location.hash = '#/startup';
        setError('This account is not authorized for the Admin Portal.');
      } else if (!hash.includes('startup')) {
        window.location.hash = '#/startup';
      }
    }
  };

  // Hydrate session on initial mount with strict role re-validation
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setAuthChecking(true);
        const user = await supabaseService.getCurrentUser();
        if (isMounted) {
          if (user && (user.role === 'admin' || user.role === 'startup')) {
            setCurrentUser(user);
            syncRouteWithRole(user);
          } else {
            setCurrentUser(null);
            syncRouteWithRole(null);
          }
        }
      } catch (err) {
        console.warn('Session hydration warning:', err);
        if (isMounted) {
          setCurrentUser(null);
          syncRouteWithRole(null);
        }
      } finally {
        if (isMounted) {
          setAuthChecking(false);
        }
      }
    };

    initAuth();

    // Listen to real-time auth changes from Supabase
    const unsubscribe = supabaseService.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        syncRouteWithRole(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = await supabaseService.getCurrentUser();
        if (isMounted) {
          setCurrentUser(user);
          syncRouteWithRole(user);
        }
      }
    });

    // Listen to manual URL hash navigation attempts
    const handleHashChange = () => {
      syncRouteWithRole(currentUserRef.current);
    };
    window.addEventListener('hashchange', handleHashChange);

    // Fetch public platform stats
    authApi.getStats()
      .then((res) => {
        if (res?.stats && isMounted) setStats(res.stats);
      })
      .catch(() => {
        if (isMounted) {
          setStats({
            totalStartupsIncubated: 248,
            totalGrantsDisbursed: '₹34.8 Cr',
            mentorsNetwork: 120,
            patentsFiled: 87
          });
        }
      });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Role toggle: clears error messages without setting demo credentials
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setError('');
    setSuccessMsg('');
  };

  // Supabase / Password Login with strict verification
  const handlePasswordLogin = async ({ email, password, role }) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await supabaseService.signIn({ email, password, role });
      if (res.success && res.user) {
        setCurrentUser(res.user);
        syncRouteWithRole(res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabaseService.signOut();
    authApi.logout();
    setCurrentUser(null);
    window.location.hash = '#/login';
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('You have been securely signed out of the portal.');
  };

  // ================= LOADING STATE: PREVENT FLASH OF PROTECTED CONTENT =================
  if (authChecking) {
    return (
      <div className="h-screen w-screen bg-[#FDFBF7] flex flex-col font-legacy selection:bg-emerald-600 selection:text-white">
        <div className="w-full h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-600 shrink-0" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-black text-white shadow-md text-base">
            VB
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              VentureBharat Incubation Portal
            </h2>
            <p className="text-[0.75rem]/4 text-slate-500 mt-1 flex items-center justify-center space-x-1.5">
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>Verifying secure portal authorization &amp; credentials...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER ROLE DASHBOARDS IF LOGGED IN =================
  if (currentUser) {
    if (currentUser.role === 'admin') {
      return (
        <AdminDashboard
          user={currentUser}
          onLogout={handleLogout}
        />
      );
    }

    if (currentUser.role === 'startup') {
      return (
        <StartupDashboard
          user={currentUser}
          onLogout={handleLogout}
        />
      );
    }

    // Corrupted or unrecognized role -> Deny access
    handleLogout();
  }

  // ================= RENDER DUAL GATEWAY LOGIN PAGE =================
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col font-legacy selection:bg-emerald-100 selection:text-emerald-950 overflow-x-hidden lg:overflow-hidden">
      {/* Top Navigation */}
      <Navbar
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      {/* Main Authentication & Showcase Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 lg:py-3 flex items-center justify-center min-h-0">
        <div className="w-full h-full max-h-[610px] grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
          
          {/* Left Column: Incubation Center Mission & Impact */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col min-h-0 h-full">
            <HeroSection
              stats={stats}
              onOpenRegister={() => setIsRegisterOpen(true)}
            />
          </div>

          {/* Right Column: Portal Authentication Card */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex items-center min-h-0">
            <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-[0_8px_30px_rgba(20,40,25,0.05)] border border-[#E6ECE4] relative overflow-hidden">

              {/* Portal Header */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">VentureBharat Gateway</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Sign In to Portal
                    </h2>
                  </div>
                  <span className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Secure Access</span>
                  </span>
                </div>
                <p className="text-[0.75rem]/4 text-slate-500 mt-0.5">
                  National Innovation &amp; Incubation Management Platform
                </p>
              </div>

              {/* Role Switcher: Incubation Admin (Left/Top) vs Startup Innovator (Right/Bottom) */}
              <RoleSelector
                activeRole={activeRole}
                onRoleChange={handleRoleChange}
              />

              {/* Notification Message */}
              {successMsg && (
                <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-[0.75rem]/4 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Standard Email & Password Form */}
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

              {/* Registration Prompt Link */}
              <div className="mt-3.5 pt-3 text-center border-t border-slate-100 text-[0.75rem]/4 text-slate-500">
                <span>New innovation venture? </span>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 transition"
                >
                  Apply for Incubation &amp; Seed Grants
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={(newUser, message) => {
          if (newUser) {
            setCurrentUser(newUser);
            syncRouteWithRole(newUser);
          } else {
            setSuccessMsg(message || 'Registration submitted! Please verify your email or sign in with your credentials.');
          }
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </div>
  );
}
