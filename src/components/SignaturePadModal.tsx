import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { Eraser, Check, X, PenTool, RotateCcw } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; title: string; signatureDataUrl: string }) => void;
  initialName?: string;
  initialTitle?: string;
  slotTitle?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialTitle = '',
  slotTitle = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [name, setName] = useState(initialName);
  const [title, setTitle] = useState(initialTitle || slotTitle);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    setName(initialName);
    setTitle(initialTitle || slotTitle);
  }, [initialName, initialTitle, slotTitle, isOpen]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    // Set proper high-DPI scaling
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
    }

    const pad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent
      penColor: '#0f172a', // Dark slate / black
      minWidth: 1.5,
      maxWidth: 3.5,
    });

    pad.addEventListener('endStroke', () => {
      setIsEmpty(pad.isEmpty());
    });

    padRef.current = pad;
    setIsEmpty(true);

    return () => {
      pad.off();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Silakan isi Nama Lengkap penandatangan.');
      return;
    }

    if (!padRef.current || padRef.current.isEmpty()) {
      alert('Silakan buat tanda tangan pada kanvas terlebih dahulu.');
      return;
    }

    const signatureDataUrl = padRef.current.toDataURL('image/png');
    onSave({
      name: name.trim(),
      title: title.trim(),
      signatureDataUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-[#004C97] rounded-lg">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Tanda Tangan Digital</h3>
              <p className="text-xs text-slate-500">{slotTitle || 'Bubuhkan tanda tangan'}</p>
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
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Jabatan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder="Contoh: IT Project Manager Vendor"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              placeholder="Contoh: Natasya Julianti"
            />
          </div>

          {/* Signature Canvas Area */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Area Tanda Tangan <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Hapus / Ulangi
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/70 overflow-hidden h-44 cursor-crosshair">
              <canvas ref={canvasRef} className="w-full h-full touch-none" />
              {isEmpty && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                  <PenTool className="w-6 h-6 mb-1 opacity-40" />
                  <span className="text-xs">Tanda tangan di sini menggunakan mouse atau layar sentuh</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 italic">
              * Tanda tangan disimpan sebagai gambar transparan beresolusi tinggi.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#004C97] hover:bg-[#00366B] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Simpan Tanda Tangan
          </button>
        </div>
      </div>
    </div>
  );
};
