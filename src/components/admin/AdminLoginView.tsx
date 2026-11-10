import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, User, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminLoginView() {
  const { 
    adminLogin, 
    startGlobalLoading,
    stopGlobalLoading,
    showGlobalToast,
    websiteContent
  } = useApp();

  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem('gsmscope_admin_remember_user') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gsmscope_admin_remember_pref') !== 'false';
    } catch {
      return true;
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    startGlobalLoading();

    setTimeout(() => {
      const res = adminLogin(username, password, rememberMe);
      setIsLoading(false);
      stopGlobalLoading();
      if (res.success) {
        showGlobalToast('Admin authentication successful', 'success');
      } else {
        setErrorMessage(res.message);
        showGlobalToast(res.message, 'error');
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-[360px] sm:max-w-[390px] mx-auto flex flex-col items-center justify-center my-auto py-8 px-4">
      {/* Header Logo */}
      <div className="flex justify-center mb-4">
        <img
          src={websiteContent?.headerLogoDarkUrl || websiteContent?.headerLogoUrl || '/assets/aistudio/GsmScope_header_logo_dark.webp'}
          alt={websiteContent?.siteName || 'GsmScope'}
          className="h-9 sm:h-10 w-auto object-contain select-none pointer-events-none"
        />
      </div>

      {/* Login Card - Slightly centered on every screen */}
      <div className="w-full rounded-2xl bg-slate-900/95 border border-slate-800 p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
            Admin Login
          </h1>
          <p className="text-[11px] text-slate-400 mt-1">
            Please enter your credentials to access the management dashboard
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-3 p-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span className="leading-tight text-[11px]">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                autoFocus
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-xs transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-xs font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="inline-flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer select-none text-[11px]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setRememberMe(checked);
                  try {
                    localStorage.setItem('gsmscope_admin_remember_pref', checked ? 'true' : 'false');
                  } catch {}
                }}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
