import React, { useState } from 'react';
import {
  FormDataRecord,
  HardwareRow,
  HardwareSpecRow,
  LicenseRow,
  LicensePrincipalRow,
  SoftwareAppRow,
  SoftwareOwnerRow,
  SoftwareIPRow,
  User,
} from '../types/index.js';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Eye,
  CheckCircle,
  FileText,
  Server,
  Key,
  Code2,
  PenTool,
} from 'lucide-react';
import { FormPreview1to1 } from './FormPreview1to1.js';
import { SignaturePadModal } from './SignaturePadModal.js';

interface FormWizardProps {
  initialForm?: FormDataRecord | null;
  currentUser: User;
  onSaveDraft: (formData: Partial<FormDataRecord>) => Promise<FormDataRecord | void>;
  onSubmitForm: (formData: Partial<FormDataRecord>) => Promise<void>;
  onCancel: () => void;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  initialForm,
  currentUser,
  onSaveDraft,
  onSubmitForm,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<FormDataRecord>(
    initialForm || {
      id: '',
      registrationNo: '',
      registrationDate: '',
      status: 'Draft',
      createdByUserId: currentUser.id,
      createdByUsername: currentUser.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      kodeProyekTI: '',
      kodeAplikasi: '',
      noPKSTerbaru: '',
      namaProyekTI: '',
      pihakKedua: currentUser.role === 'vendor' ? currentUser.companyOrPosition.split('/')[0].trim() : '',

      hardwareList: [
        {
          id: 'hw_1',
          no: 1,
          merk: 'N/A',
          type: 'N/A',
          serialNumber: 'N/A',
          noRak: 'N/A',
          noRakUnit: 'N/A',
          lokasi: 'N/A',
          kepemilikan: 'N/A',
          backup: 'N/A',
          jangkaWaktuMaintenance: 'N/A',
        },
      ],
      hardwareSpecList: [
        {
          id: 'spec_1',
          no: 1,
          operatingSystem: 'N/A',
          processor: 'N/A',
          ram: 'N/A',
          volumeHarddisk: 'N/A',
          softwareYangDiinstall: 'N/A',
          ipAddressHostname: 'N/A',
          tahunGoLive: 'N/A',
          eolDate: 'N/A',
          eosDate: 'N/A',
        },
      ],

      licenseList: [
        {
          id: 'lic_1',
          no: 1,
          namaLicense: '',
          deskripsiFungsiLicense: '',
          qtyLicenseYangDibeli: '',
          qtyLicenseYangDiDeploy: '',
          serialNumberSku: '',
          versionSoftware: '',
          perpetualSubscription: 'Perpetual with ATS',
        },
      ],
      licensePrincipalList: [
        {
          id: 'prn_1',
          no: 1,
          namaPrincipal: '',
          ipServer: '',
          jangkaWaktuKontrak: '',
          jangkaWaktuLicense: '',
          tahunEol: 'N/A',
          tahunEos: 'N/A',
        },
      ],

      softwareAppList: [
        {
          id: 'sw_1',
          no: 1,
          namaAplikasi: '',
          deskripsiAplikasi: '',
          jenisAplikasi: 'Application',
          kategoriServer: 'Physical',
          jenisServer: 'Development dan Production',
          loginAuth: 'User Non AD',
          platformOsVersion: '',
          eosDateOs: '',
          databaseVersion: '',
          eosDateDb: '',
        },
      ],
      softwareOwnerList: [
        {
          id: 'so_1',
          no: 1,
          divisiAppsOwnerUser: '',
          vendorPengembangAplikasi: '',
          namaPrincipal: '',
          tahunImplementasiGoLive: '',
          bahasaPemograman: '',
          kepemilikan: 'Beli Putus',
          kepemilikanSourceCode: 'Penyedia Jasa',
          prosesBisnisYangDisupport: '',
          sistemFront: 'Web',
        },
      ],
      softwareIPList: [
        {
          id: 'sip_1',
          no: 1,
          ipServerAppHostnameProduction: '',
          ipServerAppHostnameDevelopment: '',
          backupServerApp: 'Schedule',
          ipServerDbHostnameProduction: '',
          ipServerDbHostnameDevelopment: '',
          backupServerDb: 'Realtime',
        },
      ],

      disusunOleh: {
        key: 'vendor_prep',
        title: 'IT Project Manager Vendor',
        name: currentUser.role === 'vendor' ? currentUser.fullName : '',
        date: '',
        signatureDataUrl: '',
      },
      diverifikasiOleh: [
        { key: 'div_pm_btn', title: 'IT Project Manager BTN', name: '', date: '' },
        { key: 'div_qa', title: 'IT Quality Assurance', name: '', date: '' },
        { key: 'div_arch', title: 'Technology Architecture Specialist', name: '', date: '' },
        { key: 'div_cmdb', title: 'IT Asset Compliance & CMDB Specialist', name: '', date: '' },
      ],
      disetujuiOleh: [
        { key: 'appr_pm_dh', title: 'Department Head of IT Project Management', name: '', date: '' },
        { key: 'appr_qa_dh', title: 'Department Head of IT Quality Assurance', name: '', date: '' },
        { key: 'appr_ea_dh', title: 'Department Head of Enterprise Architecture & Innovation', name: '', date: '' },
        { key: 'appr_asset_dh', title: 'Department Head of IT Asset Management', name: '', date: '' },
      ],
      attachments: [],
    }
  );

