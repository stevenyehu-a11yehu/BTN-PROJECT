import React from 'react';
import { FormDataRecord, User } from '../types/index.js';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Users,
} from 'lucide-react';

interface DashboardViewProps {
  forms: FormDataRecord[];
  currentUser: User;
  onNavigate: (view: string, formId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  forms,
  currentUser,
  onNavigate,
}) => {
  const totalCount = forms.length;
  const draftCount = forms.filter((f) => f.status === 'Draft').length;
  const submittedCount = forms.filter((f) => f.status === 'Submitted').length;
  const onGoingCount = forms.filter((f) => f.status === 'On Going').length;
  const doneCount = forms.filter((f) => f.status === 'Done').length;

  const countSignedSlots = (f: FormDataRecord) => {
    let signed = 0;
    if (f.disusunOleh?.signatureDataUrl) signed++;
    (f.diverifikasiOleh || []).forEach((s) => {
      if (s.signatureDataUrl || s.date) signed++;
    });
    (f.disetujuiOleh || []).forEach((s) => {
      if (s.signatureDataUrl || s.date) signed++;
    });
    return signed;
  };

  const totalSlots = (f: FormDataRecord) => {
    return 1 + (f.diverifikasiOleh?.length || 4) + (f.disetujuiOleh?.length || 4);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003B75] via-[#004C97] to-[#0A64C2] rounded-3xl p-7 text-white shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold mb-3 border border-white/20">
            <span>Sistem Dokumentasi Aset Proyek TI Bank BTN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.fullName}
          </h1>
          <p className="mt-2 text-sm text-blue-100 max-w-2xl leading-relaxed">
            {currentUser.role === 'vendor'
              ? 'Kelola dokumentasi aset proyek TI, isi data spesifikasi dan lisensi, bubuhkan tanda tangan digital, lalu submit untuk verifikasi manajemen BTN.'
              : currentUser.role === 'manajemen_btn'
              ? 'Periksa formulir aset proyek TI yang membutuhkan verifikasi & persetujuan Anda, bubuhkan tanda tangan digital, atau ajukan revisi.'
              : 'Pantau seluruh progres dokumentasi aset proyek TI, manajemen hak akses, kelola lampiran, integrasi WhatsApp Fonnte, dan ekspor dokumen PDF & Word 1:1.'}
          </p>

          <div className="mt-5 flex items-center gap-3">
            {(currentUser.role === 'vendor' || currentUser.role === 'superadmin') && (
              <button
                onClick={() => onNavigate('create-form')}
                className="flex items-center gap-2 px-4 py-2 bg-[#F7A800] hover:bg-[#E09800] text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Buat Formulir Baru
              </button>
            )}
            <button
              onClick={() => onNavigate('forms')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl backdrop-blur-xs transition-colors cursor-pointer"
            >
              Lihat Daftar Formulir
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative BTN stripes in background */}
        <div className="absolute right-0 bottom-0 top-0 w-80 pointer-events-none opacity-20 flex">
          <div className="w-1/3 bg-[#F7A800] transform skew-x-[-20deg]"></div>
          <div className="w-2/3 bg-white transform skew-x-[-20deg]"></div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Formulir</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Seluruh proyek TI</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Draft</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{draftCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Belum disubmit vendor</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Menunggu TTD</span>
            <AlertCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{submittedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Menunggu verifikasi awal</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">On Going</span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{onGoingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Sedang proses sirkulasi</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Selesai (Done)</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{doneCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">TTD lengkap & final</div>
        </div>
      </div>

      {/* Signature Progress Tracker */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Progres Tanda Tangan Formulir Berjalan
            </h3>
            <p className="text-xs text-slate-500">
              Pantau status penandatanganan slot Diverifikasi Oleh & Disetujui Oleh
            </p>
          </div>
          <button
            onClick={() => onNavigate('forms')}
            className="text-xs font-bold text-[#004C97] hover:underline"
          >
            Lihat Semua
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {forms.slice(0, 5).map((f) => {
            const signed = countSignedSlots(f);
            const total = totalSlots(f);
            const pct = Math.round((signed / total) * 100);

            return (
              <div
                key={f.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors cursor-pointer"
                onClick={() => onNavigate('form-detail', f.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#004C97]">
                      {f.kodeProyekTI}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        f.status === 'Done'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.status === 'On Going'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                    {f.namaProyekTI}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Vendor: {f.pihakKedua || '-'} &bull; No Reg: {f.registrationNo || '-'}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-36 text-right">
                    <div className="text-xs font-bold text-slate-700">
                      {signed} / {total} Slot TTD
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full transition-all ${
                          pct === 100 ? 'bg-emerald-500' : 'bg-[#004C97]'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
