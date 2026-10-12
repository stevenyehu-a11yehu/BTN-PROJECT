import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import bcrypt from 'bcryptjs';
import {
  User,
  FormDataRecord,
  SystemSettings,
  ReminderRecipient,
  ReminderLog,
  AuditLog,
  HardwareRow,
  HardwareSpecRow,
  LicenseRow,
  LicensePrincipalRow,
  SoftwareAppRow,
  SoftwareOwnerRow,
  SoftwareIPRow,
  SignatureSlot,
  FormAttachment,
} from '../../types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'database.json');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '16yW3FqOX_0jJy6jOxkV0U0CuutwokKlsASx5o9SPqR4';
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || '1NMHXWSGtZU5j-I9HBb9fabB-jU0w0HJk';

export interface DatabaseState {
  users: User[];
  forms: FormDataRecord[];
  settings: SystemSettings;
  reminderRecipients: ReminderRecipient[];
  reminderLogs: ReminderLog[];
  auditLogs: AuditLog[];
}

export class DatabaseManager {
  private state: DatabaseState = {
    users: [],
    forms: [],
    settings: {
      fonnteToken: process.env.FONNTE_TOKEN || '',
      fonnteSuperadminPhone: process.env.FONNTE_SUPERADMIN_PHONE || '081234567890',
      reminderTemplate:
        'Halo {nama}, formulir dokumentasi aset proyek "{nama_proyek}" ({kode_proyek}) dari vendor {vendor} membutuhkan tanda tangan Anda untuk slot: {slot_belum_ttd}. Silakan akses sistem: {link}',
      reminderCronSchedule: '0 9 * * 1-5', // Setiap Senin-Jumat pukul 09:00 WIB
      defaultDiverifikasiSlots: [
        { key: 'div_pm_btn', title: 'IT Project Manager BTN' },
        { key: 'div_qa', title: 'IT Quality Assurance' },
        { key: 'div_arch', title: 'Technology Architecture Specialist' },
        { key: 'div_cmdb', title: 'IT Asset Compliance & CMDB Specialist' },
      ],
      defaultDisetujuiSlots: [
        { key: 'appr_pm_dh', title: 'Department Head of IT Project Management' },
        { key: 'appr_qa_dh', title: 'Department Head of IT Quality Assurance' },
        { key: 'appr_ea_dh', title: 'Department Head of Enterprise Architecture & Innovation' },
        { key: 'appr_asset_dh', title: 'Department Head of IT Asset Management' },
      ],
    },
    reminderRecipients: [],
    reminderLogs: [],
    auditLogs: [],
  };

  private googleAuth: any = null;
  private sheetsApi: any = null;
  private driveApi: any = null;
  public isGoogleConnected: boolean = false;
  private isSaving: boolean = false;