  const steps = [
    { num: 1, label: 'Info Proyek & Hardware', icon: Server },
    { num: 2, label: 'License & Principal', icon: Key },
    { num: 3, label: 'Software & Arsitektur', icon: Code2 },
    { num: 4, label: 'Tanda Tangan Vendor', icon: PenTool },
    { num: 5, label: 'Pratinjau & Submit', icon: CheckCircle },
  ];

  // Hardware Rows
  const addHardwareRow = () => {
    const newRow: HardwareRow = {
      id: `hw_${Date.now()}`,
      no: formData.hardwareList.length + 1,
      merk: '',
      type: '',
      serialNumber: '',
      noRak: '',
      noRakUnit: '',
      lokasi: '',
      kepemilikan: 'Sewa',
      backup: 'Schedule',
      jangkaWaktuMaintenance: '',
    };
    setFormData({ ...formData, hardwareList: [...formData.hardwareList, newRow] });
  };

  const removeHardwareRow = (index: number) => {
    const list = formData.hardwareList.filter((_, i) => i !== index);
    setFormData({ ...formData, hardwareList: list });
  };

  const addHardwareSpecRow = () => {
    const newRow: HardwareSpecRow = {
      id: `spec_${Date.now()}`,
      no: formData.hardwareSpecList.length + 1,
      operatingSystem: '',
      processor: '',
      ram: '',
      volumeHarddisk: '',
      softwareYangDiinstall: '',
      ipAddressHostname: '',
      tahunGoLive: '',
      eolDate: 'N/A',
      eosDate: 'N/A',
    };
    setFormData({ ...formData, hardwareSpecList: [...formData.hardwareSpecList, newRow] });
  };

  const removeHardwareSpecRow = (index: number) => {
    const list = formData.hardwareSpecList.filter((_, i) => i !== index);
    setFormData({ ...formData, hardwareSpecList: list });
  };

  // License Rows
  const addLicenseRow = () => {
    const newRow: LicenseRow = {
      id: `lic_${Date.now()}`,
      no: formData.licenseList.length + 1,
      namaLicense: '',
      deskripsiFungsiLicense: '',
      qtyLicenseYangDibeli: '',
      qtyLicenseYangDiDeploy: '',
      serialNumberSku: '',
      versionSoftware: '',
      perpetualSubscription: 'Perpetual with ATS',
    };
    setFormData({ ...formData, licenseList: [...formData.licenseList, newRow] });
  };

  const removeLicenseRow = (index: number) => {
    const list = formData.licenseList.filter((_, i) => i !== index);
    setFormData({ ...formData, licenseList: list });
  };

  const addPrincipalRow = () => {
    const newRow: LicensePrincipalRow = {
      id: `prn_${Date.now()}`,
      no: formData.licensePrincipalList.length + 1,
      namaPrincipal: '',
      ipServer: '',
      jangkaWaktuKontrak: '',
      jangkaWaktuLicense: '',
      tahunEol: 'N/A',
      tahunEos: 'N/A',
    };
    setFormData({ ...formData, licensePrincipalList: [...formData.licensePrincipalList, newRow] });
  };

  const removePrincipalRow = (index: number) => {
    const list = formData.licensePrincipalList.filter((_, i) => i !== index);
    setFormData({ ...formData, licensePrincipalList: list });
  };

  // Software Rows
  const addSoftwareRow = () => {
    const idx = formData.softwareAppList.length + 1;
    const newApp: SoftwareAppRow = {
      id: `sw_${Date.now()}`,
      no: idx,
      namaAplikasi: '',
      deskripsiAplikasi: '',
      jenisAplikasi: 'Application',
      kategoriServer: 'Physical',
      jenisServer: 'Development dan Production',
      loginAuth: 'User Non AD',
      platformOsVersion: '',
      eosDateOs: '',
      databaseVersion: '',
      eosDateDb: '',
    };
    const newOwner: SoftwareOwnerRow = {
      id: `so_${Date.now()}`,
      no: idx,
      divisiAppsOwnerUser: '',
      vendorPengembangAplikasi: formData.pihakKedua || '',
      namaPrincipal: '',
      tahunImplementasiGoLive: '',
      bahasaPemograman: '',
      kepemilikan: 'Beli Putus',
      kepemilikanSourceCode: 'Penyedia Jasa',
      prosesBisnisYangDisupport: '',
      sistemFront: 'Web',
    };
    const newIP: SoftwareIPRow = {
      id: `sip_${Date.now()}`,
      no: idx,
      ipServerAppHostnameProduction: '',
      ipServerAppHostnameDevelopment: '',
      backupServerApp: 'Schedule',
      ipServerDbHostnameProduction: '',
      ipServerDbHostnameDevelopment: '',
      backupServerDb: 'Realtime',
    };
    setFormData({
      ...formData,
      softwareAppList: [...formData.softwareAppList, newApp],
      softwareOwnerList: [...formData.softwareOwnerList, newOwner],
      softwareIPList: [...formData.softwareIPList, newIP],
    });
  };

  const removeSoftwareRow = (index: number) => {
    setFormData({
      ...formData,
      softwareAppList: formData.softwareAppList.filter((_, i) => i !== index),
      softwareOwnerList: formData.softwareOwnerList.filter((_, i) => i !== index),
      softwareIPList: formData.softwareIPList.filter((_, i) => i !== index),
    });
  };

