# Sistem Formulir Dokumentasi Aset Proyek TI Bank BTN

Aplikasi web full-stack resmi Bank Tabungan Negara (Persero) Tbk untuk pembuatan, verifikasi, sirkulasi persetujuan tanda tangan digital, manajemen lampiran, serta ekspor dokumen **1:1 persis** seperti template resmi Bank BTN dalam format PDF & Microsoft Word (.docx).

---

## 1. Ringkasan Fitur Utama

- **Layout Dokumen 1:1 Resmi BTN:**
  - Orientasi Landscape A4
  - Header standar BTN: Logo Bank BTN, Judul "FORMULIR DOKUMENTASI ASET PROYEK TI", Kotak "No. Registrasi:" dan "Tanggal:", Kotak "CONFIDENTIAL" di kanan atas, serta garis ganda aksen Kuning-Biru.
  - Footer standar: Catatan "Notes: * Seluruh kolom bersifat mandatory dan informasi yang perlu dicantumkan meliputi seluruh system environment." dan penomoran "Page X".
  - Tabel dengan warna header biru tua (`#1F4E79` / `#2F5597`), teks putih tebal, garis border rapi.
  - **Aturan N/A:** Tabel kosong otomatis tetap tampil dengan 1 baris terisi "N/A" pada setiap sel.
- **Tiga Hak Akses (Role & Login):**
  - **Vendor:** Mengisi formulir (Langkah 1–3), membubuhkan tanda tangan digital pada slot "Disusun Oleh" (IT Project Manager Vendor), simpan draft, pratinjau live 1:1, dan submit form.
  - **Manajemen BTN:** Melihat daftar formulir yang menunggu verifikasi/persetujuan, membuka form read-only, menandatangani slot miliknya ("Diverifikasi Oleh" atau "Disetujui Oleh") dengan otomatisasi tanggal, serta mengajukan revisi dengan catatan bila diperlukan.
  - **Superadmin:** Akses penuh ke seluruh menu, Dashboard metrik & progres TTD (misal 3/9 slot), Manajemen User (CRUD akun, validasi WhatsApp `08xxxxxxxxxx`, assign slot), menu Lampiran (drag-and-drop & paste Ctrl+V dari clipboard), tombol "Isi Langsung & Simpan" untuk mengisi nama/jabatan/TTD pejabat BTN secara langsung, status toggle ("Tandai Done"), serta pengaturan WhatsApp Fonnte.
- **Ekspor Dokumen:**
  - **PDF (1:1):** Tampilan print/export pixel-perfect landscape A4 dengan header berulang, pembagian halaman persis contoh, serta lampiran sertifikat.
  - **Word (.docx):** Dibuat menggunakan library `docx` dengan orientasi landscape A4, tabel dengan header biru tua, border abu-abu, dan penempatan gambar tanda tangan/lampiran.
- **WhatsApp Gateway (Fonnte) & Penjadwalan Reminder:**
  - Notifikasi instan ke Superadmin saat Vendor menekan tombol Submit.
  - Reminder terjadwal (`node-cron`) memindai form On Going dan mengirim rekap ke Superadmin serta reminder ke pejabat yang belum menandatangani.
  - Tombol manual "Kirim Reminder WA" per form.
  - Log pengiriman tercatat di `ReminderLogs`.
  - Format nomor WhatsApp divalidasi ketat: hanya angka, diawali `08`, panjang 10–13 digit (contoh: `08974847052`), bukan `+62`.

---

## 2. Prasyarat Sistem & Instalasi

- **Node.js:** Versi 18.x, 20.x, atau 22.x LTS
- **NPM:** Versi 9.x atau yang lebih baru

### Langkah Instalasi:

```bash
# 1. Masuk ke direktori proyek
cd /path/to/project

# 2. Salin environment configuration
cp .env.example .env

# 3. Install seluruh dependensi
npm install

# 4. Jalankan aplikasi (Backend Express + Frontend Vite jalan bersamaan di port 3000)
npm run dev
```

Aplikasi dapat langsung diakses di browser: `http://localhost:3000`.

---

## 3. Akun Default & Demo

