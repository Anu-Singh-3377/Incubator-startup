import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  role,
  onSubmit,
  loading,
  error,
  onOpenForgot
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password, role, rememberMe });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-[0.75rem]/4 text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Email / Official Username */}
      <div>
        <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1">
          Official Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={role === 'admin' ? 'director@incubator.in' : 'founder@startup.in'}
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[0.875rem]/5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[0.75rem]/4 font-semibold text-slate-700">
            Portal Password
          </label>
          <button
            type="button"
            onClick={onOpenForgot}
            className="text-[0.75rem]/4 text-emerald-700 hover:text-emerald-900 font-medium transition"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••••••"
            className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-[0.875rem]/5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember me & Security Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.75rem]/4 pt-0.5">
        <label className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600/30"
          />
          <span>Remember login on this device</span>
        </label>
        <span className="text-[11px] text-slate-400">256-bit encrypted</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-1.5 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[0.875rem]/5 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authenticating with Portal...</span>
          </>
        ) : (
          <>
            <span>Sign In to Incubation Portal</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