  constructor() {
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public async init() {
    // 1. Try loading from local file cache first
    this.loadFromLocal();

    // 2. Try initializing Google APIs if service account is provided
    await this.initGoogleApis();

    // 3. If connected to Google Sheets, sync and auto-migrate sheets
    if (this.isGoogleConnected) {
      await this.autoMigrateSheets();
    }

    // 4. Seed default superadmin and example PDF form if empty
    await this.seedInitialData();

    // 5. Save state
    this.saveToLocal();
  }

  private loadFromLocal() {
    try {
      if (fs.existsSync(LOCAL_DB_FILE)) {
        const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.state = {
          ...this.state,
          ...parsed,
          settings: {
            ...this.state.settings,
            ...(parsed.settings || {}),
          },
        };
        console.log('[DB] Local database loaded successfully.');
      }
    } catch (err) {
      console.error('[DB] Failed to load local database:', err);
    }
  }

  public saveToLocal() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save local database:', err);
    }
  }

  private async initGoogleApis() {
    try {
      let credentialsJson: any = null;
      const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'credentials.json';
      const keyJsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

      if (keyJsonEnv) {
        credentialsJson = JSON.parse(keyJsonEnv);
      } else if (fs.existsSync(keyFile)) {
        credentialsJson = JSON.parse(fs.readFileSync(keyFile, 'utf-8'));
      }

      if (credentialsJson && credentialsJson.client_email && credentialsJson.private_key) {
        this.googleAuth = new google.auth.JWT({
          email: credentialsJson.client_email,
          key: credentialsJson.private_key,
          scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive',
          ],
        });

        await this.googleAuth.authorize();
        this.sheetsApi = google.sheets({ version: 'v4', auth: this.googleAuth });
        this.driveApi = google.drive({ version: 'v3', auth: this.googleAuth });
        this.isGoogleConnected = true;
        console.log(`[Google API] Connected successfully as ${credentialsJson.client_email}`);
      } else {
        console.log('[Google API] No service account credentials found. Running in resilient local storage mode.');
        this.isGoogleConnected = false;
      }
    } catch (err: any) {
      console.warn('[Google API] Service account authorization skipped or failed:', err.message);
      this.isGoogleConnected = false;
    }
  }

  private async autoMigrateSheets() {
    if (!this.sheetsApi || !SPREADSHEET_ID) return;

    try {
      const requiredSheets = [
        'Users',
        'Forms',
        'Hardware',
        'HardwareSpec',
        'License',
        'LicensePrincipal',
        'Software',
        'SoftwareOwner',
        'SoftwareIP',
        'Signatures',
        'Attachments',
        'Settings',
        'ReminderRecipients',
        'ReminderLogs',
        'AuditLog',
      ];

      const meta = await this.sheetsApi.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      const existingSheets = (meta.data.sheets || []).map((s: any) => s.properties.title);

      const requests: any[] = [];
      for (const sheetName of requiredSheets) {
        if (!existingSheets.includes(sheetName)) {
          requests.push({
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 30,
                  frozenRowCount: 1,
                },
              },
            },
          });
        }
      }

      if (requests.length > 0) {
        await this.sheetsApi.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: { requests },
        });
        console.log(`[Google Sheets] Created ${requests.length} missing sheets.`);
      }

      console.log('[Google Sheets] Auto-migration check completed.');
    } catch (err: any) {
      console.warn('[Google Sheets] Migration notice:', err.message);
    }
  }

  private async seedInitialData() {
    // 1. Seed Superadmin
    const defaultUsername = process.env.DEFAULT_SUPERADMIN_USERNAME || 'superadmin';
    const defaultPassword = process.env.DEFAULT_SUPERADMIN_PASSWORD || 'SuperAdmin123!';

    let admin = this.state.users.find((u) => u.username === defaultUsername);
    if (!admin) {
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      admin = {
        id: 'usr_superadmin',
        username: defaultUsername,
        passwordHash,
        role: 'superadmin',
        fullName: 'Super Administrator BTN',
        companyOrPosition: 'IT Asset & Architecture Div',
        whatsappNumber: '081234567890',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.state.users.push(admin);
      console.log(`[DB] Seeded default superadmin (${defaultUsername})`);
    }

    // Seed sample users for Vendor & BTN Management
    const sampleUsers = [
      {
        id: 'usr_vendor_wide',
        username: 'vendor_wide',
        password: 'Vendor123!',
        role: 'vendor' as const,
        fullName: 'Natasya Julianti',
        companyOrPosition: 'PT. Wide Technologies Indonesia / IT Project Manager',
        whatsappNumber: '08974847052',
        assignedSlot: 'IT Project Manager Vendor',
      },
      {
        id: 'usr_pm_btn',
        username: 'pm_btn',
        password: 'Btn123!',
        role: 'manajemen_btn' as const,
        fullName: 'Ratih Yulia P',
        companyOrPosition: 'Bank BTN / IT Project Manager',
        whatsappNumber: '081298765432',
        assignedSlot: 'IT Project Manager BTN',
      },
      {
        id: 'usr_qa_btn',
        username: 'qa_btn',
        password: 'Btn123!',
        role: 'manajemen_btn' as const,
        fullName: 'Muhammad Juliansyah Hartono',
        companyOrPosition: 'Bank BTN / IT Quality Assurance',
        whatsappNumber: '081298765433',
        assignedSlot: 'IT Quality Assurance',
      },
      {
        id: 'usr_arch_btn',
        username: 'arch_btn',
        password: 'Btn123!',
        role: 'manajemen_btn' as const,
        fullName: 'Rizal Firdaus',
        companyOrPosition: 'Bank BTN / Technology Architecture Specialist',
        whatsappNumber: '081298765434',
        assignedSlot: 'Technology Architecture Specialist',
      },
      {
        id: 'usr_cmdb_btn',
        username: 'cmdb_btn',
        password: 'Btn123!',
        role: 'manajemen_btn' as const,
        fullName: 'Thifal Atsiil',
        companyOrPosition: 'Bank BTN / IT Asset Compliance & CMDB Specialist',
        whatsappNumber: '081298765435',
        assignedSlot: 'IT Asset Compliance & CMDB Specialist',
      },
      {
        id: 'usr_dh_pm',
        username: 'dh_pm',
        password: 'Btn123!',
        role: 'manajemen_btn' as const,
        fullName: 'I Nyoman Hermawan',
        companyOrPosition: 'Bank BTN / Dept Head IT Project Management',
        whatsappNumber: '081298765436',
        assignedSlot: 'Department Head of IT Project Management',
      },
      {
        id: 'usr_dh_qa',
        username: 'dh_qa',
        password: 'Btn123!',
        role: 'manajemen_btn' as const,
        fullName: 'Aditya Prasetya Putra',
        companyOrPosition: 'Bank BTN / Dept Head IT Quality Assurance',
        whatsappNumber: '081298765437',
        assignedSlot: 'Department Head of IT Quality Assurance',
      },
      {
        id: 'usr_dh_ea',
        username: 'dh_ea',
        password: 'Btn123!',
        role: 'manajemen_btn' as const,
        fullName: 'Muhammad Muhajir',
        companyOrPosition: 'Bank BTN / Dept Head Enterprise Architecture & Innovation',
        whatsappNumber: '081298765438',
        assignedSlot: 'Department Head of Enterprise Architecture & Innovation',
      },
      {
        id: 'usr_dh_asset',
        username: 'dh_asset',
        password: 'Btn123!',
        role: 'manajemen_btn' as const,
        fullName: 'Weny Wiastri',
        companyOrPosition: 'Bank BTN / Dept Head IT Asset Management',
        whatsappNumber: '081298765439',
        assignedSlot: 'Department Head of IT Asset Management',
      },
    ];

    for (const su of sampleUsers) {
      if (!this.state.users.some((u) => u.username === su.username)) {
        const hash = await bcrypt.hash(su.password, 10);
        this.state.users.push({
          id: su.id,
          username: su.username,
          passwordHash: hash,
          role: su.role,
          fullName: su.fullName,
          companyOrPosition: su.companyOrPosition,
          whatsappNumber: su.whatsappNumber,
          assignedSlot: su.assignedSlot,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 2. Seed Reminder Recipients if empty
    if (this.state.reminderRecipients.length === 0) {
      this.state.reminderRecipients = [
        {
          id: 'rec_1',
          name: 'Ratih Yulia P',
          whatsappNumber: '081298765432',
          slotKey: 'div_pm_btn',
          slotTitle: 'IT Project Manager BTN',
          isActive: true,
        },
        {
          id: 'rec_2',
          name: 'Muhammad Juliansyah Hartono',
          whatsappNumber: '081298765433',
          slotKey: 'div_qa',
          slotTitle: 'IT Quality Assurance',
          isActive: true,
        },
        {
          id: 'rec_3',
          name: 'Rizal Firdaus',
          whatsappNumber: '081298765434',
          slotKey: 'div_arch',
          slotTitle: 'Technology Architecture Specialist',
          isActive: true,
        },
        {
          id: 'rec_4',
          name: 'Thifal Atsiil',
          whatsappNumber: '081298765435',
          slotKey: 'div_cmdb',
          slotTitle: 'IT Asset Compliance & CMDB Specialist',
          isActive: true,
        },
        {
          id: 'rec_5',
          name: 'I Nyoman Hermawan',
          whatsappNumber: '081298765436',
          slotKey: 'appr_pm_dh',
          slotTitle: 'Department Head of IT Project Management',
          isActive: true,
        },
      ];
    }

    // 3. Seed Example PDF Form (1:1 identical with user attachment) if no forms exist
    if (this.state.forms.length === 0) {
      const exampleForm: FormDataRecord = {
        id: 'form_btn_example_001',
        registrationNo: 'REG/ITAP/2026/001',
        registrationDate: '12 Oktober 2026',
        status: 'On Going',
        createdByUserId: 'usr_vendor_wide',
        createdByUsername: 'vendor_wide',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        kodeProyekTI: '2440583509OU',
        kodeAplikasi: 'CASH',
        noPKSTerbaru: '161/PKS/ITPD/2023',
        namaProyekTI:
          'Order Penggunaan Kontrak Payung Mandays Pengembangan IB dan CMS 2023-2024 – Pengembangan CMS Bill Payment Pegadaian',
        pihakKedua: 'PT. Wide Technologies Indonesia',

        // 1. Hardware (In PDF example, all N/A)
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

        // 2. License
        licenseList: [
          {
            id: 'lic_1',
            no: 1,
            namaLicense: 'Primecash License DC',
            deskripsiFungsiLicense: 'Hak Guna Aplikasi Primecash ke BTN',
            qtyLicenseYangDibeli: 'Primecash Corporate: 2\nPrimecash Individual: 2',
            qtyLicenseYangDiDeploy: 'Primecash Corporate: 2\nPrimecash Individual: 2',
            serialNumberSku: 'SL- 1021X5-26PDC',
            versionSoftware: 'Primecash 5',
            perpetualSubscription: 'Perpetual with ATS',
          },
          {
            id: 'lic_2',
            no: 2,
            namaLicense: 'Primecash License DRC',
            deskripsiFungsiLicense: 'Hak Guna Aplikasi Primecash ke BTN',
            qtyLicenseYangDibeli: 'Primecash Corporate: 2\nPrimecash Individual: 2',
            qtyLicenseYangDiDeploy: 'Primecash Corporate: 2\nPrimecash Individual: 2',
            serialNumberSku: 'SL- 1021X5-26PDRC',
            versionSoftware: 'Primecash 5',
            perpetualSubscription: 'Perpetual with ATS',
          },
        ],
        licensePrincipalList: [
          {
            id: 'prn_1',
            no: 1,
            namaPrincipal: 'Wide Techologies Indonesia',
            ipServer: '172.17.5.6\n172.17.5.7\n172.17.5.8\n172.17.5.9',
            jangkaWaktuKontrak: '28 Desember 2025 – 27 Dezember 2026',
            jangkaWaktuLicense: '28 Desember 2025 – 27 Desember 2026',
            tahunEol: 'N/A',
            tahunEos: 'N/A',
          },
          {
            id: 'prn_2',
            no: 2,
            namaPrincipal: 'Wide Techologies Indonesia',
            ipServer: '172.19.5.6\n172.19.5.7\n172.19.5.8\n172.19.5.9',
            jangkaWaktuKontrak: '28 Desember 2025 – 27 Dezember 2026',
            jangkaWaktuLicense: '28 Desember 2025 – 27 Desember 2026',
            tahunEol: 'N/A',
            tahunEos: 'N/A',
          },
        ],

        // 3. Software
        softwareAppList: [
          {
            id: 'app_1',
            no: 1,
            namaAplikasi: 'Bale Korpora',
            deskripsiAplikasi:
              'Bale Korpora adalah layanan yang disediakan oleh perbankan bagi institusi atau perusahan untuk mengelola dan melakukan transaksi perbankan secara online dan real time 24 jam per hari.',
            jenisAplikasi: 'Application',
            kategoriServer: 'Physical',
            jenisServer: 'Development dan Production',
            loginAuth: 'User Non AD',
            platformOsVersion: 'Redhat Enterprise Linux 8.10',
            eosDateOs: '31 May 2029\nhttps://endoflife.date/rhel',
            databaseVersion: 'Oracle Database 19c',
            eosDateDb: '31 Dec 2032\nhttps://endoflife.date/oracle-database',
          },
        ],
        softwareOwnerList: [
          {
            id: 'sown_1',
            no: 1,
            divisiAppsOwnerUser: 'WTD',
            vendorPengembangAplikasi: 'PT. Wide Techologies Indonesia',
            namaPrincipal: 'PT. Wide Techologies Indonesia',
            tahunImplementasiGoLive: '2025',
            bahasaPemograman: 'JDK 1.8',
            kepemilikan: 'Beli Putus',
            kepemilikanSourceCode: 'Penyedia Jasa',
            prosesBisnisYangDisupport: 'Cash Management System',
            sistemFront: 'Web',
          },
        ],
        softwareIPList: [
          {
            id: 'sip_1',
            no: 1,
            ipServerAppHostnameProduction: `DC\nWeb Production :\n172.17.4.6 (Node1)\n172.17.4.7 (Node2)\nApp Production :\n172.17.5.6 (Node1)\n172.17.5.7 (Node2)\n172.17.5.8 (Node3)\n172.17.5.9 (Node4)\n\nDRC\nWeb Production :\n172.19.4.6 (Node1)\n172.19.4.7 (Node2)\nApp Production :\n172.19.5.6 (Node1)\n172.19.5.7 (Node2)\n172.19.5.8 (Node3)\n172.19.5.9 (Node4)`,
            ipServerAppHostnameDevelopment: '172.16.2.205 (DC)',
            backupServerApp: 'Schedule',
            ipServerDbHostnameProduction: `DB Production DC\n172.17.3.6 (Node1)\n172.17.3.7 (Node2)\n\nDB Production DRC\n172.17.3.6 (Node1)\n172.17.3.7 (Node2)`,
            ipServerDbHostnameDevelopment: `DB Development :\n172.16.2.205\n(DC)`,
            backupServerDb: 'Realtime',
          },
        ],

        // 4. Signatures
        disusunOleh: {
          key: 'vendor_prep',
          title: 'IT Project Manager Vendor',
          name: 'Natasya Julianti',
          date: '12/10/2026',
          // Sample placeholder signature
          signatureDataUrl:
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70" viewBox="0 0 160 70"><path d="M 20 50 Q 40 10 60 45 T 100 25 T 140 45" fill="none" stroke="%23334155" stroke-width="2.5" stroke-linecap="round"/></svg>',
          signedByUserId: 'usr_vendor_wide',
        },
        diverifikasiOleh: [
          {
            key: 'div_pm_btn',
            title: 'IT Project Manager BTN',
            name: 'Ratih Yulia P',
            date: '',
          },
          {
            key: 'div_qa',
            title: 'IT Quality Assurance',
            name: 'Muhammad Juliansyah Hartono',
            date: '',
          },
          {
            key: 'div_arch',
            title: 'Technology Architecture Specialist',
            name: 'Rizal Firdaus',
            date: '',
          },
          {
            key: 'div_cmdb',
            title: 'IT Asset Compliance & CMDB Specialist',
            name: 'Thifal Atsiil',
            date: '',
          },
        ],
        disetujuiOleh: [
          {
            key: 'appr_pm_dh',
            title: 'Department Head of IT Project Management',
            name: 'I Nyoman Hermawan',
            date: '',
          },
          {
            key: 'appr_qa_dh',
            title: 'Department Head of IT Quality Assurance',
            name: 'Aditya Prasetya Putra',
            date: '',
          },
          {
            key: 'appr_ea_dh',
            title: 'Department Head of Enterprise Architecture & Innovation',
            name: 'Muhammad Muhajir',
            date: '',
          },
          {
            key: 'appr_asset_dh',
            title: 'Department Head of IT Asset Management',
            name: 'Weny Wiastri',
            date: '',
          },
        ],

        // Attachments
        attachments: [
          {
            id: 'att_cert_dc',
            formId: 'form_btn_example_001',
            fileName: 'Software_License_Certificate_DC.png',
            fileType: 'image/png',
            fileSize: 102400,
            order: 1,
            uploadedAt: new Date().toISOString(),
            dataUrl: '', // Will generate clean certificate SVG dataUrl below
          },
          {
            id: 'att_cert_drc',
            formId: 'form_btn_example_001',
            fileName: 'Software_License_Certificate_DRC.png',
            fileType: 'image/png',
            fileSize: 102400,
            order: 2,
            uploadedAt: new Date().toISOString(),
            dataUrl: '',
          },
        ],
      };

      // Generate accurate sample certificate images matching the PDF attachment
      exampleForm.attachments[0].dataUrl = generateCertificateDataUrl('SL- 1021X5-26PDC', 'Data Recovery Center');
      exampleForm.attachments[1].dataUrl = generateCertificateDataUrl('SL- 1021X5-26PDRC', 'Data Center');

      this.state.forms.push(exampleForm);
      console.log('[DB] Seeded example form matching attachment PDF.');
    }
  }

  // Users methods
  public getUsers(): User[] {
    return this.state.users.map((u) => {
      const { passwordHash, ...rest } = u;
      return rest as User;
    });
  }

  public async getUserById(id: string): Promise<User | undefined> {
    return this.state.users.find((u) => u.id === id);
  }

  public async getUserByUsername(username: string): Promise<User | undefined> {
    return this.state.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  public async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: userData.username,
      passwordHash,
      role: userData.role,
      fullName: userData.fullName,
      companyOrPosition: userData.companyOrPosition,
      whatsappNumber: userData.whatsappNumber,
      assignedSlot: userData.assignedSlot,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.saveToLocal();
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<User> & { password?: string }): Promise<User | null> {
    const userIndex = this.state.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    const user = this.state.users[userIndex];
    if (updates.password) {
      user.passwordHash = await bcrypt.hash(updates.password, 10);
    }
    if (updates.fullName !== undefined) user.fullName = updates.fullName;
    if (updates.companyOrPosition !== undefined) user.companyOrPosition = updates.companyOrPosition;
    if (updates.whatsappNumber !== undefined) user.whatsappNumber = updates.whatsappNumber;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.assignedSlot !== undefined) user.assignedSlot = updates.assignedSlot;
    if (updates.isActive !== undefined) user.isActive = updates.isActive;
    user.updatedAt = new Date().toISOString();

    this.saveToLocal();
    return user;
  }

  public async deleteUser(id: string): Promise<boolean> {
    const idx = this.state.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.state.users.splice(idx, 1);
    this.saveToLocal();
    return true;
  }

  // Forms methods
  public getForms(user?: { id: string; role: string; assignedSlot?: string }): FormDataRecord[] {
    if (!user || user.role === 'superadmin') {
      return this.state.forms;
    }
    if (user.role === 'vendor') {
      return this.state.forms.filter((f) => f.createdByUserId === user.id);
    }
    if (user.role === 'manajemen_btn') {
      // Manajemen BTN sees all submitted or ongoing forms where their review/signature is needed
      return this.state.forms.filter((f) => f.status !== 'Draft');
    }
    return [];
  }

  public getFormById(id: string): FormDataRecord | undefined {
    return this.state.forms.find((f) => f.id === id);
  }

  public async createForm(formData: Partial<FormDataRecord>, user: { id: string; username: string }): Promise<FormDataRecord> {
    const year = new Date().getFullYear();
    const count = this.state.forms.length + 1;
    const regNo = `REG/ITAP/${year}/${String(count).padStart(3, '0')}`;
    const todayStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date());

    const newForm: FormDataRecord = {
      id: `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      registrationNo: regNo,
      registrationDate: todayStr,
      status: formData.status || 'Draft',
      createdByUserId: user.id,
      createdByUsername: user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      kodeProyekTI: formData.kodeProyekTI || '',
      kodeAplikasi: formData.kodeAplikasi || '',
      noPKSTerbaru: formData.noPKSTerbaru || '',
      namaProyekTI: formData.namaProyekTI || '',
      pihakKedua: formData.pihakKedua || '',

      hardwareList: formData.hardwareList || [],
      hardwareSpecList: formData.hardwareSpecList || [],
      licenseList: formData.licenseList || [],
      licensePrincipalList: formData.licensePrincipalList || [],
      softwareAppList: formData.softwareAppList || [],
      softwareOwnerList: formData.softwareOwnerList || [],
      softwareIPList: formData.softwareIPList || [],

      disusunOleh: formData.disusunOleh || {
        key: 'vendor_prep',
        title: 'IT Project Manager Vendor',
        name: '',
        date: '',
      },
      diverifikasiOleh:
        formData.diverifikasiOleh ||
        this.state.settings.defaultDiverifikasiSlots.map((s) => ({
          key: s.key,
          title: s.title,
          name: '',
          date: '',
        })),
      disetujuiOleh:
        formData.disetujuiOleh ||
        this.state.settings.defaultDisetujuiSlots.map((s) => ({
          key: s.key,
          title: s.title,
          name: '',
          date: '',
        })),
      attachments: formData.attachments || [],
    };

    this.state.forms.push(newForm);
    this.saveToLocal();
    return newForm;
  }

  public async updateForm(id: string, updates: Partial<FormDataRecord>): Promise<FormDataRecord | null> {
    const idx = this.state.forms.findIndex((f) => f.id === id);
    if (idx === -1) return null;

    const current = this.state.forms[idx];
    this.state.forms[idx] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToLocal();
    return this.state.forms[idx];
  }

  public async deleteForm(id: string): Promise<boolean> {
    const idx = this.state.forms.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.state.forms.splice(idx, 1);
    this.saveToLocal();
    return true;
  }

  // Settings
  public getSettings(): SystemSettings {
    return this.state.settings;
  }

  public async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    this.state.settings = {
      ...this.state.settings,
      ...updates,
    };
    this.saveToLocal();
    return this.state.settings;
  }

  // Reminder Recipients
  public getReminderRecipients(): ReminderRecipient[] {
    return this.state.reminderRecipients;
  }

  public async saveReminderRecipient(rec: ReminderRecipient): Promise<ReminderRecipient> {
    const idx = this.state.reminderRecipients.findIndex((r) => r.id === rec.id);
    if (idx >= 0) {
      this.state.reminderRecipients[idx] = rec;
    } else {
      rec.id = `rec_${Date.now()}`;
      this.state.reminderRecipients.push(rec);
    }
    this.saveToLocal();
    return rec;
  }

  public async deleteReminderRecipient(id: string): Promise<boolean> {
    const idx = this.state.reminderRecipients.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.state.reminderRecipients.splice(idx, 1);
    this.saveToLocal();
    return true;
  }

  // Reminder Logs
  public getReminderLogs(): ReminderLog[] {
    return this.state.reminderLogs.slice(-200).reverse();
  }

  public async addReminderLog(log: Omit<ReminderLog, 'id' | 'timestamp'>): Promise<ReminderLog> {
    const newLog: ReminderLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.state.reminderLogs.push(newLog);
    this.saveToLocal();
    return newLog;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs.slice(-300).reverse();
  }

  public async logAudit(userId: string, username: string, action: string, details: string) {
    const entry: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      username,
      action,
      details,
    };
    this.state.auditLogs.push(entry);
    this.saveToLocal();
  }
}

export const db = new DatabaseManager();

// Helper to generate a realistic SVG Software License Certificate matching the user's attachment
function generateCertificateDataUrl(certNumber: string, dcType: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1130" viewBox="0 0 800 1130" style="background:white; font-family:'Segoe UI',Roboto,sans-serif;">
    <!-- Gold / Blue Border Deco -->
    <rect x="25" y="25" width="750" height="1080" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
    <path d="M 25 25 L 180 25 L 25 180 Z" fill="#b8860b" opacity="0.85"/>
    <path d="M 25 25 L 140 25 L 25 140 Z" fill="#002d62"/>
    <path d="M 775 1105 L 620 1105 L 775 950 Z" fill="#b8860b" opacity="0.85"/>
    <path d="M 775 1105 L 660 1105 L 775 990 Z" fill="#002d62"/>

    <!-- Seal Logo -->
    <circle cx="680" cy="180" r="48" fill="#fdfbf7" stroke="#b8860b" stroke-width="4"/>
    <circle cx="680" cy="180" r="40" fill="none" stroke="#d4af37" stroke-width="1.5" stroke-dasharray="3 3"/>
    <text x="680" y="186" text-anchor="middle" font-size="16" font-weight="bold" fill="#002d62">WIDE</text>

    <!-- Header Titles -->
    <text x="400" y="190" text-anchor="middle" font-size="34" font-weight="bold" fill="#b8860b" letter-spacing="1">Software License</text>
    <text x="400" y="235" text-anchor="middle" font-size="36" font-weight="bold" fill="#b8860b" letter-spacing="1">Certificate</text>

    <!-- Subtitle -->
    <text x="400" y="320" text-anchor="middle" font-size="15" fill="#333">PT Wide Technologies Indonesia, hereby, certifies the source code license for</text>
    <text x="400" y="350" text-anchor="middle" font-size="17" font-weight="bold" fill="#002d62">PT. Bank Tabungan Negara (Persero) Tbk.</text>

    <!-- Cert Details Box -->
    <text x="400" y="420" text-anchor="middle" font-size="13" font-weight="bold" fill="#333">Certificate Number: ${certNumber}</text>

    <!-- Table -->
    <rect x="150" y="445" width="500" height="32" fill="#005a9c"/>
    <text x="280" y="466" text-anchor="middle" font-size="12" font-weight="bold" fill="white">Software</text>
    <text x="520" y="466" text-anchor="middle" font-size="12" font-weight="bold" fill="white">Number of License</text>

    <rect x="150" y="477" width="500" height="85" fill="none" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="400" y1="477" x2="400" y2="562" stroke="#cbd5e1" stroke-width="1"/>

    <text x="170" y="505" font-size="12" font-weight="bold" fill="#333">${dcType}</text>
    <text x="180" y="525" font-size="11" fill="#555">&#8226; Primecash Corporate</text>
    <text x="180" y="545" font-size="11" fill="#555">&#8226; Primecash Individual</text>

    <text x="530" y="525" text-anchor="middle" font-size="11" fill="#555">2 Licenses</text>
    <text x="530" y="545" text-anchor="middle" font-size="11" fill="#555">2 Licenses</text>

    <text x="150" y="585" font-size="10" fill="#777">December 28th 2025 - December 27th 2026</text>
    <text x="650" y="585" text-anchor="end" font-size="10" fill="#777">*1 License = 4 Core</text>

    <text x="620" y="650" text-anchor="middle" font-size="12" fill="#333">Jakarta, December 28th 2025</text>

    <!-- Signature -->
    <line x1="530" y1="730" x2="710" y2="730" stroke="#333" stroke-width="1"/>
    <text x="620" y="746" text-anchor="middle" font-size="13" font-weight="bold" fill="#002d62">Hadi Surawijaya</text>
    <text x="620" y="762" text-anchor="middle" font-size="11" fill="#555">Director</text>

    <!-- Footer Address -->
    <text x="80" y="725" font-size="11" font-weight="bold" fill="#002d62">PT Wide Technologies Indonesia</text>
    <text x="80" y="742" font-size="9" fill="#666">International Financial Centre, Tower 2, 15th Floor</text>
    <text x="80" y="756" font-size="9" fill="#666">Jl. Jend. Sudirman Kav 22-23, Jakarta, 12920, Indonesia</text>
    <text x="80" y="770" font-size="9" fill="#666">Phone: +6221 8062 3840</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
