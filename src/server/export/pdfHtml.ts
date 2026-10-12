import { FormDataRecord } from '../../types/index.js';

export function renderForm1to1Html(form: FormDataRecord): string {
  const sanitize = (val?: string) => {
    if (!val || val.trim() === '') return 'N/A';
    return val.replace(/\n/g, '<br/>');
  };

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

  const renderHeader = (pageNumber: number) => `
    <div class="page-header">
      <div class="top-row">
        <div></div>
        <div class="confidential-box">CONFIDENTIAL</div>
      </div>
      <div class="header-main-box">
        <div class="logo-col">
          <svg viewBox="0 0 280 110" width="160" height="60">
            <text x="5" y="85" font-size="90" font-family="'Arial Black', Impact, sans-serif" font-weight="900" fill="#004c97">btn</text>
            <path d="M 125 15 L 180 3 L 165 17 L 115 28 Z" fill="#e31837" />
          </svg>
        </div>
        <div class="title-col">
          FORMULIR DOKUMENTASI ASET PROYEK TI
        </div>
        <div class="meta-col">
          <div class="meta-row top-meta">
            <span class="meta-label">No. Registrasi:</span>
            <span class="meta-value">${form.registrationNo || ''}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Tanggal:</span>
            <span class="meta-value">${form.registrationDate || ''}</span>
          </div>
        </div>
      </div>
      <div class="striped-divider">
        <div class="stripe-yellow"></div>
        <div class="stripe-blue"></div>
      </div>
    </div>
  `;

  const renderFooter = (pageNumber: number) => `
    <div class="page-footer">
      <div class="notes-block">
        <div class="notes-title">Notes:</div>
        <div class="notes-desc">* Seluruh kolom bersifat mandatory dan informasi yang perlu dicantumkan meliputi seluruh system environment.</div>
      </div>
      <div class="page-num">Page ${pageNumber}</div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Formulir Dokumentasi Aset IT - ${form.namaProyekTI || 'BTN'}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      color: #000;
      background: #fff;
      font-size: 8.5pt;
      line-height: 1.25;
    }
    .sheet-page {
      width: 277mm;
      min-height: 190mm;
      padding: 0;
      margin: 0 auto;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .sheet-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .confidential-box {
      border: 1.5px solid #000;
      padding: 3px 20px;
      font-weight: 700;
      letter-spacing: 2px;
      font-size: 10pt;
    }
    .header-main-box {
      display: grid;
      grid-template-columns: 200px 1fr 240px;
      border: 1.5px solid #000;
      height: 70px;
    }
    .logo-col {
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1.5px solid #000;
      background: #fff;
    }
    .title-col {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12pt;
      letter-spacing: 0.5px;
      text-align: center;
      border-right: 1.5px solid #000;
      padding: 0 10px;
    }
    .meta-col {
      display: flex;
      flex-direction: column;
    }
    .meta-row {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 8px;
      font-size: 9pt;
    }
    .top-meta {
      border-bottom: 1.5px solid #000;
    }
    .meta-label {
      font-weight: 500;
      margin-right: 6px;
    }
    .meta-value {
      font-weight: 600;
    }
    .striped-divider {
      margin-top: 5px;
      margin-bottom: 12px;
    }
    .stripe-yellow {
      height: 2.5px;
      background-color: #f7a800;
      width: 100%;
    }
    .stripe-blue {
      height: 3.5px;
      background-color: #004c97;
      width: 100%;
    }
    .content-area {
      flex: 1;
    }
    .section-title {
      font-size: 9.5pt;
      font-weight: 700;
      margin: 7px 0 4px 0;
    }
    table.btn-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 7.5pt;
    }
    table.btn-table th, table.btn-table td {
      border: 1px solid #7f7f7f;
      padding: 3.5px 4px;
      vertical-align: middle;
      text-align: center;
      word-break: break-word;
    }
    table.btn-table th {
      background-color: #1f4e79 !important;
      color: #ffffff !important;
      font-weight: 700;
      line-height: 1.2;
    }
    table.btn-table td.align-left {
      text-align: left;
    }
    .project-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 8.5pt;
    }
    .project-info-table th {
      background-color: #1f4e79 !important;
      color: #ffffff !important;
      font-weight: 700;
      border: 1px solid #7f7f7f;
      padding: 4px 8px;
      text-align: left;
      width: 180px;
    }
    .project-info-table td {
      border: 1px solid #7f7f7f;
      padding: 4px 8px;
      text-align: left;
      font-weight: 500;
    }
    .page-footer {
      margin-top: 6px;
      font-size: 7.5pt;
    }
    .notes-block {
      margin-bottom: 4px;
    }
    .notes-title {
      font-weight: 700;
    }
    .notes-desc {
      font-style: italic;
    }
    .page-num {
      text-align: center;
      font-size: 8pt;
      color: #333;
    }
    .sig-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .sig-table th {
      background-color: #1f4e79 !important;
      color: #ffffff !important;
      font-weight: 700;
      border: 1px solid #7f7f7f;
      padding: 5px;
      text-align: center;
      font-size: 9pt;
    }
    .sig-box {
      border: 1px solid #7f7f7f;
      vertical-align: top;
      padding: 6px 8px;
      height: 120px;
      position: relative;
    }
    .sig-date {
      font-size: 8pt;
      margin-bottom: 2px;
    }
    .sig-title {
      font-size: 8pt;
      font-weight: 700;
      text-align: center;
      min-height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sig-canvas-img {
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 2px 0;
    }
    .sig-canvas-img img {
      max-height: 45px;
      max-width: 100%;
    }
    .sig-name {
      font-size: 8pt;
      font-weight: 700;
      text-align: center;
      border-top: 1px solid transparent;
      padding-top: 2px;
    }
    .attachment-page {
      padding: 10px 0;
    }
    .attachment-title {
      font-size: 14pt;
      font-weight: 700;
      text-decoration: underline;
      margin-bottom: 12px;
    }
    .attachment-img-wrap {
      text-align: center;
      margin-top: 10px;
    }
    .attachment-img-wrap img {
      max-width: 90%;
      max-height: 155mm;
      border: 1px solid #ddd;
    }
    @media screen {
      body {
        background: #e2e8f0;
        padding: 20px;
      }
      .sheet-page {
        background: #fff;
        padding: 20px 25px;
        margin-bottom: 25px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.12);
        border-radius: 4px;
      }
      .print-btn-bar {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        gap: 10px;
      }
      .print-btn-bar button {
        background: #004c97;
        color: white;
        padding: 10px 18px;
        border: none;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      }
      .print-btn-bar button:hover {
        background: #00366b;
      }
    }
  </style>
</head>
<body>

  <div class="print-btn-bar no-print">
    <button onclick="window.print()">Cetak / Simpan PDF (1:1)</button>
    <button onclick="window.close()" style="background:#475569;">Tutup Preview</button>
  </div>

  <!-- ================= PAGE 1 ================= -->
  <div class="sheet-page">
    ${renderHeader(1)}
    <div class="content-area">
      <!-- Project Info -->
      <table class="project-info-table">
        <tr>
          <th>Kode Proyek TI</th>
          <td>${sanitize(form.kodeProyekTI)}</td>
        </tr>
        <tr>
          <th>Kode Aplikasi</th>
          <td>${sanitize(form.kodeAplikasi)}</td>
        </tr>
        <tr>
          <th>No PKS Terbaru</th>
          <td>${sanitize(form.noPKSTerbaru)}</td>
        </tr>
        <tr>
          <th>Nama Proyek TI</th>
          <td>${sanitize(form.namaProyekTI)}</td>
        </tr>
        <tr>
          <th>PIHAK KEDUA</th>
          <td>${sanitize(form.pihakKedua)}</td>
        </tr>
      </table>

      <!-- 1. Hardware -->
      <div class="section-title">1. HARDWARE</div>
      <table class="btn-table">
        <thead>
          <tr>
            <th style="width: 3%;">No</th>
            <th style="width: 10%;">Merk</th>
            <th style="width: 11%;">Type</th>
            <th style="width: 12%;">Serial Number</th>
            <th style="width: 8%;">No. Rak</th>
            <th style="width: 8%;">No. Rak Unit</th>
            <th style="width: 12%;">Lokasi</th>
            <th style="width: 12%;">Kepemilikan<br>(Sewa / Milik BTN)</th>
            <th style="width: 12%;">Backup<br>(Realtime / Schedule / NA)</th>
            <th style="width: 12%;">Jangka Waktu Maintenance</th>
          </tr>
        </thead>
        <tbody>
          ${hwRows
            .map(
              (r, idx) => `
            <tr>
              <td>${r.no || idx + 1}</td>
              <td>${sanitize(r.merk)}</td>
              <td>${sanitize(r.type)}</td>
              <td>${sanitize(r.serialNumber)}</td>
              <td>${sanitize(r.noRak)}</td>
              <td>${sanitize(r.noRakUnit)}</td>
              <td>${sanitize(r.lokasi)}</td>
              <td>${sanitize(r.kepemilikan)}</td>
              <td>${sanitize(r.backup)}</td>
              <td>${sanitize(r.jangkaWaktuMaintenance)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <table class="btn-table">
        <thead>
          <tr>
            <th style="width: 3%;">No</th>
            <th style="width: 13%;">Operating System</th>
            <th style="width: 11%;">Processor</th>
            <th style="width: 9%;">RAM</th>
            <th style="width: 11%;">Volume Harddisk</th>
            <th style="width: 14%;">Software yang diinstall</th>
            <th style="width: 13%;">IP Address & Hostname</th>
            <th style="width: 8%;">Tahun Go live</th>
            <th style="width: 9%;">EoL<br>(End of Life) Date</th>
            <th style="width: 9%;">EOS<br>(End of Support) Date</th>
          </tr>
        </thead>
        <tbody>
          ${specRows
            .map(
              (r, idx) => `
            <tr>
              <td>${r.no || idx + 1}</td>
              <td>${sanitize(r.operatingSystem)}</td>
              <td>${sanitize(r.processor)}</td>
              <td>${sanitize(r.ram)}</td>
              <td>${sanitize(r.volumeHarddisk)}</td>
              <td>${sanitize(r.softwareYangDiinstall)}</td>
              <td>${sanitize(r.ipAddressHostname)}</td>
              <td>${sanitize(r.tahunGoLive)}</td>
              <td>${sanitize(r.eolDate)}</td>
              <td>${sanitize(r.eosDate)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    ${renderFooter(1)}
  </div>

  <!-- ================= PAGE 2 ================= -->
  <div class="sheet-page">
    ${renderHeader(2)}
    <div class="content-area">
      <div class="section-title">2. LICENSE</div>
      <table class="btn-table">
        <thead>
          <tr>
            <th style="width: 3%;">No</th>
            <th style="width: 16%;">Nama License</th>
            <th style="width: 20%;">Deskripsi Fungsi License</th>
            <th style="width: 15%;">Qty License yang dibeli</th>
            <th style="width: 15%;">Qty License yang di Deploy</th>
            <th style="width: 12%;">Serial Number / SKU</th>
            <th style="width: 10%;">Version Software</th>
            <th style="width: 9%;">Perpetual / Subscription</th>
          </tr>
        </thead>
        <tbody>
          ${licRows
            .map(
              (r, idx) => `
            <tr>
              <td>${r.no || idx + 1}</td>
              <td class="align-left">${sanitize(r.namaLicense)}</td>
              <td class="align-left">${sanitize(r.deskripsiFungsiLicense)}</td>
              <td>${sanitize(r.qtyLicenseYangDibeli)}</td>
              <td>${sanitize(r.qtyLicenseYangDiDeploy)}</td>
              <td>${sanitize(r.serialNumberSku)}</td>
              <td>${sanitize(r.versionSoftware)}</td>
              <td>${sanitize(r.perpetualSubscription)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <table class="btn-table">
        <thead>
          <tr>
            <th style="width: 3%;">No.</th>
            <th style="width: 22%;">Nama Principal</th>
            <th style="width: 17%;">IP Server</th>
            <th style="width: 20%;">Jangka Waktu Kontrak</th>
            <th style="width: 20%;">Jangka Waktu License</th>
            <th style="width: 9%;">Tahun EOL (End Of Life)</th>
            <th style="width: 9%;">Tahun EOS (End Of Support)</th>
          </tr>
        </thead>
        <tbody>
          ${princRows
            .map(
              (r, idx) => `
            <tr>
              <td>${r.no || idx + 1}</td>
              <td class="align-left">${sanitize(r.namaPrincipal)}</td>
              <td>${sanitize(r.ipServer)}</td>
              <td>${sanitize(r.jangkaWaktuKontrak)}</td>
              <td>${sanitize(r.jangkaWaktuLicense)}</td>
              <td>${sanitize(r.tahunEol)}</td>
              <td>${sanitize(r.tahunEos)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    ${renderFooter(2)}
  </div>

  <!-- ================= PAGE 3 ================= -->
  <div class="sheet-page">
    ${renderHeader(3)}
    <div class="content-area">
      <div class="section-title">3. SOFTWARE*</div>
      <table class="btn-table">
        <thead>
          <tr>
            <th style="width: 3%;">No</th>
            <th style="width: 10%;">Nama Aplikasi</th>
            <th style="width: 20%;">Deskripsi Aplikasi</th>
            <th style="width: 10%;">Jenis Aplikasi<br>(Application / Appliance / Tools)</th>
            <th style="width: 9%;">Kategori Server<br>(Physical / Virtual / Cloud)</th>
            <th style="width: 9%;">Jenis Server<br>(Prod / Dev)</th>
            <th style="width: 8%;">Login Auth<br>(User AD / Non AD)</th>
            <th style="width: 10%;">Platform / OS<br>Version</th>
            <th style="width: 7%;">EoS (End of<br>Support) Date OS</th>
            <th style="width: 8%;">Database<br>Version</th>
            <th style="width: 6%;">EoS (End of<br>Support) Date DB</th>
          </tr>
        </thead>
        <tbody>
          ${swAppRows
            .map(
              (r, idx) => `
            <tr>
              <td>${r.no || idx + 1}</td>
              <td>${sanitize(r.namaAplikasi)}</td>
              <td class="align-left">${sanitize(r.deskripsiAplikasi)}</td>
              <td>${sanitize(r.jenisAplikasi)}</td>
              <td>${sanitize(r.kategoriServer)}</td>
              <td>${sanitize(r.jenisServer)}</td>
              <td>${sanitize(r.loginAuth)}</td>
              <td>${sanitize(r.platformOsVersion)}</td>
              <td>${sanitize(r.eosDateOs)}</td>
              <td>${sanitize(r.databaseVersion)}</td>
              <td>${sanitize(r.eosDateDb)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <table class="btn-table">
        <thead>
          <tr>
            <th style="width: 3%;">No</th>
            <th style="width: 9%;">Divisi Apps Owner / User</th>
            <th style="width: 13%;">Vendor Pengembang<br>Aplikasi</th>
            <th style="width: 13%;">Nama Principal<br>(*) Jika Ada</th>
            <th style="width: 8%;">Tahun Implementasi<br>(Go Live)</th>
            <th style="width: 8%;">Bahasa Pemograman</th>
            <th style="width: 12%;">Kepemilikan (Sewa / Beli<br>Putus / Hak Penggunaan)</th>
            <th style="width: 12%;">Kepemilikan Source Code<br>(BTN / Penyedia Jasa)</th>
            <th style="width: 12%;">Proses Bisnis Yang<br>Disupport</th>
            <th style="width: 10%;">Sistem Front<br>(Web / Dekstop / Mobile)</th>
          </tr>
        </thead>
        <tbody>
          ${swOwnerRows
            .map(
              (r, idx) => `
            <tr>
              <td>${r.no || idx + 1}</td>
              <td>${sanitize(r.divisiAppsOwnerUser)}</td>
              <td>${sanitize(r.vendorPengembangAplikasi)}</td>
              <td>${sanitize(r.namaPrincipal)}</td>
              <td>${sanitize(r.tahunImplementasiGoLive)}</td>
              <td>${sanitize(r.bahasaPemograman)}</td>
              <td>${sanitize(r.kepemilikan)}</td>
              <td>${sanitize(r.kepemilikanSourceCode)}</td>
              <td>${sanitize(r.prosesBisnisYangDisupport)}</td>
              <td>${sanitize(r.sistemFront)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <table class="btn-table">
        <thead>
          <tr>
            <th style="width: 3%;">No</th>
            <th style="width: 25%;">IP Server App/Hostname<br>Production</th>
            <th style="width: 15%;">IP Server App/Hostname<br>Development</th>
            <th style="width: 10%;">Backup Server App<br>(Realtime/Schedule/NA)</th>
            <th style="width: 22%;">IP Server DB/Hostname<br>Production</th>
            <th style="width: 15%;">IP Server DB/Hostname<br>Development</th>
            <th style="width: 10%;">Backup Server DB<br>(Realtime/Schedule/NA)</th>
          </tr>
        </thead>
        <tbody>
          ${swIPRows
            .map(
              (r, idx) => `
            <tr>
              <td>${r.no || idx + 1}</td>
              <td class="align-left">${sanitize(r.ipServerAppHostnameProduction)}</td>
              <td class="align-left">${sanitize(r.ipServerAppHostnameDevelopment)}</td>
              <td>${sanitize(r.backupServerApp)}</td>
              <td class="align-left">${sanitize(r.ipServerDbHostnameProduction)}</td>
              <td class="align-left">${sanitize(r.ipServerDbHostnameDevelopment)}</td>
              <td>${sanitize(r.backupServerDb)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    ${renderFooter(3)}
  </div>

  <!-- ================= PAGE 4 ================= -->
  <div class="sheet-page">
    ${renderHeader(4)}
    <div class="content-area">
      <!-- Top Row: Disusun Oleh & Diverifikasi Oleh -->
      <table class="sig-table" style="margin-bottom: 12px;">
        <thead>
          <tr>
            <th style="width: 20%;">Disusun Oleh</th>
            <th style="width: 80%;" colspan="4">Diverifikasi Oleh</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <!-- Disusun Oleh -->
            <td class="sig-box" style="width: 20%;">
              <div class="sig-date">Tanggal: ${form.disusunOleh?.date || ''}</div>
              <div class="sig-title">${form.disusunOleh?.title || 'IT Project Manager Vendor'}</div>
              <div class="sig-canvas-img">
                ${
                  form.disusunOleh?.signatureDataUrl
                    ? `<img src="${form.disusunOleh.signatureDataUrl}" alt="ttd" />`
                    : ''
                }
              </div>
              <div class="sig-name">${form.disusunOleh?.name || '(...................)'}</div>
            </td>

            <!-- Diverifikasi Oleh (4 slots) -->
            ${(form.diverifikasiOleh || []).slice(0, 4).map(
              (slot) => `
              <td class="sig-box" style="width: 20%;">
                <div class="sig-date">Tanggal: ${slot.date || ''}</div>
                <div class="sig-title">${slot.title}</div>
                <div class="sig-canvas-img">
                  ${
                    slot.signatureDataUrl
                      ? `<img src="${slot.signatureDataUrl}" alt="ttd" />`
                      : ''
                  }
                </div>
                <div class="sig-name">${slot.name || '(...................)'}</div>
              </td>
            `
            ).join('')}
          </tr>
        </tbody>
      </table>

      <!-- Bottom Row: Disetujui Oleh -->
      <table class="sig-table">
        <thead>
          <tr>
            <th colspan="4">Disetujui Oleh</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            ${(form.disetujuiOleh || []).slice(0, 4).map(
              (slot) => `
              <td class="sig-box" style="width: 25%;">
                <div class="sig-date">Tanggal: ${slot.date || ''}</div>
                <div class="sig-title">${slot.title}</div>
                <div class="sig-canvas-img">
                  ${
                    slot.signatureDataUrl
                      ? `<img src="${slot.signatureDataUrl}" alt="ttd" />`
                      : ''
                  }
                </div>
                <div class="sig-name">${slot.name || '(...................)'}</div>
              </td>
            `
            ).join('')}
          </tr>
        </tbody>
      </table>
    </div>
    ${renderFooter(4)}
  </div>

  <!-- ================= ATTACHMENTS ================= -->
  ${(form.attachments || []).map(
    (att, idx) => `
    <div class="sheet-page">
      <div class="attachment-page">
        <div class="attachment-title">Lampiran:</div>
        <div style="font-size: 9pt; color: #555; margin-bottom: 10px;">${att.fileName}</div>
        <div class="attachment-img-wrap">
          ${
            att.dataUrl && att.dataUrl.startsWith('data:image/')
              ? `<img src="${att.dataUrl}" alt="${att.fileName}" />`
              : `<div style="padding: 40px; border: 1px dashed #999; text-align: center;">Dokumen Lampiran: <strong>${att.fileName}</strong> (${att.fileType})</div>`
          }
        </div>
      </div>
      <div class="page-footer">
        <div class="page-num">Page ${5 + idx}</div>
      </div>
    </div>
  `
  ).join('')}

</body>
</html>`;
}
