import React, { useState } from 'react';
import { FormDataRecord, SignatureSlot } from '../types/index.js';
import { PenTool, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import { SignaturePadModal } from './SignaturePadModal.js';

interface DirectFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: FormDataRecord;
  onSave: (payload: { diverifikasiOleh: SignatureSlot[]; disetujuiOleh: SignatureSlot[] }) => Promise<void>;
}

export const DirectFillModal: React.FC<DirectFillModalProps> = ({
  isOpen,
  onClose,
  form,
  onSave,
}) => {
  const [diverifikasi, setDiverifikasi] = useState<SignatureSlot[]>(
    JSON.parse(JSON.stringify(form.diverifikasiOleh || []))
  );
  const [disetujui, setDisetujui] = useState<SignatureSlot[]>(
    JSON.parse(JSON.stringify(form.disetujuiOleh || []))
  );
  const [isSaving, setIsSaving] = useState(false);

  // Active slot for drawing signature
  const [activeSignTarget, setActiveSignTarget] = useState<{
    group: 'diverifikasi' | 'disetujui';
    index: number;
    title: string;
    name: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSlotChange = (
    group: 'diverifikasi' | 'disetujui',
    index: number,
    field: 'name' | 'title',
    value: string
  ) => {
    if (group === 'diverifikasi') {
      const copy = [...diverifikasi];
      copy[index][field] = value;
      setDiverifikasi(copy);
    } else {
      const copy = [...disetujui];
      copy[index][field] = value;
      setDisetujui(copy);
    }
  };

  const handleOpenPad = (group: 'diverifikasi' | 'disetujui', index: number) => {
    const slot = group === 'diverifikasi' ? diverifikasi[index] : disetujui[index];
    setActiveSignTarget({
      group,
      index,
      title: slot.title,
      name: slot.name,
    });
  };

  const handleSaveSignature = (data: { name: string; title: string; signatureDataUrl: string }) => {
    if (!activeSignTarget) return;
    const { group, index } = activeSignTarget;

    const todayStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date());

    if (group === 'diverifikasi') {
      const copy = [...diverifikasi];
      copy[index].name = data.name;
      copy[index].title = data.title;
      copy[index].signatureDataUrl = data.signatureDataUrl;
      copy[index].date = todayStr;
      setDiverifikasi(copy);
    } else {
      const copy = [...disetujui];
      copy[index].name = data.name;
      copy[index].title = data.title;
      copy[index].signatureDataUrl = data.signatureDataUrl;
      copy[index].date = todayStr;
      setDisetujui(copy);
    }

    setActiveSignTarget(null);
  };

  const handleFormSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave({
        diverifikasiOleh: diverifikasi,
        disetujuiOleh: disetujui,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Isi Langsung & Simpan (Superadmin Bypass)
              </h3>
              <p className="text-xs text-slate-500">
                Isi nama, jabatan, dan tanda tangan petinggi BTN secara langsung tanpa menunggu giliran login
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section Diverifikasi Oleh */}
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>Slot Diverifikasi Oleh ({diverifikasi.length})</span>
              <span className="text-slate-400 font-normal">Tanda tangan opsional</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diverifikasi.map((slot, i) => (
                <div
                  key={slot.key || i}
                  className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Slot #{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenPad('diverifikasi', i)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004C97] hover:underline"
                    >
                      <PenTool className="w-3 h-3" />
                      {slot.signatureDataUrl ? 'Ubah TTD' : 'Bubuhkan TTD'}
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                      Judul Jabatan
                    </label>
                    <input
                      type="text"
                      value={slot.title}
                      onChange={(e) =>
                        handleSlotChange('diverifikasi', i, 'title', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                      Nama Pejabat
                    </label>
                    <input
                      type="text"
                      value={slot.name}
                      onChange={(e) =>
                        handleSlotChange('diverifikasi', i, 'name', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold"
                      placeholder="Nama Lengkap Pejabat"
                    />
                  </div>

                  {slot.signatureDataUrl && (
                    <div className="p-1 bg-white border border-slate-200 rounded-md flex items-center justify-between">
                      <img
                        src={slot.signatureDataUrl}
                        alt="sig"
                        className="h-7 max-w-[120px] object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...diverifikasi];
                          copy[i].signatureDataUrl = '';
                          setDiverifikasi(copy);
                        }}
                        className="text-[10px] text-rose-600 hover:underline"
                      >
                        Hapus TTD
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section Disetujui Oleh */}
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>Slot Disetujui Oleh ({disetujui.length})</span>
              <span className="text-slate-400 font-normal">Tanda tangan opsional</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disetujui.map((slot, i) => (
                <div
                  key={slot.key || i}
                  className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Slot #{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenPad('disetujui', i)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004C97] hover:underline"
                    >
                      <PenTool className="w-3 h-3" />
                      {slot.signatureDataUrl ? 'Ubah TTD' : 'Bubuhkan TTD'}
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                      Judul Jabatan
                    </label>
                    <input
                      type="text"
                      value={slot.title}
                      onChange={(e) =>
                        handleSlotChange('disetujui', i, 'title', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                      Nama Pejabat
                    </label>
                    <input
                      type="text"
                      value={slot.name}
                      onChange={(e) =>
                        handleSlotChange('disetujui', i, 'name', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold"
                      placeholder="Nama Lengkap Pejabat"
                    />
                  </div>

                  {slot.signatureDataUrl && (
                    <div className="p-1 bg-white border border-slate-200 rounded-md flex items-center justify-between">
                      <img
                        src={slot.signatureDataUrl}
                        alt="sig"
                        className="h-7 max-w-[120px] object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...disetujui];
                          copy[i].signatureDataUrl = '';
                          setDisetujui(copy);
                        }}
                        className="text-[10px] text-rose-600 hover:underline"
                      >
                        Hapus TTD
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Semua Slot'}
          </button>
        </div>
      </div>

      {/* Signature Draw Modal nested */}
      {activeSignTarget && (
        <SignaturePadModal
          isOpen={true}
          onClose={() => setActiveSignTarget(null)}
          onSave={handleSaveSignature}
          initialName={activeSignTarget.name}
          initialTitle={activeSignTarget.title}
          slotTitle={activeSignTarget.title}
        />
      )}
    </div>
  );
};
