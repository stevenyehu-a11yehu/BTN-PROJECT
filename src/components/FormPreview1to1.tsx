import React from 'react';
import { FormDataRecord } from '../types/index.js';

interface FormPreviewProps {
  form: FormDataRecord;
  zoom?: number;
}

export const FormPreview1to1: React.FC<FormPreviewProps> = ({ form, zoom = 1 }) => {
  const sanitize = (val?: string) => {
    if (!val || val.trim() === '') return 'N/A';
    return val;
  };

  const renderMultiLine = (val?: string) => {
    const text = sanitize(val);
    if (text === 'N/A') return 'N/A';
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // N/A Fallback arrays if tables are empty
  const hwRows =
    form.hardwareList && form.hardwareList.length > 0
      ? form.hardwareList
      : [
          {
            id: '1',
            no: 'N/A',
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
        ];

  const specRows =
    form.hardwareSpecList && form.hardwareSpecList.length > 0
      ? form.hardwareSpecList
      : [
          {
            id: '1',
            no: 'N/A',
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
        ];

  const licRows =
    form.licenseList && form.licenseList.length > 0
      ? form.licenseList
      : [
          {
            id: '1',
            no: 'N/A',
            namaLicense: 'N/A',
            deskripsiFungsiLicense: 'N/A',
            qtyLicenseYangDibeli: 'N/A',
            qtyLicenseYangDiDeploy: 'N/A',
            serialNumberSku: 'N/A',
            versionSoftware: 'N/A',
            perpetualSubscription: 'N/A',
          },
        ];

  const princRows =
    form.licensePrincipalList && form.licensePrincipalList.length > 0
      ? form.licensePrincipalList
      : [
          {
            id: '1',
            no: 'N/A',
            namaPrincipal: 'N/A',
            ipServer: 'N/A',
            jangkaWaktuKontrak: 'N/A',
            jangkaWaktuLicense: 'N/A',
            tahunEol: 'N/A',
            tahunEos: 'N/A',
          },
        ];

  const swAppRows =
    form.softwareAppList && form.softwareAppList.length > 0
      ? form.softwareAppList
      : [
          {
            id: '1',
            no: 'N/A',
            namaAplikasi: 'N/A',
            deskripsiAplikasi: 'N/A',
            jenisAplikasi: 'N/A',
            kategoriServer: 'N/A',
            jenisServer: 'N/A',
            loginAuth: 'N/A',
            platformOsVersion: 'N/A',
            eosDateOs: 'N/A',
            databaseVersion: 'N/A',
            eosDateDb: 'N/A',
          },
        ];

  const swOwnerRows =
    form.softwareOwnerList && form.softwareOwnerList.length > 0
      ? form.softwareOwnerList
      : [
          {
            id: '1',
            no: 'N/A',
            divisiAppsOwnerUser: 'N/A',
            vendorPengembangAplikasi: 'N/A',
            namaPrincipal: 'N/A',
            tahunImplementasiGoLive: 'N/A',
            bahasaPemograman: 'N/A',
            kepemilikan: 'N/A',
            kepemilikanSourceCode: 'N/A',
            prosesBisnisYangDisupport: 'N/A',
            sistemFront: 'N/A',
          },
        ];

  const swIPRows =
    form.softwareIPList && form.softwareIPList.length > 0
      ? form.softwareIPList
      : [
          {
            id: '1',
            no: 'N/A',
            ipServerAppHostnameProduction: 'N/A',
            ipServerAppHostnameDevelopment: 'N/A',
            backupServerApp: 'N/A',
            ipServerDbHostnameProduction: 'N/A',
            ipServerDbHostnameDevelopment: 'N/A',
            backupServerDb: 'N/A',
          },
        ];

  const Header = () => (
    <div className="mb-3">
      <div className="flex justify-between items-start mb-1">
        <div></div>
        <div className="border-[1.5px] border-black px-4 py-0.5 text-xs font-bold tracking-widest uppercase">
          CONFIDENTIAL
        </div>
      </div>

      <div className="grid grid-cols-[160px_1fr_210px] border-[1.5px] border-black h-16">
        <div className="flex items-center justify-center border-r-[1.5px] border-black p-2 bg-white">
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

        <div className="flex items-center justify-center font-bold text-sm tracking-wide text-center border-r-[1.5px] border-black px-4">
          FORMULIR DOKUMENTASI ASET PROYEK TI
        </div>

        <div className="flex flex-col text-[11px]">
          <div className="flex-1 flex items-center px-2.5 border-b-[1.5px] border-black">
            <span className="font-medium mr-2">No. Registrasi:</span>
            <span className="font-semibold text-slate-900">{form.registrationNo || ''}</span>
          </div>
          <div className="flex-1 flex items-center px-2.5">
            <span className="font-medium mr-2">Tanggal:</span>
            <span className="font-semibold text-slate-900">{form.registrationDate || ''}</span>
          </div>
        </div>
      </div>

      {/* Yellow & Blue Stripes */}
      <div className="mt-1 mb-2">
        <div className="h-[2px] bg-[#F7A800] w-full"></div>
        <div className="h-[3px] bg-[#004C97] w-full"></div>
      </div>
    </div>
  );

  const Footer = ({ pageNumber }: { pageNumber: number }) => (
    <div className="mt-auto pt-2 text-[10px]">
      <div className="mb-1 text-slate-700">
        <span className="font-bold">Notes:</span>
        <br />
        <span className="italic">
          * Seluruh kolom bersifat mandatory dan informasi yang perlu dicantumkan meliputi seluruh system environment.
        </span>
      </div>
      <div className="text-center font-medium text-slate-600 text-xs">Page {pageNumber}</div>
    </div>
  );

  return (
    <div
      className="page-container flex flex-col gap-8 items-center bg-slate-200/70 p-4 sm:p-8 rounded-xl overflow-x-auto print:bg-transparent print:p-0"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
    >
      {/* ============================================================ */}
      {/* PAGE 1: Project Info & 1. HARDWARE */}
      {/* ============================================================ */}
      <div className="print-page w-[1050px] min-h-[742px] bg-white p-7 shadow-lg border border-slate-300 flex flex-col justify-between font-sans text-xs">
        <div>
          <Header />

          {/* Project Info Table */}
          <table className="w-full border-collapse mb-3 text-[11px]">
            <tbody>
              <tr>
                <th className="bg-[#1F4E79] text-white border border-[#7F7F7F] px-2.5 py-1 text-left w-[160px] font-bold">
                  Kode Proyek TI
                </th>
                <td className="border border-[#7F7F7F] px-2.5 py-1 text-left font-medium">
                  {sanitize(form.kodeProyekTI)}
                </td>
              </tr>
              <tr>
                <th className="bg-[#1F4E79] text-white border border-[#7F7F7F] px-2.5 py-1 text-left font-bold">
                  Kode Aplikasi
                </th>
                <td className="border border-[#7F7F7F] px-2.5 py-1 text-left font-medium">
                  {sanitize(form.kodeAplikasi)}
                </td>
              </tr>
              <tr>
                <th className="bg-[#1F4E79] text-white border border-[#7F7F7F] px-2.5 py-1 text-left font-bold">
                  No PKS Terbaru
                </th>
                <td className="border border-[#7F7F7F] px-2.5 py-1 text-left font-medium">
                  {sanitize(form.noPKSTerbaru)}
                </td>
              </tr>
              <tr>
                <th className="bg-[#1F4E79] text-white border border-[#7F7F7F] px-2.5 py-1 text-left font-bold">
                  Nama Proyek TI
                </th>
                <td className="border border-[#7F7F7F] px-2.5 py-1 text-left font-medium">
                  {sanitize(form.namaProyekTI)}
                </td>
              </tr>
              <tr>
                <th className="bg-[#1F4E79] text-white border border-[#7F7F7F] px-2.5 py-1 text-left font-bold">
                  PIHAK KEDUA
                </th>
                <td className="border border-[#7F7F7F] px-2.5 py-1 text-left font-medium">
                  {sanitize(form.pihakKedua)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 1. HARDWARE title */}
          <div className="font-bold text-xs text-slate-900 mb-1">1. HARDWARE</div>

          {/* Table 1: Hardware details */}
          <table className="w-full border-collapse mb-2 text-[10px] text-center">
            <thead>
              <tr className="bg-[#1F4E79] text-white font-bold">
                <th className="border border-[#7F7F7F] p-1 w-[3%]">No</th>
                <th className="border border-[#7F7F7F] p-1 w-[10%]">Merk</th>
                <th className="border border-[#7F7F7F] p-1 w-[11%]">Type</th>
                <th className="border border-[#7F7F7F] p-1 w-[12%]">Serial Number</th>
                <th className="border border-[#7F7F7F] p-1 w-[8%]">No. Rak</th>
                <th className="border border-[#7F7F7F] p-1 w-[8%]">No. Rak Unit</th>
                <th className="border border-[#7F7F7F] p-1 w-[12%]">Lokasi</th>
                <th className="border border-[#7F7F7F] p-1 w-[12%]">
                  Kepemilikan
                  <br />
                  (Sewa / Milik BTN)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[12%]">
                  Backup
                  <br />
                  (Realtime / Schedule / NA)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[12%]">Jangka Waktu Maintenance</th>
              </tr>
            </thead>
            <tbody>
              {hwRows.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="border border-[#7F7F7F] p-1">{r.no || i + 1}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.merk)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.type)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.serialNumber)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.noRak)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.noRakUnit)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.lokasi)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.kepemilikan)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.backup)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.jangkaWaktuMaintenance)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table 2: Hardware specifications */}
          <table className="w-full border-collapse mb-2 text-[10px] text-center">
            <thead>
              <tr className="bg-[#1F4E79] text-white font-bold">
                <th className="border border-[#7F7F7F] p-1 w-[3%]">No</th>
                <th className="border border-[#7F7F7F] p-1 w-[13%]">Operating System</th>
                <th className="border border-[#7F7F7F] p-1 w-[11%]">Processor</th>
                <th className="border border-[#7F7F7F] p-1 w-[9%]">RAM</th>
                <th className="border border-[#7F7F7F] p-1 w-[11%]">Volume Harddisk</th>
                <th className="border border-[#7F7F7F] p-1 w-[14%]">Software yang diinstall</th>
                <th className="border border-[#7F7F7F] p-1 w-[13%]">IP Address & Hostname</th>
                <th className="border border-[#7F7F7F] p-1 w-[8%]">Tahun Go live</th>
                <th className="border border-[#7F7F7F] p-1 w-[9%]">
                  EoL
                  <br />
                  (End of Life) Date
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[9%]">
                  EOS
                  <br />
                  (End of Support) Date
                </th>
              </tr>
            </thead>
            <tbody>
              {specRows.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="border border-[#7F7F7F] p-1">{r.no || i + 1}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.operatingSystem)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.processor)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.ram)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.volumeHarddisk)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.softwareYangDiinstall)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.ipAddressHostname)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.tahunGoLive)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.eolDate)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.eosDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Footer pageNumber={1} />
      </div>

      {/* ============================================================ */}
      {/* PAGE 2: 2. LICENSE */}
      {/* ============================================================ */}
      <div className="print-page w-[1050px] min-h-[742px] bg-white p-7 shadow-lg border border-slate-300 flex flex-col justify-between font-sans text-xs">
        <div>
          <Header />

          <div className="font-bold text-xs text-slate-900 mb-1">2. LICENSE</div>

          {/* Table 1: License rows */}
          <table className="w-full border-collapse mb-2.5 text-[10px] text-center">
            <thead>
              <tr className="bg-[#1F4E79] text-white font-bold">
                <th className="border border-[#7F7F7F] p-1 w-[3%]">No</th>
                <th className="border border-[#7F7F7F] p-1 w-[16%]">Nama License</th>
                <th className="border border-[#7F7F7F] p-1 w-[20%]">Deskripsi Fungsi License</th>
                <th className="border border-[#7F7F7F] p-1 w-[15%]">Qty License yang dibeli</th>
                <th className="border border-[#7F7F7F] p-1 w-[15%]">Qty License yang di Deploy</th>
                <th className="border border-[#7F7F7F] p-1 w-[12%]">Serial Number / SKU</th>
                <th className="border border-[#7F7F7F] p-1 w-[10%]">Version Software</th>
                <th className="border border-[#7F7F7F] p-1 w-[9%]">Perpetual / Subscription</th>
              </tr>
            </thead>
            <tbody>
              {licRows.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="border border-[#7F7F7F] p-1">{r.no || i + 1}</td>
                  <td className="border border-[#7F7F7F] p-1 text-left font-medium">{sanitize(r.namaLicense)}</td>
                  <td className="border border-[#7F7F7F] p-1 text-left">{sanitize(r.deskripsiFungsiLicense)}</td>
                  <td className="border border-[#7F7F7F] p-1">{renderMultiLine(r.qtyLicenseYangDibeli)}</td>
                  <td className="border border-[#7F7F7F] p-1">{renderMultiLine(r.qtyLicenseYangDiDeploy)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.serialNumberSku)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.versionSoftware)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.perpetualSubscription)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table 2: Principal rows */}
          <table className="w-full border-collapse mb-2 text-[10px] text-center">
            <thead>
              <tr className="bg-[#1F4E79] text-white font-bold">
                <th className="border border-[#7F7F7F] p-1 w-[3%]">No.</th>
                <th className="border border-[#7F7F7F] p-1 w-[22%]">Nama Principal</th>
                <th className="border border-[#7F7F7F] p-1 w-[17%]">IP Server</th>
                <th className="border border-[#7F7F7F] p-1 w-[20%]">Jangka Waktu Kontrak</th>
                <th className="border border-[#7F7F7F] p-1 w-[20%]">Jangka Waktu License</th>
                <th className="border border-[#7F7F7F] p-1 w-[9%]">Tahun EOL (End Of Life)</th>
                <th className="border border-[#7F7F7F] p-1 w-[9%]">Tahun EOS (End Of Support)</th>
              </tr>
            </thead>
            <tbody>
              {princRows.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="border border-[#7F7F7F] p-1">{r.no || i + 1}</td>
                  <td className="border border-[#7F7F7F] p-1 text-left font-medium">{sanitize(r.namaPrincipal)}</td>
                  <td className="border border-[#7F7F7F] p-1">{renderMultiLine(r.ipServer)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.jangkaWaktuKontrak)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.jangkaWaktuLicense)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.tahunEol)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.tahunEos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Footer pageNumber={2} />
      </div>

      {/* ============================================================ */}
      {/* PAGE 3: 3. SOFTWARE* */}
      {/* ============================================================ */}
      <div className="print-page w-[1050px] min-h-[742px] bg-white p-7 shadow-lg border border-slate-300 flex flex-col justify-between font-sans text-xs">
        <div>
          <Header />

          <div className="font-bold text-xs text-slate-900 mb-1">3. SOFTWARE*</div>

          {/* Table A: App specs */}
          <table className="w-full border-collapse mb-2 text-[10px] text-center">
            <thead>
              <tr className="bg-[#1F4E79] text-white font-bold">
                <th className="border border-[#7F7F7F] p-1 w-[3%]">No</th>
                <th className="border border-[#7F7F7F] p-1 w-[10%]">Nama Aplikasi</th>
                <th className="border border-[#7F7F7F] p-1 w-[20%]">Deskripsi Aplikasi</th>
                <th className="border border-[#7F7F7F] p-1 w-[10%]">
                  Jenis Aplikasi
                  <br />
                  (Application / Appliance / Tools)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[9%]">
                  Kategori Server
                  <br />
                  (Physical / Virtual / Cloud)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[9%]">
                  Jenis Server
                  <br />
                  (Prod / Dev)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[8%]">
                  Login Auth
                  <br />
                  (User AD / Non AD)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[10%]">
                  Platform / OS
                  <br />
                  Version
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[7%]">
                  EoS (End of
                  <br />
                  Support) Date OS
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[8%]">
                  Database
                  <br />
                  Version
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[6%]">
                  EoS (End of
                  <br />
                  Support) Date DB
                </th>
              </tr>
            </thead>
            <tbody>
              {swAppRows.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="border border-[#7F7F7F] p-1">{r.no || i + 1}</td>
                  <td className="border border-[#7F7F7F] p-1 font-semibold">{sanitize(r.namaAplikasi)}</td>
                  <td className="border border-[#7F7F7F] p-1 text-left">{sanitize(r.deskripsiAplikasi)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.jenisAplikasi)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.kategoriServer)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.jenisServer)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.loginAuth)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.platformOsVersion)}</td>
                  <td className="border border-[#7F7F7F] p-1 text-[9px]">{renderMultiLine(r.eosDateOs)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.databaseVersion)}</td>
                  <td className="border border-[#7F7F7F] p-1 text-[9px]">{renderMultiLine(r.eosDateDb)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table B: Ownership & Dev */}
          <table className="w-full border-collapse mb-2 text-[10px] text-center">
            <thead>
              <tr className="bg-[#1F4E79] text-white font-bold">
                <th className="border border-[#7F7F7F] p-1 w-[3%]">No</th>
                <th className="border border-[#7F7F7F] p-1 w-[9%]">Divisi Apps Owner / User</th>
                <th className="border border-[#7F7F7F] p-1 w-[13%]">
                  Vendor Pengembang
                  <br />
                  Aplikasi
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[13%]">
                  Nama Principal
                  <br />
                  (*) Jika Ada
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[8%]">
                  Tahun Implementasi
                  <br />
                  (Go Live)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[8%]">Bahasa Pemograman</th>
                <th className="border border-[#7F7F7F] p-1 w-[12%]">
                  Kepemilikan (Sewa / Beli
                  <br />
                  Putus / Hak Penggunaan)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[12%]">
                  Kepemilikan Source Code
                  <br />
                  (BTN / Penyedia Jasa)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[12%]">
                  Proses Bisnis Yang
                  <br />
                  Disupport
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[10%]">
                  Sistem Front
                  <br />
                  (Web / Dekstop / Mobile)
                </th>
              </tr>
            </thead>
            <tbody>
              {swOwnerRows.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="border border-[#7F7F7F] p-1">{r.no || i + 1}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.divisiAppsOwnerUser)}</td>
                  <td className="border border-[#7F7F7F] p-1 font-medium">{sanitize(r.vendorPengembangAplikasi)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.namaPrincipal)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.tahunImplementasiGoLive)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.bahasaPemograman)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.kepemilikan)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.kepemilikanSourceCode)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.prosesBisnisYangDisupport)}</td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.sistemFront)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table C: Server IP & Backup */}
          <table className="w-full border-collapse mb-2 text-[10px] text-center">
            <thead>
              <tr className="bg-[#1F4E79] text-white font-bold">
                <th className="border border-[#7F7F7F] p-1 w-[3%]">No</th>
                <th className="border border-[#7F7F7F] p-1 w-[25%]">
                  IP Server App/Hostname
                  <br />
                  Production
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[15%]">
                  IP Server App/Hostname
                  <br />
                  Development
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[10%]">
                  Backup Server App
                  <br />
                  (Realtime/Schedule/NA)
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[22%]">
                  IP Server DB/Hostname
                  <br />
                  Production
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[15%]">
                  IP Server DB/Hostname
                  <br />
                  Development
                </th>
                <th className="border border-[#7F7F7F] p-1 w-[10%]">
                  Backup Server DB
                  <br />
                  (Realtime/Schedule/NA)
                </th>
              </tr>
            </thead>
            <tbody>
              {swIPRows.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="border border-[#7F7F7F] p-1">{r.no || i + 1}</td>
                  <td className="border border-[#7F7F7F] p-1 text-left font-mono text-[9px]">
                    {renderMultiLine(r.ipServerAppHostnameProduction)}
                  </td>
                  <td className="border border-[#7F7F7F] p-1 text-left font-mono text-[9px]">
                    {renderMultiLine(r.ipServerAppHostnameDevelopment)}
                  </td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.backupServerApp)}</td>
                  <td className="border border-[#7F7F7F] p-1 text-left font-mono text-[9px]">
                    {renderMultiLine(r.ipServerDbHostnameProduction)}
                  </td>
                  <td className="border border-[#7F7F7F] p-1 text-left font-mono text-[9px]">
                    {renderMultiLine(r.ipServerDbHostnameDevelopment)}
                  </td>
                  <td className="border border-[#7F7F7F] p-1">{sanitize(r.backupServerDb)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Footer pageNumber={3} />
      </div>

      {/* ============================================================ */}
      {/* PAGE 4: Tanda Tangan */}
      {/* ============================================================ */}
      <div className="print-page w-[1050px] min-h-[742px] bg-white p-7 shadow-lg border border-slate-300 flex flex-col justify-between font-sans text-xs">
        <div>
          <Header />

          {/* Top Section: Disusun Oleh & Diverifikasi Oleh */}
          <table className="w-full border-collapse mb-3">
            <thead>
              <tr className="bg-[#1F4E79] text-white font-bold text-center">
                <th className="border border-[#7F7F7F] p-1.5 w-[20%]">Disusun Oleh</th>
                <th className="border border-[#7F7F7F] p-1.5 w-[80%]" colSpan={4}>
                  Diverifikasi Oleh
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Disusun Oleh */}
                <td className="border border-[#7F7F7F] p-2 align-top h-[140px] relative w-[20%]">
                  <div className="text-[11px] text-slate-800">
                    Tanggal: {form.disusunOleh?.date || ''}
                  </div>
                  <div className="font-bold text-center text-[11px] my-1 text-slate-900 min-h-[28px] flex items-center justify-center">
                    {form.disusunOleh?.title || 'IT Project Manager Vendor'}
                  </div>
                  <div className="h-12 flex items-center justify-center my-1">
                    {form.disusunOleh?.signatureDataUrl ? (
                      <img
                        src={form.disusunOleh.signatureDataUrl}
                        alt="Signature"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <div className="h-10 border border-dashed border-slate-300 rounded flex items-center justify-center w-full text-[10px] text-slate-400">
                        Belum Ditandatangani
                      </div>
                    )}
                  </div>
                  <div className="text-center font-bold text-[11px] text-slate-900 mt-2 border-t border-transparent">
                    {form.disusunOleh?.name || '(...................)'}
                  </div>
                </td>

                {/* Diverifikasi Oleh (4 slots) */}
                {(form.diverifikasiOleh || []).slice(0, 4).map((slot, i) => (
                  <td
                    key={slot.key || i}
                    className="border border-[#7F7F7F] p-2 align-top h-[140px] relative w-[20%]"
                  >
                    <div className="text-[11px] text-slate-800">Tanggal: {slot.date || ''}</div>
                    <div className="font-bold text-center text-[10.5px] leading-tight my-1 text-slate-900 min-h-[28px] flex items-center justify-center">
                      {slot.title}
                    </div>
                    <div className="h-12 flex items-center justify-center my-1">
                      {slot.signatureDataUrl ? (
                        <img
                          src={slot.signatureDataUrl}
                          alt="Signature"
                          className="max-h-12 max-w-full object-contain"
                        />
                      ) : (
                        <div className="h-10 border border-dashed border-slate-300 rounded flex items-center justify-center w-full text-[10px] text-slate-400">
                          Belum Ditandatangani
                        </div>
                      )}
                    </div>
                    <div className="text-center font-bold text-[11px] text-slate-900 mt-2">
                      {slot.name || '(...................)'}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Bottom Section: Disetujui Oleh (4 slots) */}
          <table className="w-full border-collapse mb-2">
            <thead>
              <tr className="bg-[#1F4E79] text-white font-bold text-center">
                <th className="border border-[#7F7F7F] p-1.5" colSpan={4}>
                  Disetujui Oleh
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {(form.disetujuiOleh || []).slice(0, 4).map((slot, i) => (
                  <td
                    key={slot.key || i}
                    className="border border-[#7F7F7F] p-2 align-top h-[140px] relative w-[25%]"
                  >
                    <div className="text-[11px] text-slate-800">Tanggal: {slot.date || ''}</div>
                    <div className="font-bold text-center text-[10.5px] leading-tight my-1 text-slate-900 min-h-[28px] flex items-center justify-center">
                      {slot.title}
                    </div>
                    <div className="h-12 flex items-center justify-center my-1">
                      {slot.signatureDataUrl ? (
                        <img
                          src={slot.signatureDataUrl}
                          alt="Signature"
                          className="max-h-12 max-w-full object-contain"
                        />
                      ) : (
                        <div className="h-10 border border-dashed border-slate-300 rounded flex items-center justify-center w-full text-[10px] text-slate-400">
                          Belum Ditandatangani
                        </div>
                      )}
                    </div>
                    <div className="text-center font-bold text-[11px] text-slate-900 mt-2">
                      {slot.name || '(...................)'}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <Footer pageNumber={4} />
      </div>

      {/* ============================================================ */}
      {/* ATTACHMENT PAGES (Lampiran:) */}
      {/* ============================================================ */}
      {(form.attachments || []).map((att, idx) => (
        <div
          key={att.id || idx}
          className="print-page w-[1050px] min-h-[742px] bg-white p-7 shadow-lg border border-slate-300 flex flex-col justify-between font-sans text-xs"
        >
          <div>
            <div className="text-lg font-bold underline italic text-slate-900 mb-1">
              Lampiran:
            </div>
            <div className="text-xs text-slate-500 mb-4">{att.fileName}</div>

            <div className="flex items-center justify-center py-4 bg-slate-50/50 rounded-lg border border-slate-200">
              {att.dataUrl && att.dataUrl.startsWith('data:image/') ? (
                <img
                  src={att.dataUrl}
                  alt={att.fileName}
                  className="max-h-[560px] max-w-[95%] object-contain shadow-sm border border-slate-200"
                />
              ) : (
                <div className="py-20 text-center">
                  <div className="text-sm font-semibold text-slate-700">
                    Dokumen Lampiran: {att.fileName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Tipe: {att.fileType}</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-2 text-center text-xs text-slate-600 font-medium">
            Page {5 + idx}
          </div>
        </div>
      ))}
    </div>
  );
};
