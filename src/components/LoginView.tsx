import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, KeyRound, Building } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Login gagal.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError('Gagal terhubung ke server. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Brand Header Banner */}
        <div className="bg-[#004C97] p-8 text-white text-center relative overflow-hidden">
          {/* Top Yellow/Blue stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="w-1/3 bg-[#F7A800]"></div>
            <div className="w-2/3 bg-[#004C97]"></div>
          </div>

          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-2xl shadow-md inline-flex items-center justify-center">
              <svg viewBox="0 0 280 110" className="h-10 w-auto">
                <text
                  x="5"
                  y="85"
                  fontSize="90"
                  fontFamily="'Arial Black', Impact, sans-serif"
                  fontWeight="900"
                  fill="#004c97"
                >
                  btn
                </text>
                <path d="M 125 15 L 180 3 L 165 17 L 115 28 Z" fill="#e31837" />
              </svg>
            </div>
          </div>

          <h2 className="text-lg font-black tracking-tight uppercase">
            Bank BTN (Persero) Tbk
          </h2>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            Sistem Formulir Dokumentasi Aset Proyek TI
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-semibold border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            Standard Dokumen 1:1 Resmi BTN
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="superadmin / vendor_wide / pm_btn"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#004C97] hover:bg-[#00366B] text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Quick Demo Login Preset Buttons for easy testing */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Uji Coba Cepat (Akun Demo):
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin', 'SuperAdmin123!')}
                className="p-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-xl text-center transition-colors"
              >
                <div className="text-[10px] font-bold text-purple-800">Superadmin</div>
                <div className="text-[9px] text-purple-600 font-mono">superadmin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('vendor_wide', 'Vendor123!')}
                className="p-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-xl text-center transition-colors"
              >
                <div className="text-[10px] font-bold text-amber-800">Vendor</div>
                <div className="text-[9px] text-amber-600 font-mono">vendor_wide</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('pm_btn', 'Btn123!')}
                className="p-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors"
              >
                <div className="text-[10px] font-bold text-blue-800">Manajemen</div>
                <div className="text-[9px] text-blue-600 font-mono">pm_btn</div>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} PT. Bank Tabungan Negara (Persero) Tbk. All rights reserved.
      </div>
    </div>
  );
};
