import React from 'react';
import { User } from '../types/index.js';
import {
  FileText,
  Users,
  Settings,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onLogout,
}) => {
  if (!currentUser) return null;

  const roleBadge = () => {
    switch (currentUser.role) {
      case 'superadmin':
        return { label: 'SUPERADMIN', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'manajemen_btn':
        return { label: 'MANAJEMEN BTN', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'vendor':
      default:
        return { label: 'VENDOR', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
  };

  const badge = roleBadge();

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top corporate bar with BTN signature colors */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 bg-[#F7A800]"></div>
        <div className="w-2/3 bg-[#004C97]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand & Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="flex items-center">
              <svg viewBox="0 0 280 110" className="h-9 w-auto">
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
            <div className="hidden md:block border-l border-slate-200 pl-3">
              <div className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                Bank BTN (Persero) Tbk
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                Dokumentasi Aset Proyek TI
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-[#004C97]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => onNavigate('forms')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'forms' || currentView === 'form-detail'
                  ? 'bg-blue-50 text-[#004C97]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              {currentUser.role === 'vendor' ? 'Formulir Saya' : 'Daftar Formulir'}
            </button>

            {(currentUser.role === 'vendor' || currentUser.role === 'superadmin') && (
              <button
                onClick={() => onNavigate('create-form')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentView === 'create-form'
                    ? 'bg-blue-50 text-[#004C97]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Formulir Baru
              </button>
            )}

            {currentUser.role === 'superadmin' && (
              <>
                <button
                  onClick={() => onNavigate('users')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    currentView === 'users'
                      ? 'bg-blue-50 text-[#004C97]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Manajemen User
                </button>

                <button
                  onClick={() => onNavigate('settings')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    currentView === 'settings'
                      ? 'bg-blue-50 text-[#004C97]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan & WA
                </button>
              </>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">{currentUser.fullName}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                >
                  {badge.label}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 max-w-[200px] truncate">
                {currentUser.companyOrPosition || currentUser.username}
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Keluar dari sistem"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