Saat pertama kali server dijalankan, sistem otomatis melakukan seeding akun berikut:

| Role | Username | Password Default | Nama Lengkap / Jabatan | No. WhatsApp |
|---|---|---|---|---|
| **Superadmin** | `superadmin` | `SuperAdmin123!` | Super Administrator BTN / IT Asset Admin | `081234567890` |
| **Vendor** | `vendor_wide` | `Vendor123!` | Natasya Julianti / PT Wide Technologies Indonesia | `08974847052` |
| **Manajemen BTN (PM)** | `pm_btn` | `Btn123!` | Ratih Yulia P / IT Project Manager BTN | `081298765432` |
| **Manajemen BTN (QA)** | `qa_btn` | `Btn123!` | Muhammad Juliansyah Hartono / IT Quality Assurance | `081298765433` |
| **Manajemen BTN (Arch)**| `arch_btn` | `Btn123!` | Rizal Firdaus / Technology Architecture Specialist | `081298765434` |
| **Manajemen BTN (CMDB)**| `cmdb_btn` | `Btn123!` | Thifal Atsiil / IT Asset Compliance Specialist | `081298765435` |

*(Pada halaman Login tersedia tombol preset satu-klik untuk langsung menguji ketiga role tersebut tanpa perlu mengetik manual).*

---

## 4. Panduan Setup Google Service Account (Sheets & Drive)

Aplikasi telah dikonfigurasi dengan ID Google Workspace berikut:
- **Spreadsheet ID:** `16yW3FqOX_0jJy6jOxkV0U0CuutwokKlsASx5o9SPqR4`
- **Drive Folder ID:** `1NMHXWSGtZU5j-I9HBb9fabB-jU0w0HJk`

### Langkah-langkah setup Service Account:
1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan buat project baru (atau gunakan project yang ada).
2. Aktifkan dua API berikut pada menu **APIs & Services > Library**:
   - **Google Sheets API**
   - **Google Drive API**
3. Masuk ke **IAM & Admin > Service Accounts**, klik **Create Service Account**:
   - Beri nama service account (contoh: `btn-asset-sync-sa`).
   - Berikan role **Editor** pada project.
4. Klik tab **Keys** pada service account yang baru dibuat, pilih **Add Key > Create new key > JSON**.
5. File JSON kredensial akan otomatis terdownload:
   - Simpan file tersebut di root folder proyek dengan nama `service-account-key.json` (atau tentukan path di `GOOGLE_APPLICATION_CREDENTIALS` pada `.env`).
   - Atau salin isi JSON tersebut ke variabel `GOOGLE_SERVICE_ACCOUNT_JSON` di file `.env`.
6. **PENTING - Share Akses ke Spreadsheet & Drive Folder:**
   - Salin email service account (contoh: `btn-asset-sync-sa@project-id.iam.gserviceaccount.com`).
   - Buka Google Spreadsheet `16yW3FqOX_0jJy6jOxkV0U0CuutwokKlsASx5o9SPqR4`, klik tombol **Bagikan (Share)**, masukkan email service account, dan berikan akses **Editor**.
   - Buka Google Drive Folder `1NMHXWSGtZU5j-I9HBb9fabB-jU0w0HJk`, klik tombol **Bagikan (Share)**, masukkan email service account, dan berikan akses **Editor**.

*Catatan:* Jika kredensial belum dimasukkan, aplikasi berjalan menggunakan **Local Resilient JSON Database** (`data/database.json`) sehingga Anda dapat langsung menjalankan dan mendemokan seluruh fitur tanpa kendala.

---

## 5. Struktur Kolom Tab/Sheet Google Spreadsheet

Sistem secara otomatis membuat dan menyelaraskan 15 tab sheet berikut:

