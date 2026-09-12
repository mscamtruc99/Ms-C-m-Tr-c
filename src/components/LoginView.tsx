import React, { useState } from 'react';
import { Lock, Eye, EyeOff, GraduationCap, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, UserCheck, RefreshCw, Plus, User, ExternalLink } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (googleUser?: { name: string; email: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<{ name: string; email: string } | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  
  // Custom Google Account inputs
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');

  // Previously logged-in accounts (for quick 1-click selection from 2nd time onwards)
  const [savedAccounts, setSavedAccounts] = useState<Array<{ name: string; email: string }>>([
    { name: 'Lê Thị Cẩm Trúc', email: 'mscamtruc99@gmail.com' },
  ]);

  // Fetch past accounts from server + localStorage on mount or modal open
  const loadSavedAccounts = async () => {
    try {
      const res = await fetch('/api/auth/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.uniqueAccounts)) {
        const serverAccounts = data.uniqueAccounts.map((a: any) => ({
          name: a.name || a.email.split('@')[0],
          email: a.email,
        }));
        
        // Merge with default owner account
        const map = new Map<string, { name: string; email: string }>();
        map.set('mscamtruc99@gmail.com', { name: 'Lê Thị Cẩm Trúc', email: 'mscamtruc99@gmail.com' });
        
        serverAccounts.forEach((acc: { name: string; email: string }) => {
          if (acc.email) map.set(acc.email.toLowerCase(), acc);
        });

        // Also check local storage for offline / cached accounts
        try {
          const localStr = localStorage.getItem('khbd_known_google_accounts');
          if (localStr) {
            const localArr = JSON.parse(localStr);
            if (Array.isArray(localArr)) {
              localArr.forEach((acc: { name: string; email: string }) => {
                if (acc.email) map.set(acc.email.toLowerCase(), acc);
              });
            }
          }
        } catch {}

        setSavedAccounts(Array.from(map.values()));
      }
    } catch (e) {
      console.error('Failed to load past Google accounts:', e);
    }
  };

  const handleGoogleSelect = (email: string, name: string) => {
    if (!email.trim() || !email.includes('@')) {
      setCustomError('Vui lòng nhập địa chỉ Email Google hợp lệ!');
      return;
    }
    
    const formattedEmail = email.trim();
    const formattedName = name.trim() || email.split('@')[0] || 'Giáo viên';

    setSelectedGoogleAccount({
      email: formattedEmail,
      name: formattedName,
    });

    // Save locally for quick suggestions next time
    try {
      const updated = [...savedAccounts];
      if (!updated.some((a) => a.email.toLowerCase() === formattedEmail.toLowerCase())) {
        updated.push({ name: formattedName, email: formattedEmail });
        setSavedAccounts(updated);
        localStorage.setItem('khbd_known_google_accounts', JSON.stringify(updated));
      }
    } catch {}

    setShowGoogleModal(false);
    setCustomError('');
    setError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedGoogleAccount) {
      setError('Vui lòng chọn hoặc nhập Tài Khoản Google trước khi đăng nhập!');
      return;
    }

    // Verify System Password
    if (password !== 'KHBD6789') {
      setError('Mật khẩu hệ thống không chính xác. Vui lòng kiểm tra lại!');
      return;
    }

    setIsLoading(true);

    // Record login entry to backend database
    fetch('/api/auth/log-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedGoogleAccount),
    }).catch((err) => console.error('Failed to log login:', err));

    setTimeout(() => {
      onLoginSuccess(selectedGoogleAccount);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 flex items-center justify-center p-4 selection:bg-rose-600 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-rose-100/30 relative z-10 space-y-6">
        {/* Header / Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-600 to-amber-500 mx-auto flex items-center justify-center shadow-lg shadow-rose-900/30">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              <a
                href="https://hoclieu.vn/"
                target="_blank"
                rel="noopener noreferrer"
                title="Truy cập Học liệu số: https://hoclieu.vn/"
                className="hover:text-rose-600 transition-colors inline-flex items-center justify-center gap-1.5 group cursor-pointer"
              >
                <span>Ms Cẩm Trúc-KHBD CHUẨN</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
              </a>
            </h1>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mt-1">
              Hệ Thống Soạn Giáo Án Chuẩn 5512
            </p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {/* Step 1: Google Account Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                1. Tài khoản Google
              </label>
            </div>

            {selectedGoogleAccount ? (
              <div className="p-3.5 bg-rose-50/80 border border-rose-200/90 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs uppercase">
                    {selectedGoogleAccount.name.charAt(0) || 'G'}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-1.5">
                      <p className="font-bold text-sm text-slate-900 truncate">{selectedGoogleAccount.name}</p>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 truncate">{selectedGoogleAccount.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCustomError('');
                    loadSavedAccounts();
                    setShowGoogleModal(true);
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-100/80 bg-rose-100/40 rounded-xl transition-colors shrink-0 flex items-center space-x-1 border border-rose-200/60"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đổi tài khoản</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCustomError('');
                  loadSavedAccounts();
                  setShowGoogleModal(true);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 shadow-xs flex items-center justify-center space-x-3 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Nhập hoặc Chọn Tài Khoản Google</span>
              </button>
            )}
          </div>

          {/* Step 2: System Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                2. Mật khẩu hệ thống
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Nhập mật khẩu..."
                className={`w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 font-semibold text-sm focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-400 focus:ring-red-400 bg-red-50/50'
                    : 'border-slate-200 focus:border-rose-500 focus:ring-rose-200'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <div className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-500 hover:text-rose-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5 text-rose-600" /> : <Eye className="w-5 h-5 text-slate-600" />}
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-xs text-red-700 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Đăng Nhập Hệ Thống</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Google Account Selector Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-slate-800">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Đăng Nhập Tài Khoản Google</h3>
            </div>

            {/* Quick 1-Click Selection for Previous Accounts */}
            {savedAccounts.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Chọn tài khoản đã sử dụng ({savedAccounts.length}):
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {savedAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleGoogleSelect(acc.email, acc.name)}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer group ${
                        selectedGoogleAccount?.email?.toLowerCase() === acc.email.toLowerCase()
                          ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                          : 'bg-slate-50 hover:bg-rose-50/60 border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-black text-xs flex items-center justify-center shrink-0 uppercase shadow-xs">
                          {acc.name.charAt(0) || 'G'}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs text-slate-900 truncate">{acc.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                        </div>
                      </div>
                      <UserCheck className="w-4 h-4 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                HOẶC NHẬP TÀI KHOẢN MỚI
              </span>
            </div>

            {/* Custom Input Form for 1st Time Login */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Email Google (*):
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    if (customError) setCustomError('');
                  }}
                  placeholder="vi-du: nguyenvana@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên Giáo viên:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="vi-du: Lê Thị Cẩm Trúc"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {customError && (
                <p className="text-[11px] font-bold text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{customError}</span>
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!customEmail.trim()) {
                    setCustomError('Vui lòng nhập Email Google!');
                    return;
                  }
                  handleGoogleSelect(customEmail, customName);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Xác Nhận Tài Khoản Google Này</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