  const handleSaveDraftClick = async () => {
    setIsSaving(true);
    try {
      const res = await onSaveDraft(formData);
      if (res && res.id) {
        setFormData((prev) => ({ ...prev, id: res.id, registrationNo: res.registrationNo }));
      }
      alert('Draft formulir berhasil disimpan.');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitClick = async () => {
    // Validation
    if (!formData.kodeProyekTI.trim()) {
      alert('Kode Proyek TI wajib diisi.');
      setCurrentStep(1);
      return;
    }
    if (!formData.namaProyekTI.trim()) {
      alert('Nama Proyek TI wajib diisi.');
      setCurrentStep(1);
      return;
    }
    if (!formData.pihakKedua.trim()) {
      alert('PIHAK KEDUA (Nama Vendor) wajib diisi.');
      setCurrentStep(1);
      return;
    }
    if (!formData.disusunOleh?.name || !formData.disusunOleh?.signatureDataUrl) {
      alert('Vendor wajib mengisi nama dan membubuhkan tanda tangan di bagian "Disusun Oleh" (Langkah 4).');
      setCurrentStep(4);
      return;
    }

    if (
      !confirm(
        'Apakah Anda yakin data sudah lengkap dan siap disubmit? Setelah disubmit, form akan dikirim ke manajemen BTN untuk diverifikasi dan notifikasi WhatsApp akan dikirimkan.'
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      await onSubmitForm(formData);
    } catch (err) {
      console.error(err);
      alert('Gagal mensubmit formulir.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#004C97]">
              WIZARD FORMULIR
            </span>
            <span className="text-xs text-slate-400">
              {formData.registrationNo || 'No. Registrasi Otomatis'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            {formData.namaProyekTI || 'Formulir Dokumentasi Aset Proyek TI'}
          </h2>
          <p className="text-xs text-slate-500">
            Sesuai format resmi Bank BTN A4 Landscape 1:1
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
              previewMode
                ? 'bg-[#004C97] text-white border-[#004C97]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Kembali ke Editor' : 'Pratinjau Live 1:1'}
          </button>

          <button
            type="button"
            onClick={handleSaveDraftClick}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
          </button>

          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Submit ke BTN
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium"
          >
            Kembali
          </button>
        </div>
      </div>

      {/* Step Indicator Tabs */}
      {!previewMode && (
        <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {steps.map((st) => {
              const Icon = st.icon;
              const isActive = currentStep === st.num;
              const isPast = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setCurrentStep(st.num)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-blue-50 border-2 border-[#004C97] text-[#004C97]'
                      : isPast
                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive
                        ? 'bg-[#004C97] text-white'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : st.num}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                      Langkah {st.num}
                    </div>
                    <div className="text-xs font-bold truncate">{st.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Preview Mode Display */}
      {previewMode ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex justify-between items-center">
            <span>
              <strong>Mode Pratinjau Dokumen 1:1:</strong> Tampilan ini persis seperti yang akan diekspor ke PDF dan dicetak di kertas landscape A4.
            </span>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-[#004C97] text-white font-bold rounded-lg hover:bg-[#00366B]"
            >
              Cetak / Simpan PDF
            </button>
          </div>
          <FormPreview1to1 form={formData} />
        </div>
      ) : (
        /* Wizard Steps Content */
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
          {/* STEP 1: INFO PROYEK & HARDWARE */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-200">
                  Informasi Proyek TI
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kode Proyek TI <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.kodeProyekTI}
                      onChange={(e) => setFormData({ ...formData, kodeProyekTI: e.target.value })}
                      placeholder="Contoh: 2440583509OU"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kode Aplikasi
                    </label>
                    <input
                      type="text"
                      value={formData.kodeAplikasi}
                      onChange={(e) => setFormData({ ...formData, kodeAplikasi: e.target.value })}
                      placeholder="Contoh: CASH"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      No PKS Terbaru
                    </label>
                    <input
                      type="text"
                      value={formData.noPKSTerbaru}
                      onChange={(e) => setFormData({ ...formData, noPKSTerbaru: e.target.value })}
                      placeholder="Contoh: 161/PKS/ITPD/2023"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PIHAK KEDUA (Nama Vendor) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pihakKedua}
                      onChange={(e) => setFormData({ ...formData, pihakKedua: e.target.value })}
                      placeholder="Contoh: PT. Wide Technologies Indonesia"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Proyek TI <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.namaProyekTI}
                      onChange={(e) => setFormData({ ...formData, namaProyekTI: e.target.value })}
                      placeholder="Contoh: Order Penggunaan Kontrak Payung Mandays Pengembangan IB dan CMS 2023-2024 – Pengembangan CMS Bill Payment Pegadaian"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 1. HARDWARE TABLES */}
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">1. HARDWARE</h3>
                    <p className="text-xs text-slate-500">
                      Jika proyek tidak menggunakan hardware khusus, biarkan baris terisi "N/A" (aturan N/A BTN).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addHardwareRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#004C97] hover:bg-blue-100 rounded-lg text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" /> Tambah Baris Hardware
                  </button>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1F4E79] text-white">
                        <th className="p-2 border border-[#7F7F7F] w-10">No</th>
                        <th className="p-2 border border-[#7F7F7F]">Merk</th>
                        <th className="p-2 border border-[#7F7F7F]">Type</th>
                        <th className="p-2 border border-[#7F7F7F]">Serial Number</th>
                        <th className="p-2 border border-[#7F7F7F]">No. Rak</th>
                        <th className="p-2 border border-[#7F7F7F]">No. Rak Unit</th>
                        <th className="p-2 border border-[#7F7F7F]">Lokasi</th>
                        <th className="p-2 border border-[#7F7F7F]">Kepemilikan</th>
                        <th className="p-2 border border-[#7F7F7F]">Backup</th>
                        <th className="p-2 border border-[#7F7F7F]">Jangka Waktu Maint.</th>
                        <th className="p-2 border border-[#7F7F7F] w-10">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.hardwareList.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-1 border border-[#7F7F7F] text-center font-bold">
                            {i + 1}
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.merk}
                              onChange={(e) => {
                                const list = [...formData.hardwareList];
                                list[i].merk = e.target.value;
                                setFormData({ ...formData, hardwareList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.type}
                              onChange={(e) => {
                                const list = [...formData.hardwareList];
                                list[i].type = e.target.value;
                                setFormData({ ...formData, hardwareList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.serialNumber}
                              onChange={(e) => {
                                const list = [...formData.hardwareList];
                                list[i].serialNumber = e.target.value;
                                setFormData({ ...formData, hardwareList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded font-mono"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.noRak}
                              onChange={(e) => {
                                const list = [...formData.hardwareList];
                                list[i].noRak = e.target.value;
                                setFormData({ ...formData, hardwareList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.noRakUnit}
                              onChange={(e) => {
                                const list = [...formData.hardwareList];
                                list[i].noRakUnit = e.target.value;
                                setFormData({ ...formData, hardwareList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.lokasi}
                              onChange={(e) => {
                                const list = [...formData.hardwareList];
                                list[i].lokasi = e.target.value;
                                setFormData({ ...formData, hardwareList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <select
                              value={r.kepemilikan}
                              onChange={(e) => {
                                const list = [...formData.hardwareList];
                                list[i].kepemilikan = e.target.value;
                                setFormData({ ...formData, hardwareList: list });
                              }}
                              className="w-full px-1 py-1 text-xs border border-slate-200 rounded"
                            >
                              <option value="Sewa">Sewa</option>
                              <option value="Milik BTN">Milik BTN</option>
                              <option value="N/A">N/A</option>
                            </select>
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <select
                              value={r.backup}
                              onChange={(e) => {
                                const list = [...formData.hardwareList];
                                list[i].backup = e.target.value;
                                setFormData({ ...formData, hardwareList: list });
                              }}
                              className="w-full px-1 py-1 text-xs border border-slate-200 rounded"
                            >
                              <option value="Realtime">Realtime</option>
                              <option value="Schedule">Schedule</option>
                              <option value="NA">NA</option>
                              <option value="N/A">N/A</option>
                            </select>
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.jangkaWaktuMaintenance}
                              onChange={(e) => {
                                const list = [...formData.hardwareList];
                                list[i].jangkaWaktuMaintenance = e.target.value;
                                setFormData({ ...formData, hardwareList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F] text-center">
                            <button
                              type="button"
                              onClick={() => removeHardwareRow(i)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Specs Table */}
                <div className="flex justify-between items-center mt-6 mb-2">
                  <h4 className="font-bold text-xs text-slate-700">Tabel Spesifikasi Hardware</h4>
                  <button
                    type="button"
                    onClick={addHardwareSpecRow}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris Spesifikasi
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1F4E79] text-white">
                        <th className="p-2 border border-[#7F7F7F] w-10">No</th>
                        <th className="p-2 border border-[#7F7F7F]">OS</th>
                        <th className="p-2 border border-[#7F7F7F]">Processor</th>
                        <th className="p-2 border border-[#7F7F7F]">RAM</th>
                        <th className="p-2 border border-[#7F7F7F]">Volume Harddisk</th>
                        <th className="p-2 border border-[#7F7F7F]">Software Diinstall</th>
                        <th className="p-2 border border-[#7F7F7F]">IP Address & Hostname</th>
                        <th className="p-2 border border-[#7F7F7F]">Tahun Go Live</th>
                        <th className="p-2 border border-[#7F7F7F]">EoL Date</th>
                        <th className="p-2 border border-[#7F7F7F]">EOS Date</th>
                        <th className="p-2 border border-[#7F7F7F] w-10">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.hardwareSpecList.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-1 border border-[#7F7F7F] text-center font-bold">
                            {i + 1}
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.operatingSystem}
                              onChange={(e) => {
                                const list = [...formData.hardwareSpecList];
                                list[i].operatingSystem = e.target.value;
                                setFormData({ ...formData, hardwareSpecList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.processor}
                              onChange={(e) => {
                                const list = [...formData.hardwareSpecList];
                                list[i].processor = e.target.value;
                                setFormData({ ...formData, hardwareSpecList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.ram}
                              onChange={(e) => {
                                const list = [...formData.hardwareSpecList];
                                list[i].ram = e.target.value;
                                setFormData({ ...formData, hardwareSpecList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.volumeHarddisk}
                              onChange={(e) => {
                                const list = [...formData.hardwareSpecList];
                                list[i].volumeHarddisk = e.target.value;
                                setFormData({ ...formData, hardwareSpecList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.softwareYangDiinstall}
                              onChange={(e) => {
                                const list = [...formData.hardwareSpecList];
                                list[i].softwareYangDiinstall = e.target.value;
                                setFormData({ ...formData, hardwareSpecList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.ipAddressHostname}
                              onChange={(e) => {
                                const list = [...formData.hardwareSpecList];
                                list[i].ipAddressHostname = e.target.value;
                                setFormData({ ...formData, hardwareSpecList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded font-mono"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.tahunGoLive}
                              onChange={(e) => {
                                const list = [...formData.hardwareSpecList];
                                list[i].tahunGoLive = e.target.value;
                                setFormData({ ...formData, hardwareSpecList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.eolDate}
                              onChange={(e) => {
                                const list = [...formData.hardwareSpecList];
                                list[i].eolDate = e.target.value;
                                setFormData({ ...formData, hardwareSpecList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.eosDate}
                              onChange={(e) => {
                                const list = [...formData.hardwareSpecList];
                                list[i].eosDate = e.target.value;
                                setFormData({ ...formData, hardwareSpecList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F] text-center">
                            <button
                              type="button"
                              onClick={() => removeHardwareSpecRow(i)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LICENSE & PRINCIPAL */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">2. LICENSE (Tabel Lisensi)</h3>
                    <p className="text-xs text-slate-500">
                      Kolom Qty License mendukung multi-baris (contoh: Primecash Corporate: 2 / Primecash Individual: 2)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addLicenseRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#004C97] hover:bg-blue-100 rounded-lg text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" /> Tambah Baris License
                  </button>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1F4E79] text-white">
                        <th className="p-2 border border-[#7F7F7F] w-10">No</th>
                        <th className="p-2 border border-[#7F7F7F]">Nama License</th>
                        <th className="p-2 border border-[#7F7F7F]">Deskripsi Fungsi</th>
                        <th className="p-2 border border-[#7F7F7F]">Qty Dibeli</th>
                        <th className="p-2 border border-[#7F7F7F]">Qty Di Deploy</th>
                        <th className="p-2 border border-[#7F7F7F]">Serial / SKU</th>
                        <th className="p-2 border border-[#7F7F7F]">Version</th>
                        <th className="p-2 border border-[#7F7F7F]">Perpetual/Subscr.</th>
                        <th className="p-2 border border-[#7F7F7F] w-10">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.licenseList.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-1 border border-[#7F7F7F] text-center font-bold">
                            {i + 1}
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.namaLicense}
                              onChange={(e) => {
                                const list = [...formData.licenseList];
                                list[i].namaLicense = e.target.value;
                                setFormData({ ...formData, licenseList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded font-medium"
                              placeholder="Primecash License DC"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <textarea
                              rows={2}
                              value={r.deskripsiFungsiLicense}
                              onChange={(e) => {
                                const list = [...formData.licenseList];
                                list[i].deskripsiFungsiLicense = e.target.value;
                                setFormData({ ...formData, licenseList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <textarea
                              rows={2}
                              value={r.qtyLicenseYangDibeli}
                              onChange={(e) => {
                                const list = [...formData.licenseList];
                                list[i].qtyLicenseYangDibeli = e.target.value;
                                setFormData({ ...formData, licenseList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <textarea
                              rows={2}
                              value={r.qtyLicenseYangDiDeploy}
                              onChange={(e) => {
                                const list = [...formData.licenseList];
                                list[i].qtyLicenseYangDiDeploy = e.target.value;
                                setFormData({ ...formData, licenseList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.serialNumberSku}
                              onChange={(e) => {
                                const list = [...formData.licenseList];
                                list[i].serialNumberSku = e.target.value;
                                setFormData({ ...formData, licenseList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded font-mono"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.versionSoftware}
                              onChange={(e) => {
                                const list = [...formData.licenseList];
                                list[i].versionSoftware = e.target.value;
                                setFormData({ ...formData, licenseList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.perpetualSubscription}
                              onChange={(e) => {
                                const list = [...formData.licenseList];
                                list[i].perpetualSubscription = e.target.value;
                                setFormData({ ...formData, licenseList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F] text-center">
                            <button
                              type="button"
                              onClick={() => removeLicenseRow(i)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Principal Table */}
                <div className="flex justify-between items-center mt-8 mb-2 pb-2 border-b border-slate-200">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Tabel Principal & IP Server</h4>
                    <p className="text-xs text-slate-500">
                      IP Server multi-baris untuk list node/IP
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addPrincipalRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#004C97] hover:bg-blue-100 rounded-lg text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" /> Tambah Baris Principal
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1F4E79] text-white">
                        <th className="p-2 border border-[#7F7F7F] w-10">No.</th>
                        <th className="p-2 border border-[#7F7F7F]">Nama Principal</th>
                        <th className="p-2 border border-[#7F7F7F]">IP Server</th>
                        <th className="p-2 border border-[#7F7F7F]">Jangka Waktu Kontrak</th>
                        <th className="p-2 border border-[#7F7F7F]">Jangka Waktu License</th>
                        <th className="p-2 border border-[#7F7F7F]">Tahun EOL</th>
                        <th className="p-2 border border-[#7F7F7F]">Tahun EOS</th>
                        <th className="p-2 border border-[#7F7F7F] w-10">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.licensePrincipalList.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-1 border border-[#7F7F7F] text-center font-bold">
                            {i + 1}
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.namaPrincipal}
                              onChange={(e) => {
                                const list = [...formData.licensePrincipalList];
                                list[i].namaPrincipal = e.target.value;
                                setFormData({ ...formData, licensePrincipalList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded font-medium"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <textarea
                              rows={3}
                              value={r.ipServer}
                              onChange={(e) => {
                                const list = [...formData.licensePrincipalList];
                                list[i].ipServer = e.target.value;
                                setFormData({ ...formData, licensePrincipalList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded font-mono"
                              placeholder="172.17.5.6&#10;172.17.5.7"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.jangkaWaktuKontrak}
                              onChange={(e) => {
                                const list = [...formData.licensePrincipalList];
                                list[i].jangkaWaktuKontrak = e.target.value;
                                setFormData({ ...formData, licensePrincipalList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.jangkaWaktuLicense}
                              onChange={(e) => {
                                const list = [...formData.licensePrincipalList];
                                list[i].jangkaWaktuLicense = e.target.value;
                                setFormData({ ...formData, licensePrincipalList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.tahunEol}
                              onChange={(e) => {
                                const list = [...formData.licensePrincipalList];
                                list[i].tahunEol = e.target.value;
                                setFormData({ ...formData, licensePrincipalList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F]">
                            <input
                              type="text"
                              value={r.tahunEos}
                              onChange={(e) => {
                                const list = [...formData.licensePrincipalList];
                                list[i].tahunEos = e.target.value;
                                setFormData({ ...formData, licensePrincipalList: list });
                              }}
                              className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-1 border border-[#7F7F7F] text-center">
                            <button
                              type="button"
                              onClick={() => removePrincipalRow(i)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SOFTWARE & ARSITEKTUR */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-800">3. SOFTWARE*</h3>
                  <p className="text-xs text-slate-500">
                    Spesifikasi Aplikasi, Ownership, dan IP Server Arsitektur (DC/DRC)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSoftwareRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#004C97] hover:bg-blue-100 rounded-lg text-xs font-bold"
                >
                  <Plus className="w-4 h-4" /> Tambah Aplikasi
                </button>
              </div>

              {/* Loop over software items */}
              {formData.softwareAppList.map((app, i) => {
                const owner = formData.softwareOwnerList[i] || {};
                const ip = formData.softwareIPList[i] || {};

                return (
                  <div
                    key={app.id || i}
                    className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-5"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-sm text-slate-800">
                        Aplikasi #{i + 1}: {app.namaAplikasi || 'Aplikasi Baru'}
                      </span>
                      {formData.softwareAppList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSoftwareRow(i)}
                          className="flex items-center gap-1 text-xs text-rose-600 hover:underline"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus Aplikasi #{i + 1}
                        </button>
                      )}
                    </div>

                    {/* Tabel A Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Nama Aplikasi
                        </label>
                        <input
                          type="text"
                          value={app.namaAplikasi}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].namaAplikasi = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          placeholder="Bale Korpora"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-medium"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Deskripsi Aplikasi
                        </label>
                        <textarea
                          rows={2}
                          value={app.deskripsiAplikasi}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].deskripsiAplikasi = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Jenis Aplikasi
                        </label>
                        <select
                          value={app.jenisAplikasi}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].jenisAplikasi = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                        >
                          <option value="Application">Application</option>
                          <option value="Appliance">Appliance</option>
                          <option value="Tools">Tools</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Kategori Server
                        </label>
                        <select
                          value={app.kategoriServer}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].kategoriServer = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                        >
                          <option value="Physical">Physical</option>
                          <option value="Virtual">Virtual</option>
                          <option value="Cloud">Cloud</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Jenis Server
                        </label>
                        <select
                          value={app.jenisServer}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].jenisServer = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                        >
                          <option value="Development dan Production">Development dan Production</option>
                          <option value="Prod">Prod</option>
                          <option value="Dev">Dev</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Login Auth
                        </label>
                        <select
                          value={app.loginAuth}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].loginAuth = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                        >
                          <option value="User Non AD">User Non AD</option>
                          <option value="User AD">User AD</option>
                          <option value="Non AD">Non AD</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Platform / OS Version
                        </label>
                        <input
                          type="text"
                          value={app.platformOsVersion}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].platformOsVersion = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          placeholder="Redhat Enterprise Linux 8.10"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          EoS Date OS
                        </label>
                        <input
                          type="text"
                          value={app.eosDateOs}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].eosDateOs = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          placeholder="31 May 2029"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Database Version
                        </label>
                        <input
                          type="text"
                          value={app.databaseVersion}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].databaseVersion = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          placeholder="Oracle Database 19c"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          EoS Date DB
                        </label>
                        <input
                          type="text"
                          value={app.eosDateDb}
                          onChange={(e) => {
                            const list = [...formData.softwareAppList];
                            list[i].eosDateDb = e.target.value;
                            setFormData({ ...formData, softwareAppList: list });
                          }}
                          placeholder="31 Dec 2032"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                        />
                      </div>
                    </div>

                    {/* Tabel B: Ownership */}
                    <div className="pt-3 border-t border-slate-200">
                      <h5 className="font-bold text-xs text-slate-700 mb-2">
                        Tabel B: Ownership & Bahasa Pemrograman
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Divisi Apps Owner / User
                          </label>
                          <input
                            type="text"
                            value={owner.divisiAppsOwnerUser || ''}
                            onChange={(e) => {
                              const list = [...formData.softwareOwnerList];
                              list[i].divisiAppsOwnerUser = e.target.value;
                              setFormData({ ...formData, softwareOwnerList: list });
                            }}
                            placeholder="WTD"
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Vendor Pengembang
                          </label>
                          <input
                            type="text"
                            value={owner.vendorPengembangAplikasi || ''}
                            onChange={(e) => {
                              const list = [...formData.softwareOwnerList];
                              list[i].vendorPengembangAplikasi = e.target.value;
                              setFormData({ ...formData, softwareOwnerList: list });
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Nama Principal (*) Jika Ada
                          </label>
                          <input
                            type="text"
                            value={owner.namaPrincipal || ''}
                            onChange={(e) => {
                              const list = [...formData.softwareOwnerList];
                              list[i].namaPrincipal = e.target.value;
                              setFormData({ ...formData, softwareOwnerList: list });
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Tahun Implementasi
                          </label>
                          <input
                            type="text"
                            value={owner.tahunImplementasiGoLive || ''}
                            onChange={(e) => {
                              const list = [...formData.softwareOwnerList];
                              list[i].tahunImplementasiGoLive = e.target.value;
                              setFormData({ ...formData, softwareOwnerList: list });
                            }}
                            placeholder="2025"
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Bahasa Pemrograman
                          </label>
                          <input
                            type="text"
                            value={owner.bahasaPemograman || ''}
                            onChange={(e) => {
                              const list = [...formData.softwareOwnerList];
                              list[i].bahasaPemograman = e.target.value;
                              setFormData({ ...formData, softwareOwnerList: list });
                            }}
                            placeholder="JDK 1.8"
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Kepemilikan
                          </label>
                          <select
                            value={owner.kepemilikan || 'Beli Putus'}
                            onChange={(e) => {
                              const list = [...formData.softwareOwnerList];
                              list[i].kepemilikan = e.target.value;
                              setFormData({ ...formData, softwareOwnerList: list });
                            }}
                            className="w-full px-1.5 py-1 text-xs border border-slate-300 rounded"
                          >
                            <option value="Beli Putus">Beli Putus</option>
                            <option value="Sewa">Sewa</option>
                            <option value="Hak Penggunaan">Hak Penggunaan</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Kepemilikan Source Code
                          </label>
                          <select
                            value={owner.kepemilikanSourceCode || 'Penyedia Jasa'}
                            onChange={(e) => {
                              const list = [...formData.softwareOwnerList];
                              list[i].kepemilikanSourceCode = e.target.value;
                              setFormData({ ...formData, softwareOwnerList: list });
                            }}
                            className="w-full px-1.5 py-1 text-xs border border-slate-300 rounded"
                          >
                            <option value="Penyedia Jasa">Penyedia Jasa</option>
                            <option value="BTN">BTN</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Sistem Front
                          </label>
                          <select
                            value={owner.sistemFront || 'Web'}
                            onChange={(e) => {
                              const list = [...formData.softwareOwnerList];
                              list[i].sistemFront = e.target.value;
                              setFormData({ ...formData, softwareOwnerList: list });
                            }}
                            className="w-full px-1.5 py-1 text-xs border border-slate-300 rounded"
                          >
                            <option value="Web">Web</option>
                            <option value="Dekstop">Dekstop</option>
                            <option value="Mobile">Mobile</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Tabel C: Server IP & Hostname */}
                    <div className="pt-3 border-t border-slate-200">
                      <h5 className="font-bold text-xs text-slate-700 mb-2">
                        Tabel C: Arsitektur Server IP & Hostname (Multi-baris)
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            IP Server App / Hostname Production (DC / DRC / Node 1..N)
                          </label>
                          <textarea
                            rows={6}
                            value={ip.ipServerAppHostnameProduction || ''}
                            onChange={(e) => {
                              const list = [...formData.softwareIPList];
                              list[i].ipServerAppHostnameProduction = e.target.value;
                              setFormData({ ...formData, softwareIPList: list });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                            placeholder="DC&#10;Web Production :&#10;172.17.4.6 (Node1)&#10;App Production :&#10;172.17.5.6 (Node1)&#10;&#10;DRC&#10;Web Production :&#10;172.19.4.6 (Node1)"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            IP Server DB / Hostname Production
                          </label>
                          <textarea
                            rows={6}
                            value={ip.ipServerDbHostnameProduction || ''}
                            onChange={(e) => {
                              const list = [...formData.softwareIPList];
                              list[i].ipServerDbHostnameProduction = e.target.value;
                              setFormData({ ...formData, softwareIPList: list });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                            placeholder="DB Production DC&#10;172.17.3.6 (Node1)&#10;&#10;DB Production DRC&#10;172.17.3.6 (Node1)"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            IP Server App Development
                          </label>
                          <textarea
                            rows={3}
                            value={ip.ipServerAppHostnameDevelopment || ''}
                            onChange={(e) => {
                              const list = [...formData.softwareIPList];
                              list[i].ipServerAppHostnameDevelopment = e.target.value;
                              setFormData({ ...formData, softwareIPList: list });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                            placeholder="172.16.2.205 (DC)"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            IP Server DB Development
                          </label>
                          <textarea
                            rows={3}
                            value={ip.ipServerDbHostnameDevelopment || ''}
                            onChange={(e) => {
                              const list = [...formData.softwareIPList];
                              list[i].ipServerDbHostnameDevelopment = e.target.value;
                              setFormData({ ...formData, softwareIPList: list });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                            placeholder="DB Development :&#10;172.16.2.205 (DC)"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Backup Server App
                          </label>
                          <select
                            value={ip.backupServerApp || 'Schedule'}
                            onChange={(e) => {
                              const list = [...formData.softwareIPList];
                              list[i].backupServerApp = e.target.value;
                              setFormData({ ...formData, softwareIPList: list });
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                          >
                            <option value="Schedule">Schedule</option>
                            <option value="Realtime">Realtime</option>
                            <option value="NA">NA</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Backup Server DB
                          </label>
                          <select
                            value={ip.backupServerDb || 'Realtime'}
                            onChange={(e) => {
                              const list = [...formData.softwareIPList];
                              list[i].backupServerDb = e.target.value;
                              setFormData({ ...formData, softwareIPList: list });
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                          >
                            <option value="Realtime">Realtime</option>
                            <option value="Schedule">Schedule</option>
                            <option value="NA">NA</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 4: TANDA TANGAN VENDOR (Disusun Oleh) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="pb-2 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-800">
                  Langkah 4: Tanda Tangan Vendor ("Disusun Oleh")
                </h3>
                <p className="text-xs text-slate-500">
                  Sebagai vendor pembuat dokumen, Anda wajib mengisi nama, jabatan, dan tanda tangan Draw Sign.
                </p>
              </div>

              <div className="max-w-xl mx-auto p-6 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/30 text-center space-y-4">
                <div className="inline-flex p-3 bg-blue-100 text-[#004C97] rounded-full">
                  <PenTool className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Slot Penandatangan: {formData.disusunOleh?.title || 'IT Project Manager Vendor'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Nama: <strong>{formData.disusunOleh?.name || '(Belum diisi)'}</strong>
                  </p>
                </div>

                {formData.disusunOleh?.signatureDataUrl ? (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl max-w-xs mx-auto">
                    <img
                      src={formData.disusunOleh.signatureDataUrl}
                      alt="Signature"
                      className="h-16 mx-auto object-contain"
                    />
                    <div className="text-[11px] text-emerald-700 font-bold mt-2">
                      ✓ Tanda tangan tersimpan
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-xs text-slate-400">
                    Belum ada tanda tangan. Klik tombol di bawah untuk membuat tanda tangan.
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(true)}
                  className="px-6 py-2.5 bg-[#004C97] hover:bg-[#00366B] text-white font-bold text-sm rounded-xl shadow-xs"
                >
                  {formData.disusunOleh?.signatureDataUrl
                    ? 'Ubah Tanda Tangan'
                    : 'Buat Tanda Tangan Sekarang'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & PREVIEW */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="pb-2 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Langkah 5: Ringkasan & Siap Submit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pastikan seluruh informasi telah sesuai. Anda dapat melihat pratinjau live sebelum submit.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className="px-4 py-2 border border-[#004C97] text-[#004C97] hover:bg-blue-50 rounded-xl text-xs font-bold"
                >
                  Buka Full Pratinjau 1:1
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-700">Ringkasan Proyek:</div>
                  <div>Kode Proyek: <strong>{formData.kodeProyekTI || '-'}</strong></div>
                  <div>Kode Aplikasi: <strong>{formData.kodeAplikasi || '-'}</strong></div>
                  <div>Nama Proyek: <strong>{formData.namaProyekTI || '-'}</strong></div>
                  <div>Vendor: <strong>{formData.pihakKedua || '-'}</strong></div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-700">Status Kelengkapan:</div>
                  <div>Baris Hardware: <strong>{formData.hardwareList.length}</strong></div>
                  <div>Baris Lisensi: <strong>{formData.licenseList.length}</strong></div>
                  <div>Aplikasi Software: <strong>{formData.softwareAppList.length}</strong></div>
                  <div>
                    Tanda Tangan Disusun Oleh:{' '}
                    {formData.disusunOleh?.signatureDataUrl ? (
                      <span className="text-emerald-700 font-bold">Lengkap</span>
                    ) : (
                      <span className="text-rose-600 font-bold">Belum Tanda Tangan</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <strong>Catatan Pengiriman:</strong> Saat Anda menekan tombol "Submit ke BTN", status form akan berubah menjadi <strong>On Going</strong> dan sistem akan mengirimkan notifikasi otomatis ke nomor WhatsApp Superadmin & PIC Manajemen BTN melalui gateway Fonnte.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 mt-8 border-t border-slate-200">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Langkah Sebelumnya
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-[#004C97] hover:bg-[#00366B] rounded-xl shadow-xs cursor-pointer"
              >
                Langkah Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitClick}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Submit Formulir ke BTN
              </button>
            )}
          </div>
        </div>
      )}

      {/* Signature Pad Modal for Vendor "Disusun Oleh" */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={(data) => {
          setFormData({
            ...formData,
            disusunOleh: {
              ...formData.disusunOleh,
              name: data.name,
              title: data.title || 'IT Project Manager Vendor',
              signatureDataUrl: data.signatureDataUrl,
              date: new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date()),
            },
          });
        }}
        initialName={formData.disusunOleh?.name || currentUser.fullName}
        initialTitle={formData.disusunOleh?.title || 'IT Project Manager Vendor'}
        slotTitle="Disusun Oleh - IT Project Manager Vendor"
      />
    </div>
  );
};