1. **Users:** `id`, `username`, `passwordHash`, `role`, `fullName`, `companyOrPosition`, `whatsappNumber`, `assignedSlot`, `isActive`, `createdAt`, `updatedAt`
2. **Forms:** `id`, `registrationNo`, `registrationDate`, `status`, `revisionNotes`, `createdByUserId`, `createdByUsername`, `kodeProyekTI`, `kodeAplikasi`, `noPKSTerbaru`, `namaProyekTI`, `pihakKedua`, `createdAt`, `updatedAt`
3. **Hardware:** `id`, `formId`, `no`, `merk`, `type`, `serialNumber`, `noRak`, `noRakUnit`, `lokasi`, `kepemilikan`, `backup`, `jangkaWaktuMaintenance`
4. **HardwareSpec:** `id`, `formId`, `no`, `operatingSystem`, `processor`, `ram`, `volumeHarddisk`, `softwareYangDiinstall`, `ipAddressHostname`, `tahunGoLive`, `eolDate`, `eosDate`
5. **License:** `id`, `formId`, `no`, `namaLicense`, `deskripsiFungsiLicense`, `qtyLicenseYangDibeli`, `qtyLicenseYangDiDeploy`, `serialNumberSku`, `versionSoftware`, `perpetualSubscription`
6. **LicensePrincipal:** `id`, `formId`, `no`, `namaPrincipal`, `ipServer`, `jangkaWaktuKontrak`, `jangkaWaktuLicense`, `tahunEol`, `tahunEos`
7. **Software:** `id`, `formId`, `no`, `namaAplikasi`, `deskripsiAplikasi`, `jenisAplikasi`, `kategoriServer`, `jenisServer`, `loginAuth`, `platformOsVersion`, `eosDateOs`, `databaseVersion`, `eosDateDb`
8. **SoftwareOwner:** `id`, `formId`, `no`, `divisiAppsOwnerUser`, `vendorPengembangAplikasi`, `namaPrincipal`, `tahunImplementasiGoLive`, `bahasaPemograman`, `kepemilikan`, `kepemilikanSourceCode`, `prosesBisnisYangDisupport`, `sistemFront`
9. **SoftwareIP:** `id`, `formId`, `no`, `ipServerAppHostnameProduction`, `ipServerAppHostnameDevelopment`, `backupServerApp`, `ipServerDbHostnameProduction`, `ipServerDbHostnameDevelopment`, `backupServerDb`
10. **Signatures:** `id`, `formId`, `slotType`, `slotKey`, `title`, `name`, `date`, `signatureDataUrl`, `signedByUserId`, `signedAt`
11. **Attachments:** `id`, `formId`, `fileName`, `fileType`, `fileSize`, `driveFileId`, `driveUrl`, `dataUrl`, `order`, `uploadedAt`
12. **Settings:** `fonnteToken`, `fonnteSuperadminPhone`, `reminderTemplate`, `reminderCronSchedule`, `defaultSlotsJson`
13. **ReminderRecipients:** `id`, `name`, `whatsappNumber`, `slotKey`, `slotTitle`, `isActive`
14. **ReminderLogs:** `id`, `timestamp`, `target`, `message`, `status`, `response`
15. **AuditLog:** `id`, `timestamp`, `userId`, `username`, `action`, `details`

---

## 6. Daftar Endpoint REST API

### Autentikasi:
- `POST /api/auth/login` - Login pengguna (JWT + Bcrypt)
- `GET /api/auth/me` - Verifikasi token & ambil data profil login

### Manajemen Pengguna (Superadmin):
- `GET /api/users` - Mengambil daftar seluruh pengguna
- `POST /api/users` - Menambah pengguna baru (validasi WhatsApp 08xxx)
- `PUT /api/users/:id` - Mengubah pengguna / reset password
- `DELETE /api/users/:id` - Menghapus pengguna

### Formulir Dokumentasi Aset:
- `GET /api/forms` - Daftar formulir (terfilter otomatis sesuai role)
- `GET /api/forms/:id` - Detail formulir
- `POST /api/forms` - Membuat draft formulir baru
- `PUT /api/forms/:id` - Memperbarui formulir
- `DELETE /api/forms/:id` - Menghapus formulir (Superadmin)
- `POST /api/forms/:id/submit` - Vendor submit formulir -> memicu WhatsApp event ke Superadmin
- `POST /api/forms/:id/status` - Superadmin mengubah status (Draft, On Going, Done, Revision)
- `POST /api/forms/:id/sign` - Membubuhkan tanda tangan digital pada slot tertentu
- `POST /api/forms/:id/direct-fill` - Superadmin "Isi Langsung & Simpan" untuk slot BTN
- `POST /api/forms/:id/reject` - Manajemen BTN meminta revisi dengan catatan

