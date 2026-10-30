import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, ArrowRight, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function OtpLoginForm({
  identifier,
  setIdentifier,
  onSendOtp,
  onVerifyOtp,
  sendingOtp,
  verifyingOtp,
  otpSent,
  error,
  demoOtpCode
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance focus
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const digits = pasted.split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
    }
  };

  const handleAutoFillDemoOtp = () => {
    const digits = (demoOtpCode || '123456').split('');
    setOtp(digits);
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setTimer(30);
    setCanResend(false);
    onSendOtp(identifier);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) return;
    onVerifyOtp(identifier, fullOtp);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-[0.75rem]/4 text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Mobile / Identifier Input Step */}
      <form onSubmit={handleRequestOtp} className="space-y-3">
        <div>
          <label className="block text-[0.75rem]/4 font-semibold text-slate-700 mb-1.5">
            Registered Mobile (+91) or Email
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+91 98765 43210 or email"
                disabled={otpSent && !canResend}
                className="w-full pl-9 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-[0.875rem]/5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition disabled:opacity-75"
              />
            </div>
            <button
              type="submit"
              disabled={sendingOtp || (otpSent && !canResend)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[0.75rem]/4 font-semibold transition flex items-center space-x-1.5 disabled:opacity-50 shrink-0"
            >
              {sendingOtp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : otpSent ? (
                canResend ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Resend</span>
                  </>
                ) : (
                  <span className="text-slate-400 text-[11px]">{timer}s</span>
                )
              ) : (
                <span>Send OTP</span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* OTP verification box when sent */}
      {otpSent && (
        <form onSubmit={handleVerify} className="space-y-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-[0.75rem]/4 text-emerald-400">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>OTP dispatched to registered channel.</span>
            </div>
            <button
              type="button"
              onClick={handleAutoFillDemoOtp}
              className="text-[11px] font-semibold text-emerald-300 underline hover:text-emerald-200 ml-2"
            >
              Fill Demo OTP ({demoOtpCode || '123456'})
            </button>
          </div>

          <div>
            <label className="block text-[0.75rem]/4 font-semibold text-slate-300 mb-2 text-center">
              Enter 6-Digit Secure Verification Code
            </label>
            <div className="flex justify-between gap-2 max-w-xs mx-auto" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-lg font-bold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={verifyingOtp || otp.join('').length !== 6}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[0.875rem]/5 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifyingOtp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying OTP with Gateway...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Enter Portal</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

