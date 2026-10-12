import React, { useState, useEffect } from 'react';
import { FormAttachment } from '../types/index.js';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  MoveUp,
  MoveDown,
  X,
  ClipboardCheck,
  Check,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

interface AttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  projectCode: string;
  attachments: FormAttachment[];
  onUpload: (attachmentData: { fileName: string; fileType: string; dataUrl: string; fileSize: number }) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
}

export const AttachmentsModal: React.FC<AttachmentsModalProps> = ({
  isOpen,
  onClose,
  formId,
  projectCode,
  attachments,
  onUpload,
  onDelete,
  onReorder,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<FormAttachment | null>(null);

  // Clipboard Paste (Ctrl+V) listener when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            await processFile(blob, `Screenshot_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const processFile = async (file: File, overrideName?: string) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await onUpload({
          fileName: overrideName || file.name,
          fileType: file.type || 'application/octet-stream',
          dataUrl,
          fileSize: file.size,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert('Gagal memproses file.');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= attachments.length) return;

    const copy = [...attachments];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    const orderedIds = copy.map((c) => c.id);
    await onReorder(orderedIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Manajemen Lampiran Dokumen</h3>
            <p className="text-xs text-slate-500">
              Proyek TI: {projectCode} &bull; Subfolder Drive otomatis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDragging
                ? 'border-blue-600 bg-blue-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="att-file-input"
              className="hidden"
              accept="image/png,image/jpeg,application/pdf,.xlsx,.xls"
              onChange={handleFileInputChange}
            />
            <label
              htmlFor="att-file-input"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="p-3 bg-blue-100 text-[#004C97] rounded-full mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Tarik file ke sini atau klik untuk browse
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Mendukung Gambar (PNG/JPG), Dokumen PDF, & Excel (.xlsx/.xls)
              </span>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
                <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
                Tips: Tekan <strong>Ctrl + V</strong> di mana saja untuk paste screenshot langsung!
              </div>
            </label>
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center font-bold text-sm text-[#004C97]">
                Sedang memproses & mengunggah...
              </div>
            )}
          </div>

          {/* Attachments List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Lampiran Terlampir ({attachments.length})
              </h4>
              <span className="text-xs text-slate-400 italic">
                Setiap lampiran akan digabungkan sebagai halaman tersendiri di dokumen final
              </span>
            </div>

            {attachments.length === 0 ? (
              <div className="p-8 text-center border border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 text-xs">
                Belum ada lampiran. Silakan upload sertifikat lisensi atau dokumen pendukung.
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((att, idx) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white hover:border-slate-300 shadow-2xs transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Thumbnail / Icon */}
                      <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {att.dataUrl && att.dataUrl.startsWith('data:image/') ? (
                          <img
                            src={att.dataUrl}
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                        ) : att.fileName.endsWith('.xlsx') || att.fileName.endsWith('.xls') ? (
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pr-3">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          Halaman {idx + 5}: {att.fileName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {Math.round(att.fileSize / 1024)} KB &bull;{' '}
                          {new Date(att.uploadedAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Reorder, Preview, Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'up')}
                        disabled={idx === 0}
                        title="Geser ke atas"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'down')}
                        disabled={idx === attachments.length - 1}
                        title="Geser ke bawah"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      {att.dataUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewItem(att)}
                          title="Lihat Pratinjau"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(att.id)}
                        title="Hapus Lampiran"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-[#004C97] hover:bg-[#00366B] rounded-lg shadow-sm"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Full Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-6">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm text-slate-800">{previewItem.fileName}</span>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 text-slate-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[80vh] flex items-center justify-center bg-slate-100 p-2 rounded-lg">
              {previewItem.dataUrl.startsWith('data:image/') ? (
                <img src={previewItem.dataUrl} alt="preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="p-8 text-center text-slate-600">Dokumen tidak dapat dipratinjau langsung di modal ini.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
