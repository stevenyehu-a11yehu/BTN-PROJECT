import React, { useState } from 'react';
import { FormDataRecord, User, FormStatus } from '../types/index.js';
import {
  FileText,
  Search,
  PlusCircle,
  Eye,
  Edit,
  PenTool,
  Paperclip,
  CheckCircle,
  RotateCcw,
  Send,
  Download,
  FileDown,
  Trash2,
  Sparkles,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { FormPreview1to1 } from './FormPreview1to1.js';
import { AttachmentsModal } from './AttachmentsModal.js';
import { DirectFillModal } from './DirectFillModal.js';
import { SignaturePadModal } from './SignaturePadModal.js';

interface FormsListViewProps {
  forms: FormDataRecord[];
  currentUser: User;
  token: string;
  onRefresh: () => Promise<void>;
  onNavigateCreate: () => void;
  onNavigateEdit: (formId: string) => void;
}

export const FormsListView: React.FC<FormsListViewProps> = ({
  forms,
  currentUser,
  token,
  onRefresh,
  onNavigateCreate,
  onNavigateEdit,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedFormForPreview, setSelectedFormForPreview] = useState<FormDataRecord | null>(null);

  // Modals state
  const [attachmentModalForm, setAttachmentModalForm] = useState<FormDataRecord | null>(null);
  const [directFillForm, setDirectFillForm] = useState<FormDataRecord | null>(null);
  const [signatureModalTarget, setSignatureModalTarget] = useState<{
    form: FormDataRecord;
    slotType: 'disusunOleh' | 'diverifikasiOleh' | 'disetujuiOleh';
    slotKey?: string;
    slotTitle: string;
    name: string;
  } | null>(null);

  // Reject / Revision notes modal state
  const [revisionModalForm, setRevisionModalForm] = useState<FormDataRecord | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

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

  const filteredForms = forms.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      f.namaProyekTI.toLowerCase().includes(q) ||
      f.kodeProyekTI.toLowerCase().includes(q) ||
      f.pihakKedua.toLowerCase().includes(q) ||
      f.registrationNo.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (formId: string, newStatus: FormStatus) => {
    try {
      const res = await fetch(`/api/forms/${formId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah status form.');
    }
  };

  const handleManualReminder = async (form: FormDataRecord) => {
    try {
      const res = await fetch(`/api/reminders/send-now/${form.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(`Reminder berhasil diproses! ${data.sentCount} pesan WhatsApp dikirim via Fonnte.`);
      } else {
        alert('Gagal mengirim reminder: ' + (data.response || 'Periksa token Fonnte'));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim reminder.');
    }
  };

  const handleDeleteForm = async (form: FormDataRecord) => {
    if (!confirm(`Hapus permanen formulir "${form.namaProyekTI}" (${form.registrationNo})?`)) return;
    try {
      await fetch(`/api/forms/${form.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevisionSubmit = async () => {
    if (!revisionModalForm || !revisionNotes.trim()) {
      alert('Silakan tuliskan catatan revisi.');
      return;
    }

    try {
      const res = await fetch(`/api/forms/${revisionModalForm.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: revisionNotes.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      alert('Permintaan revisi berhasil dikirim ke vendor!');
      setRevisionModalForm(null);
      setRevisionNotes('');
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim revisi.');
    }
  };

  const handleOpenMySignature = (form: FormDataRecord) => {
    // Determine which slot belongs to currentUser
    if (currentUser.role === 'vendor') {
      setSignatureModalTarget({
        form,
        slotType: 'disusunOleh',
        slotTitle: 'IT Project Manager Vendor',
        name: currentUser.fullName,
      });
      return;
    }

    // Check Diverifikasi slots
    const divSlot = form.diverifikasiOleh.find(
      (s) =>
        s.title.toLowerCase().trim() === (currentUser.assignedSlot || '').toLowerCase().trim() ||
        s.name.toLowerCase().trim() === currentUser.fullName.toLowerCase().trim()
    );

    if (divSlot) {
      setSignatureModalTarget({
        form,
        slotType: 'diverifikasiOleh',
        slotKey: divSlot.key,
        slotTitle: divSlot.title,
        name: currentUser.fullName,
      });
      return;
    }

    // Check Disetujui slots
    const appSlot = form.disetujuiOleh.find(
      (s) =>
        s.title.toLowerCase().trim() === (currentUser.assignedSlot || '').toLowerCase().trim() ||
        s.name.toLowerCase().trim() === currentUser.fullName.toLowerCase().trim()
    );

    if (appSlot) {
      setSignatureModalTarget({
        form,
        slotType: 'disetujuiOleh',
        slotKey: appSlot.key,
        slotTitle: appSlot.title,
        name: currentUser.fullName,
      });
      return;
    }

    // Default fallback: first available unsigned slot
    const firstUnsignedDiv = form.diverifikasiOleh.find((s) => !s.signatureDataUrl);
    if (firstUnsignedDiv) {
      setSignatureModalTarget({
        form,
        slotType: 'diverifikasiOleh',
        slotKey: firstUnsignedDiv.key,
        slotTitle: firstUnsignedDiv.title,
        name: currentUser.fullName,
      });
      return;
    }

    const firstUnsignedApp = form.disetujuiOleh.find((s) => !s.signatureDataUrl);
    if (firstUnsignedApp) {
      setSignatureModalTarget({
        form,
        slotType: 'disetujuiOleh',
        slotKey: firstUnsignedApp.key,
        slotTitle: firstUnsignedApp.title,
        name: currentUser.fullName,
      });
      return;
    }

    alert('Semua slot tanda tangan telah terisi.');
  };

  const handleSaveSignature = async (data: { name: string; title: string; signatureDataUrl: string }) => {
    if (!signatureModalTarget) return;
    try {
      const res = await fetch(`/api/forms/${signatureModalTarget.form.id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slotType: signatureModalTarget.slotType,
          slotKey: signatureModalTarget.slotKey,
          name: data.name,
          title: data.title,
          signatureDataUrl: data.signatureDataUrl,
        }),
      });

      const resData = await res.json();
      if (resData.error) {
        alert(resData.error);
        return;
      }

      alert('Tanda tangan berhasil disimpan ke formulir!');
      setSignatureModalTarget(null);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan tanda tangan.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {currentUser.role === 'vendor' ? 'Formulir Saya' : 'Daftar Formulir Dokumentasi Aset'}
          </h2>
          <p className="text-xs text-slate-500">
            Kelola formulir, bubuhkan tanda tangan digital, kelola lampiran, dan unduh dokumen 1:1
          </p>
        </div>

        {(currentUser.role === 'vendor' || currentUser.role === 'superadmin') && (
          <button
            onClick={onNavigateCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#004C97] hover:bg-[#00366B] text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Buat Formulir Baru
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode proyek, nama, atau vendor..."
            className="w-full text-xs outline-hidden font-medium"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Draft', 'Submitted', 'On Going', 'Done', 'Revision'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                statusFilter === st
                  ? 'bg-[#004C97] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Forms List Cards */}
      <div className="space-y-4">
        {filteredForms.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada formulir yang sesuai dengan pencarian atau filter status.
          </div>
        ) : (
          filteredForms.map((form) => {
            const signed = countSignedSlots(form);
            const total = totalSlots(form);
            const isCompleted = signed === total;

            return (
              <div
                key={form.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Meta & Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md">
                      {form.kodeProyekTI}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      No. Reg: <strong>{form.registrationNo}</strong>
                    </span>
                    <span className="text-xs text-slate-400">
                      &bull; Tanggal: {form.registrationDate || '-'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        form.status === 'Done'
                          ? 'bg-emerald-100 text-emerald-800'
                          : form.status === 'On Going'
                          ? 'bg-blue-100 text-blue-800'
                          : form.status === 'Revision'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {form.status}
                    </span>

                    {/* Signature progress badge */}
                    <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                      {signed} / {total} TTD
                    </span>
                  </div>
                </div>

                {/* Middle Info */}
                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">
                    {form.namaProyekTI}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs text-slate-600">
                    <div>
                      Vendor: <strong>{form.pihakKedua || '-'}</strong>
                    </div>
                    <div>
                      Kode Apps: <strong>{form.kodeAplikasi || '-'}</strong>
                    </div>
                    <div>
                      PKS: <strong>{form.noPKSTerbaru || '-'}</strong>
                    </div>
                  </div>

                  {/* Revision notes if any */}
                  {form.status === 'Revision' && form.revisionNotes && (
                    <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <strong>Catatan Revisi Manajemen BTN:</strong> {form.revisionNotes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Preview 1:1 button */}
                    <button
                      onClick={() => setSelectedFormForPreview(form)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Pratinjau 1:1
                    </button>

                    {/* Edit Form */}
                    {(currentUser.role === 'superadmin' ||
                      (currentUser.role === 'vendor' &&
                        (form.status === 'Draft' || form.status === 'Revision'))) && (
                      <button
                        onClick={() => onNavigateEdit(form.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-600" />
                        Edit
                      </button>
                    )}

                    {/* Tanda Tangan Saya (Manajemen BTN & Vendor) */}
                    {form.status !== 'Draft' && (
                      <button
                        onClick={() => handleOpenMySignature(form)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#004C97] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        Tanda Tangan Digital
                      </button>
                    )}

                    {/* Superadmin "Isi Langsung & Simpan" bypass */}
                    {currentUser.role === 'superadmin' && (
                      <button
                        onClick={() => setDirectFillForm(form)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Isi Langsung & Simpan
                      </button>
                    )}

                    {/* Attachments */}
                    <button
                      onClick={() => setAttachmentModalForm(form)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-600" />
                      Lampiran ({form.attachments?.length || 0})
                    </button>

                    {/* Manajemen BTN: Minta Revisi */}
                    {(currentUser.role === 'manajemen_btn' || currentUser.role === 'superadmin') &&
                      form.status === 'On Going' && (
                        <button
                          onClick={() => {
                            setRevisionModalForm(form);
                            setRevisionNotes('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Minta Revisi
                        </button>
                      )}
                  </div>

                  {/* Right Action buttons: Downloads & Admin toggles */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Superadmin status toggles */}
                    {currentUser.role === 'superadmin' && (
                      <>
                        {form.status !== 'Done' ? (
                          <button
                            onClick={() => handleStatusChange(form.id, 'Done')}
                            title="Tandai form sebagai Done"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Tandai Done
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(form.id, 'On Going')}
                            title="Kembalikan status ke On Going"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                          >
                            Kembalikan ke On Going
                          </button>
                        )}

                        <button
                          onClick={() => handleManualReminder(form)}
                          title="Kirim reminder WhatsApp via Fonnte sekarang"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Kirim Reminder WA
                        </button>
                      </>
                    )}

                    {/* Download PDF button (Opens 1:1 print/export view) */}
                    <a
                      href={`/api/forms/${form.id}/export/pdf-html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004C97] hover:bg-[#00366B] text-white rounded-lg text-xs font-bold shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF (1:1)
                    </a>

                    {/* Download Word (.docx) */}
                    <a
                      href={`/api/forms/${form.id}/export/word`}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-2xs"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Word (.docx)
                    </a>

                    {/* Delete Form */}
                    {currentUser.role === 'superadmin' && (
                      <button
                        onClick={() => handleDeleteForm(form)}
                        title="Hapus Formulir"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1:1 Live Preview Full Modal */}
      {selectedFormForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-100 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Pratinjau Resmi 1:1: {selectedFormForPreview.namaProyekTI}
                </h3>
                <p className="text-xs text-slate-500">
                  Format A4 Landscape identik dengan lampiran PDF Bank BTN
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/forms/${selectedFormForPreview.id}/export/pdf-html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#004C97] text-white font-bold text-xs rounded-lg hover:bg-[#00366B]"
                >
                  Buka Tab Cetak PDF
                </a>
                <button
                  onClick={() => setSelectedFormForPreview(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-300"
                >
                  Tutup
                </button>
              </div>
            </div>

            <FormPreview1to1 form={selectedFormForPreview} />
          </div>
        </div>
      )}

      {/* Attachments Management Modal */}
      {attachmentModalForm && (
        <AttachmentsModal
          isOpen={true}
          onClose={() => {
            setAttachmentModalForm(null);
            onRefresh();
          }}
          formId={attachmentModalForm.id}
          projectCode={attachmentModalForm.kodeProyekTI}
          attachments={attachmentModalForm.attachments || []}
          onUpload={async (att) => {
            await fetch(`/api/forms/${attachmentModalForm.id}/attachments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(att),
            });
            await onRefresh();
            // Refresh local modal state
            const updated = forms.find((f) => f.id === attachmentModalForm.id);
            if (updated) setAttachmentModalForm(updated);
          }}
          onDelete={async (attId) => {
            await fetch(`/api/forms/${attachmentModalForm.id}/attachments/${attId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            await onRefresh();
            const updated = forms.find((f) => f.id === attachmentModalForm.id);
            if (updated) setAttachmentModalForm(updated);
          }}
          onReorder={async (orderedIds) => {
            await fetch(`/api/forms/${attachmentModalForm.id}/attachments/reorder`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ orderedIds }),
            });
            await onRefresh();
          }}
        />
      )}

      {/* Superadmin Direct Fill Modal */}
      {directFillForm && (
        <DirectFillModal
          isOpen={true}
          onClose={() => setDirectFillForm(null)}
          form={directFillForm}
          onSave={async (payload) => {
            await fetch(`/api/forms/${directFillForm.id}/direct-fill`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
            await onRefresh();
          }}
        />
      )}

      {/* Signature Pad Modal for specific slot */}
      {signatureModalTarget && (
        <SignaturePadModal
          isOpen={true}
          onClose={() => setSignatureModalTarget(null)}
          onSave={handleSaveSignature}
          initialName={signatureModalTarget.name}
          initialTitle={signatureModalTarget.slotTitle}
          slotTitle={signatureModalTarget.slotTitle}
        />
      )}

      {/* Revision Modal */}
      {revisionModalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-800">
              Minta Revisi ke Vendor
            </h3>
            <p className="text-slate-500">
              Formulir akan dikembalikan ke status <strong>Revision</strong> sehingga vendor dapat memperbaiki data.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Catatan Revisi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Tuliskan bagian mana yang perlu diperbaiki (contoh: mohon perbaiki IP Server DC / spesifikasi RAM belum sesuai)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevisionModalForm(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRevisionSubmit}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
              >
                Kirim Revisi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