### Lampiran:
- `POST /api/forms/:id/attachments` - Unggah lampiran (mendukung drag-drop & paste Ctrl+V)
- `DELETE /api/forms/:id/attachments/:attachmentId` - Hapus lampiran
- `PUT /api/forms/:id/attachments/reorder` - Ubah urutan lampiran

### Ekspor Dokumen 1:1:
- `GET /api/forms/:id/export/pdf-html` - Render HTML-to-PDF landscape A4 1:1 untuk cetak/simpan PDF
- `GET /api/forms/:id/export/word` - Unduh dokumen Microsoft Word (.docx) berorientasi landscape A4 dengan header `#2F5597` dan penyisipan tanda tangan

### WhatsApp Gateway (Fonnte):
- `GET /api/settings` & `PUT /api/settings` - Pengaturan token Fonnte, template, jadwal cron
- `POST /api/reminders/test` - Uji coba kirim WhatsApp via Fonnte
- `POST /api/reminders/send-now/:formId` - Memicu pengiriman reminder manual untuk sebuah form
- `GET/POST/DELETE /api/reminders/recipients` - CRUD daftar pejabat penerima reminder
- `GET /api/reminders/logs` - Riwayat log kirim reminder
- `GET /api/audit-logs` - Riwayat jejak audit sistem

---

## 7. Checklist Skenario Pengujian Sistem

1. **Alur Vendor Pembuatan & Submit Formulir:**
   - Login dengan akun `vendor_wide` (`Vendor123!`).
   - Masuk ke menu **Formulir Baru** dan isi data pada wizard (Langkah 1–4).
   - Pada Langkah 4 ("Tanda Tangan Vendor"), klik **Buat Tanda Tangan Sekarang**, gambar tanda tangan di kanvas, lalu simpan.
   - Klik **Submit ke BTN**.
   - Form berpindah ke status **On Going** dan terkunci untuk vendor.
2. **Notifikasi WhatsApp ke Superadmin:**
   - Saat submit berhasil, sistem secara otomatis mengeksekusi trigger notifikasi event WhatsApp ke nomor Superadmin via Fonnte. Log dapat dicek di tab **Log Reminder**.
3. **Verifikasi & Tanda Tangan Manajemen BTN:**
   - Logout lalu login sebagai `pm_btn` (`Btn123!`).
   - Buka form yang berstatus On Going.
   - Klik tombol **Tanda Tangan Digital**, pilih slot "IT Project Manager BTN", bubuhkan tanda tangan pada kanvas, dan simpan. Tanggal akan terisi otomatis.
4. **Manajemen Lampiran (Drag & Drop & Paste Ctrl+V Clipboard):**
   - Login sebagai `superadmin` (`SuperAdmin123!`).
   - Buka menu **Lampiran** pada formulir.
   - Lakukan screenshot di komputer Anda (tekan `PrtScn` atau `Win+Shift+S`), lalu tekan **Ctrl + V** di modal lampiran. Screenshot langsung otomatis terunggah dan muncul di daftar lampiran!
5. **Superadmin "Isi Langsung & Simpan":**
   - Klik tombol **Isi Langsung & Simpan** pada baris form.
   - Isi nama pejabat pada slot yang masih kosong dan bubuhkan tanda tangan langsung tanpa perlu menunggu pejabat login satu per satu.
6. **Tandai Done:**
   - Klik tombol **Tandai Done** pada form yang telah lengkap ditandatangani. Status berubah menjadi **Done**.
7. **Ekspor & Pembandingan 1:1:**
   - Klik tombol **PDF (1:1)**: Dokumen terbuka dalam mode pratinjau landscape A4 siap cetak dengan logo BTN, kotak Confidential, garis kuning-biru, 4 halaman tabel utama, dan halaman lampiran sertifikat persis seperti PDF contoh.
   - Klik tombol **Word (.docx)**: Dokumen Word terdownload dengan tabel rapi berheader biru tua dan gambar tanda tangan terpasang.
