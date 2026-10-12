export type UserRole = 'vendor' | 'superadmin' | 'manajemen_btn';

export interface User {
  id: string;
  username: string;
  passwordHash?: string;
  role: UserRole;
  fullName: string;
  companyOrPosition: string;
  whatsappNumber: string; // 08xxxxxxxxxx
  assignedSlot?: string; // Slot title they are responsible for signing
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HardwareRow {
  id: string;
  no: number | string;
  merk: string;
  type: string;
  serialNumber: string;
  noRak: string;
  noRakUnit: string;
  lokasi: string;
  kepemilikan: string; // Sewa / Milik BTN
  backup: string; // Realtime / Schedule / NA
  jangkaWaktuMaintenance: string;
}

export interface HardwareSpecRow {
  id: string;
  no: number | string;
  operatingSystem: string;
  processor: string;
  ram: string;
  volumeHarddisk: string;
  softwareYangDiinstall: string;
  ipAddressHostname: string;
  tahunGoLive: string;
  eolDate: string;
  eosDate: string;
}

export interface LicenseRow {
  id: string;
  no: number | string;
  namaLicense: string;
  deskripsiFungsiLicense: string;
  qtyLicenseYangDibeli: string;
  qtyLicenseYangDiDeploy: string;
  serialNumberSku: string;
  versionSoftware: string;
  perpetualSubscription: string;
}

export interface LicensePrincipalRow {
  id: string;
  no: number | string;
  namaPrincipal: string;
  ipServer: string; // multi-line
  jangkaWaktuKontrak: string;
  jangkaWaktuLicense: string;
  tahunEol: string;
  tahunEos: string;
}

export interface SoftwareAppRow {
  id: string;
  no: number | string;
  namaAplikasi: string;
  deskripsiAplikasi: string;
  jenisAplikasi: string; // Application / Appliance / Tools
  kategoriServer: string; // Physical / Virtual / Cloud
  jenisServer: string; // Development dan Production / Prod / Dev
  loginAuth: string; // User Non AD / User AD / Non AD
  platformOsVersion: string;
  eosDateOs: string;
  databaseVersion: string;
  eosDateDb: string;
}

export interface SoftwareOwnerRow {
  id: string;
  no: number | string;
  divisiAppsOwnerUser: string;
  vendorPengembangAplikasi: string;
  namaPrincipal: string;
  tahunImplementasiGoLive: string;
  bahasaPemograman: string;
  kepemilikan: string; // Sewa / Beli Putus / Hak Penggunaan
  kepemilikanSourceCode: string; // BTN / Penyedia Jasa
  prosesBisnisYangDisupport: string;
  sistemFront: string; // Web / Dekstop / Mobile
}

export interface SoftwareIPRow {
  id: string;
  no: number | string;
  ipServerAppHostnameProduction: string;
  ipServerAppHostnameDevelopment: string;
  backupServerApp: string; // Realtime / Schedule / NA
  ipServerDbHostnameProduction: string;
  ipServerDbHostnameDevelopment: string;
  backupServerDb: string; // Realtime / Schedule / NA
}

export interface SignatureSlot {
  key: string;
  title: string;
  name: string;
  date: string;
  signatureDataUrl?: string; // transparent PNG base64
  signedByUserId?: string;
  signedAt?: string;
}

export interface FormAttachment {
  id: string;
  formId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string; // Base64 data for images or files
  driveFileId?: string;
  driveUrl?: string;
  order: number;
  uploadedAt: string;
}

export type FormStatus = 'Draft' | 'Submitted' | 'On Going' | 'Done' | 'Revision';

export interface FormDataRecord {
  id: string;
  registrationNo: string;
  registrationDate: string;
  status: FormStatus;
  revisionNotes?: string;

  createdByUserId: string;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;

  // Project Info
  kodeProyekTI: string;
  kodeAplikasi: string;
  noPKSTerbaru: string;
  namaProyekTI: string;
  pihakKedua: string;

  // 1. Hardware
  hardwareList: HardwareRow[];
  hardwareSpecList: HardwareSpecRow[];

  // 2. License
  licenseList: LicenseRow[];
  licensePrincipalList: LicensePrincipalRow[];

  // 3. Software
  softwareAppList: SoftwareAppRow[];
  softwareOwnerList: SoftwareOwnerRow[];
  softwareIPList: SoftwareIPRow[];

  // 4. Signatures
  disusunOleh: SignatureSlot;
  diverifikasiOleh: SignatureSlot[];
  disetujuiOleh: SignatureSlot[];

  // 5. Attachments
  attachments: FormAttachment[];
}

export interface SystemSettings {
  fonnteToken: string;
  fonnteSuperadminPhone: string;
  reminderTemplate: string;
  reminderCronSchedule: string; // e.g. "0 9 * * 1-5"
  defaultDiverifikasiSlots: { key: string; title: string }[];
  defaultDisetujuiSlots: { key: string; title: string }[];
}

export interface ReminderRecipient {
  id: string;
  name: string;
  whatsappNumber: string;
  slotKey: string;
  slotTitle: string;
  isActive: boolean;
}

export interface ReminderLog {
  id: string;
  timestamp: string;
  target: string;
  message: string;
  status: 'SUCCESS' | 'FAILED';
  response: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  details: string;
}
