import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  Smartphone, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function AdminLoginView() {
  const { 
    adminLogin, 
    adminRequestOtp, 
    adminVerifyOtp, 
    currentOtp, 
    setActiveTab 
  } = useApp();

  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  
  // Password credentials
  const [username, setUsername] = useState('admin@gsmscope.com');
  const [password, setPassword] = useState('GsmScope2026!Admin');
  const [showPassword, setShowPassword] = useState(false);

  // OTP credentials
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(60);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpCountdown]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = adminLogin(username, password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleSendOtp = () => {
    setErrorMessage(null);
    const code = adminRequestOtp();
    setOtpSent(true);
    setOtpCountdown(60);
    setSuccessMessage(`OTP sent! Use verification code: ${code}`);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = adminVerifyOtp(otpCode);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to public site</span>
        </button>

        {/* Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-7 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
              GsmScope Admin Studio
            </h1>
            <p className="text-xs text-slate-400">
              Restricted management console. Authentication required.
            </p>
          </div>

          {/* Method Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => {
                setAuthMethod('password');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Password Login</span>
            </button>
            <button
              onClick={() => {
                setAuthMethod('otp');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                authMethod === 'otp'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure 2FA OTP</span>
            </button>
          </div>

          {/* Error & Success Toasts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* METHOD 1: PASSWORD LOGIN */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Administrator Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@gsmscope.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Admin Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* METHOD 2: OTP LOGIN */}
          {authMethod === 'otp' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 block">
                  Two-Factor Authentication (OTP)
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  An encrypted 6-digit one-time passcode can be dispatched to your registered administrator number (+234 80*** ***42).
                </p>
                
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Send Verification OTP</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Code active for: <strong className="text-emerald-400 font-mono">{otpCountdown}s</strong></span>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpCountdown > 45}
                        className="text-emerald-400 hover:underline disabled:opacity-40"
                      >
                        Resend Code
                      </button>
                    </div>

                    {currentOtp && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-emerald-400 block font-mono">SIMULATED SMS DISPATCH:</span>
                          <span className="text-base font-bold font-mono text-white tracking-widest">{currentOtp}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpCode(currentOtp)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {otpSent && (
                <form onSubmit={handleOtpSubmit} className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center font-mono text-xl tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? <span>Verifying OTP...</span> : <span>Verify &amp; Enter Dashboard</span>}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Credentials helper card */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-xl border">
            <span className="font-semibold text-slate-300 block">Default Administrator Access:</span>
            <div className="font-mono text-slate-300 space-y-0.5">
              <div>Username: <span className="text-emerald-400">admin@gsmscope.com</span> (or <span className="text-emerald-400">admin</span>)</div>
              <div>Password: <span className="text-emerald-400">GsmScope2026!Admin</span></div>
              <div>Master OTP: <span className="text-emerald-400">849201</span> (or click &quot;Send Verification OTP&quot;)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
