import React, { useState, useEffect } from 'react';
import {
  SystemSettings,
  ReminderRecipient,
  ReminderLog,
  AuditLog,
} from '../types/index.js';
import {
  Settings,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  History,
  FileCode,
} from 'lucide-react';

interface SettingsViewProps {
  token: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'fonnte' | 'recipients' | 'logs' | 'audit'>('fonnte');
  const [settings, setSettings] = useState<SystemSettings & { fonnteTokenMasked?: string; hasToken?: boolean }>({
    fonnteToken: '',
    fonnteSuperadminPhone: '',
    reminderTemplate: '',
    reminderCronSchedule: '0 9 * * 1-5',
    defaultDiverifikasiSlots: [],
    defaultDisetujuiSlots: [],
  });

  const [recipients, setRecipients] = useState<ReminderRecipient[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fonnte Input state
  const [inputToken, setInputToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [template, setTemplate] = useState('');
  const [cronSchedule, setCronSchedule] = useState('0 9 * * 1-5');

  // Test Message modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTargetPhone, setTestTargetPhone] = useState('');
  const [testCustomMessage, setTestCustomMessage] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  // Recipient form state
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');
  const [newRecipientSlotTitle, setNewRecipientSlotTitle] = useState('');
  const [newRecipientSlotKey, setNewRecipientSlotKey] = useState('');

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setAdminPhone(data.settings.fonnteSuperadminPhone || '');
        setTemplate(data.settings.reminderTemplate || '');
        setCronSchedule(data.settings.reminderCronSchedule || '0 9 * * 1-5');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecipients = async () => {
    try {
      const res = await fetch('/api/reminders/recipients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.recipients) setRecipients(data.recipients);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const [resLogs, resAudit] = await Promise.all([
        fetch('/api/reminders/logs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const dataLogs = await resLogs.json();
      const dataAudit = await resAudit.json();
      if (dataLogs.logs) setReminderLogs(dataLogs.logs);
      if (dataAudit.logs) setAuditLogs(dataAudit.logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchRecipients();
    fetchLogs();
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPhone && !/^08\d{8,11}$/.test(adminPhone.trim())) {
      alert('Format Nomor WhatsApp Superadmin wajib 08xxxxxxxxxx (10-13 digit angka diawali 08, tanpa +62)');
      return;
    }

    try {
      const payload: any = {
        fonnteSuperadminPhone: adminPhone.trim(),
        reminderTemplate: template,
        reminderCronSchedule: cronSchedule,
      };
      if (inputToken.trim()) {
        payload.fonnteToken = inputToken.trim();
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      alert('Pengaturan WhatsApp & Sistem berhasil disimpan!');
      setInputToken('');
      await fetchSettings();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan.');
    }
  };

  const handleTestSend = async () => {
    if (!testTargetPhone || !/^08\d{8,11}$/.test(testTargetPhone.trim())) {
      alert('Nomor tujuan tes wajib berformat 08xxxxxxxxxx');
      return;
    }

    try {
      setTestResult({ loading: true });
      const res = await fetch('/api/reminders/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: testTargetPhone.trim(),
          message: testCustomMessage,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      await fetchLogs();
    } catch (err: any) {
      setTestResult({ success: false, response: err.message });
    }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^08\d{8,11}$/.test(newRecipientPhone.trim())) {
      alert('Nomor WhatsApp penerima wajib berformat 08xxxxxxxxxx (10-13 digit, diawali 08)');
      return;
    }

    try {
      const res = await fetch('/api/reminders/recipients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newRecipientName.trim(),
          whatsappNumber: newRecipientPhone.trim(),
          slotTitle: newRecipientSlotTitle.trim(),
          slotKey: newRecipientSlotKey.trim() || `slot_${Date.now()}`,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      setNewRecipientName('');
      setNewRecipientPhone('');
      setNewRecipientSlotTitle('');
      setNewRecipientSlotKey('');
      await fetchRecipients();
    } catch (err) {
      console.error(err);
      alert('Gagal menambah penerima.');
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (!confirm('Hapus penerima reminder ini?')) return;
    try {
      await fetch(`/api/reminders/recipients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchRecipients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#004C97]">
              PENGATURAN SISTEM
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            WhatsApp Gateway (Fonnte) & Pengaturan Otomatisasi
          </h2>
          <p className="text-xs text-slate-500">
            Konfigurasi token Fonnte, jadwal cron reminder tanda tangan, dan log pengiriman
          </p>
        </div>

        <button
          onClick={() => {
            setTestTargetPhone(adminPhone || '08974847052');
            setTestCustomMessage(
              'Tes pesan notifikasi otomatis dari Sistem Formulir Dokumentasi Aset Proyek TI Bank BTN via Fonnte Gateway.'
            );
            setTestResult(null);
            setTestModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
          Kirim Pesan Tes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('fonnte')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'fonnte'
              ? 'border-[#004C97] text-[#004C97]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Gateway Fonnte & Template
        </button>

        <button
          onClick={() => setActiveTab('recipients')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'recipients'
              ? 'border-[#004C97] text-[#004C97]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Daftar Penerima Reminder ({recipients.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-[#004C97] text-[#004C97]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Log Reminder WhatsApp ({reminderLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-[#004C97] text-[#004C97]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Audit Trail Sistem ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: FONNTE & TEMPLATE */}
      {activeTab === 'fonnte' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200 space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Token API Fonnte
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder={
                    settings.fonnteTokenMasked
                      ? `Tersimpan: ${settings.fonnteTokenMasked}`
                      : 'Masukkan token Fonnte dari dashboard fonnte.com'
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Token disimpan terenkripsi dan dimasking. Kosongkan jika tidak ingin mengubah token lama.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Nomor WhatsApp Superadmin (Penerima Notifikasi Event & Rekap)
              </label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Format wajib <strong>08xxxxxxxxxx</strong> (10-13 digit angka, tanpa tanda plus atau strip).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Jadwal Otomatisasi Reminder (Cron Expression)
            </label>
            <select
              value={cronSchedule}
              onChange={(e) => setCronSchedule(e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
            >
              <option value="0 9 * * 1-5">Setiap Hari Kerja (Senin-Jumat) Pukul 09:00 WIB (0 9 * * 1-5)</option>
              <option value="0 9,14 * * 1-5">2 Kali Sehari (09:00 & 14:00 WIB) Senin-Jumat (0 9,14 * * 1-5)</option>
              <option value="0 9 * * *">Setiap Hari Pukul 09:00 WIB (0 9 * * *)</option>
              <option value="0 */4 * * *">Setiap 4 Jam Sekali (0 */4 * * *)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Sistem akan memindai seluruh formulir berstatus <strong>On Going</strong> dan mengirim rekap ke pejabat terkait yang belum menandatangani.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Template Pesan Reminder Pejabat BTN
            </label>
            <textarea
              rows={4}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                {'{nama}'}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                {'{nama_proyek}'}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                {'{kode_proyek}'}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                {'{vendor}'}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                {'{slot_belum_ttd}'}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                {'{link}'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#004C97] hover:bg-[#00366B] text-white font-bold rounded-xl shadow-xs"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: RECIPIENTS */}
      {activeTab === 'recipients' && (
        <div className="space-y-6">
          {/* Add form */}
          <form
            onSubmit={handleAddRecipient}
            className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200"
          >
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-4">
              Tambah Pejabat Penerima Reminder Tanda Tangan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Lengkap Pejabat</label>
                <input
                  type="text"
                  value={newRecipientName}
                  onChange={(e) => setNewRecipientName(e.target.value)}
                  placeholder="Ratih Yulia P"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nomor WhatsApp (08xxx)</label>
                <input
                  type="text"
                  value={newRecipientPhone}
                  onChange={(e) => setNewRecipientPhone(e.target.value)}
                  placeholder="081298765432"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Jabatan / Slot Terkait</label>
                <input
                  type="text"
                  value={newRecipientSlotTitle}
                  onChange={(e) => setNewRecipientSlotTitle(e.target.value)}
                  placeholder="IT Project Manager BTN"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#004C97] hover:bg-[#00366B] text-white font-bold rounded-lg"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Tambah Penerima
                </button>
              </div>
            </div>
          </form>

          {/* List */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Nama</th>
                  <th className="p-4">Nomor WhatsApp</th>
                  <th className="p-4">Slot Jabatan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recipients.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-800">{r.name}</td>
                    <td className="p-4 font-mono font-medium text-slate-700">{r.whatsappNumber}</td>
                    <td className="p-4 font-semibold text-[#004C97]">{r.slotTitle}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteRecipient(r.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REMINDER LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Waktu</th>
                <th className="p-4">Tujuan</th>
                <th className="p-4">Pesan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Respon Fonnte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminderLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Belum ada riwayat pengiriman reminder.
                  </td>
                </tr>
              ) : (
                reminderLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">{log.target}</td>
                    <td className="p-4 text-slate-700 max-w-xs truncate" title={log.message}>
                      {log.message}
                    </td>
                    <td className="p-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> SUKSES
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" /> GAGAL
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500 max-w-xs truncate" title={log.response}>
                      {log.response}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Waktu</th>
                <th className="p-4">User</th>
                <th className="p-4">Aksi</th>
                <th className="p-4">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Belum ada audit log.
                  </td>
                </tr>
              ) : (
                auditLogs.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(a.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-bold text-slate-800">@{a.username}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {a.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700">{a.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Test Send Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-800">Kirim Pesan Tes via Fonnte</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor Tujuan (Format 08xxxxxxxxxx)
              </label>
              <input
                type="text"
                value={testTargetPhone}
                onChange={(e) => setTestTargetPhone(e.target.value)}
                placeholder="08974847052"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Isi Pesan</label>
              <textarea
                rows={3}
                value={testCustomMessage}
                onChange={(e) => setTestCustomMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs ${
                  testResult.loading
                    ? 'bg-blue-50 text-blue-800'
                    : testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.loading ? (
                  <span>Mengirim pesan via API Fonnte...</span>
                ) : testResult.success ? (
                  <span>
                    ✓ Berhasil terkirim! Respon: {JSON.stringify(testResult.response)}
                  </span>
                ) : (
                  <span>
                    ✗ Gagal mengirim: {JSON.stringify(testResult.response)}
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleTestSend}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
              >
                Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
