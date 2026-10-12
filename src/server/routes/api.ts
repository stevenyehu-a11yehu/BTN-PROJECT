import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import {
  validateIndonesianPhoneNumber,
  sendFonnteMessage,
  notifySuperadminOnVendorSubmit,
  sendFormReminders,
} from '../fonnte.js';
import { generateWordDocument } from '../export/word.js';
import { renderForm1to1Html } from '../export/pdfHtml.js';
import { FormDataRecord, User } from '../../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'btn-it-asset-doc-system-super-secure-key-2026-prod';

export const apiRouter = Router();

// Middleware: Authenticate JWT
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: 'vendor' | 'superadmin' | 'manajemen_btn';
    fullName: string;
    assignedSlot?: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid atau telah kedaluwarsa.' });
  }
}

export function requireSuperadmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Akses ditolak. Menu ini khusus Superadmin.' });
  }
  next();
}

// ==========================================
// AUTHENTICATION
// ==========================================
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  const user = await db.getUserByUsername(username);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Username atau password salah atau akun nonaktif.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash || '');
  if (!isMatch) {
    return res.status(401).json({ error: 'Username atau password salah.' });
  }

  const tokenPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    assignedSlot: user.assignedSlot,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  await db.logAudit(user.id, user.username, 'LOGIN', `Pengguna ${user.fullName} berhasil masuk.`);

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      companyOrPosition: user.companyOrPosition,
      whatsappNumber: user.whatsappNumber,
      assignedSlot: user.assignedSlot,
    },
  });
});

apiRouter.get('/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await db.getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User tidak ditemukan.' });
  }
  return res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      companyOrPosition: user.companyOrPosition,
      whatsappNumber: user.whatsappNumber,
      assignedSlot: user.assignedSlot,
    },
  });
});

// ==========================================
// USER MANAGEMENT (Superadmin)
// ==========================================
apiRouter.get('/users', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const users = db.getUsers();
  return res.json({ users });
});

apiRouter.post('/users', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const { username, password, role, fullName, companyOrPosition, whatsappNumber, assignedSlot } = req.body;

  if (!username || !password || !role || !fullName || !whatsappNumber) {
    return res.status(400).json({ error: 'Semua kolom wajib diisi.' });
  }

  // Validate Indonesian Phone 08xxx
  const phoneVal = validateIndonesianPhoneNumber(whatsappNumber);
  if (!phoneVal.isValid) {
    return res.status(400).json({ error: phoneVal.error });
  }

  const existing = await db.getUserByUsername(username);
  if (existing) {
    return res.status(400).json({ error: `Username "${username}" sudah digunakan.` });
  }

  const created = await db.createUser({
    username,
    password,
    role,
    fullName,
    companyOrPosition: companyOrPosition || '',
    whatsappNumber: phoneVal.cleanPhone!,
    assignedSlot: assignedSlot || '',
    isActive: true,
  });

  await db.logAudit(req.user!.id, req.user!.username, 'CREATE_USER', `Membuat akun user ${username} (${role})`);

  const { passwordHash, ...userSafe } = created;
  return res.status(201).json({ user: userSafe });
});

apiRouter.put('/users/:id', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { fullName, companyOrPosition, whatsappNumber, role, assignedSlot, isActive, password } = req.body;

  let cleanPhone = whatsappNumber;
  if (whatsappNumber) {
    const phoneVal = validateIndonesianPhoneNumber(whatsappNumber);
    if (!phoneVal.isValid) {
      return res.status(400).json({ error: phoneVal.error });
    }
    cleanPhone = phoneVal.cleanPhone;
  }

  const updated = await db.updateUser(id, {
    fullName,
    companyOrPosition,
    whatsappNumber: cleanPhone,
    role,
    assignedSlot,
    isActive,
    password,
  });

  if (!updated) {
    return res.status(404).json({ error: 'User tidak ditemukan.' });
  }

  await db.logAudit(req.user!.id, req.user!.username, 'UPDATE_USER', `Memperbarui user ${updated.username}`);

  const { passwordHash, ...userSafe } = updated;
  return res.json({ user: userSafe });
});

apiRouter.delete('/users/:id', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.user?.id) {
    return res.status(400).json({ error: 'Tidak dapat menghapus akun Anda sendiri.' });
  }

  const success = await db.deleteUser(id);
  if (!success) {
    return res.status(404).json({ error: 'User tidak ditemukan.' });
  }

  await db.logAudit(req.user!.id, req.user!.username, 'DELETE_USER', `Menghapus user ID ${id}`);
  return res.json({ success: true, message: 'User berhasil dihapus.' });
});

// ==========================================
// FORMS MANAGEMENT
// ==========================================
apiRouter.get('/forms', authMiddleware, async (req: AuthRequest, res: Response) => {
  const forms = db.getForms(req.user);
  return res.json({ forms });
});

apiRouter.get('/forms/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  // Access check
  if (req.user?.role === 'vendor' && form.createdByUserId !== req.user.id) {
    return res.status(403).json({ error: 'Anda tidak memiliki hak akses ke formulir ini.' });
  }

  return res.json({ form });
});

apiRouter.post('/forms', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'vendor' && req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Hanya Vendor atau Superadmin yang dapat membuat formulir baru.' });
  }

  const form = await db.createForm(req.body, { id: req.user.id, username: req.user.username });
  await db.logAudit(
    req.user.id,
    req.user.username,
    'CREATE_FORM',
    `Membuat form baru: ${form.namaProyekTI || form.registrationNo}`
  );

  return res.status(201).json({ form });
});

apiRouter.put('/forms/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  // Check editing rights
  if (req.user?.role === 'vendor') {
    if (form.createdByUserId !== req.user.id) {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }
    if (form.status !== 'Draft' && form.status !== 'Revision') {
      return res.status(400).json({
        error: 'Formulir telah disubmit dan terkunci. Hanya Superadmin yang dapat mengedit atau silakan hubungi admin.',
      });
    }
  }

  const updated = await db.updateForm(req.params.id, req.body);
  await db.logAudit(
    req.user!.id,
    req.user!.username,
    'UPDATE_FORM',
    `Memperbarui formulir ${form.registrationNo} (${form.namaProyekTI})`
  );

  return res.json({ form: updated });
});

apiRouter.delete('/forms/:id', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  await db.deleteForm(req.params.id);
  await db.logAudit(
    req.user!.id,
    req.user!.username,
    'DELETE_FORM',
    `Menghapus formulir ${form.registrationNo} (${form.namaProyekTI})`
  );

  return res.json({ success: true, message: 'Formulir berhasil dihapus.' });
});

// Submit Form (Vendor or Superadmin)
apiRouter.post('/forms/:id/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  if (req.user?.role === 'vendor' && form.createdByUserId !== req.user.id) {
    return res.status(403).json({ error: 'Akses ditolak.' });
  }

  // Update status to 'Submitted' or 'On Going'
  const newStatus = 'On Going';
  const updated = await db.updateForm(req.params.id, {
    status: newStatus,
    registrationDate: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date()),
  });

  await db.logAudit(
    req.user!.id,
    req.user!.username,
    'SUBMIT_FORM',
    `Form ${form.registrationNo} disubmit oleh ${req.user!.fullName}. Status menjadi On Going.`
  );

  // Trigger WhatsApp event notification to Superadmin
  try {
    if (updated) {
      await notifySuperadminOnVendorSubmit(updated);
    }
  } catch (waErr) {
    console.error('[Submit WA Error]', waErr);
  }

  return res.json({ success: true, form: updated, message: 'Formulir berhasil disubmit dan notifikasi telah dikirim.' });
});

// Change Status (Superadmin only) e.g. mark Done, On Going, Revision
apiRouter.post('/forms/:id/status', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const { status, revisionNotes } = req.body;
  if (!['Draft', 'Submitted', 'On Going', 'Done', 'Revision'].includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid.' });
  }

  const updated = await db.updateForm(req.params.id, {
    status,
    revisionNotes: revisionNotes || '',
  });

  if (!updated) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  await db.logAudit(
    req.user!.id,
    req.user!.username,
    'CHANGE_STATUS',
    `Status formulir ${updated.registrationNo} diubah menjadi "${status}".`
  );

  return res.json({ success: true, form: updated });
});

// Reject / Request Revision (Manajemen BTN)
apiRouter.post('/forms/:id/reject', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { notes } = req.body;
  if (req.user?.role !== 'manajemen_btn' && req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Hanya Manajemen BTN atau Superadmin yang dapat meminta revisi.' });
  }

  const updated = await db.updateForm(req.params.id, {
    status: 'Revision',
    revisionNotes: notes || 'Permintaan revisi dari manajemen BTN',
  });

  if (!updated) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  await db.logAudit(
    req.user!.id,
    req.user!.username,
    'REVISION_REQUEST',
    `Meminta revisi form ${updated.registrationNo}: ${notes}`
  );

  return res.json({ success: true, form: updated, message: 'Permintaan revisi berhasil dikirim ke Vendor.' });
});

// Sign a specific slot
apiRouter.post('/forms/:id/sign', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { slotType, slotKey, name, title, signatureDataUrl } = req.body;
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  const todayStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date());

  if (slotType === 'disusunOleh') {
    if (req.user?.role !== 'vendor' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Hanya Vendor atau Superadmin yang dapat mengisi slot Disusun Oleh.' });
    }
    form.disusunOleh = {
      ...form.disusunOleh,
      name: name || form.disusunOleh.name,
      title: title || form.disusunOleh.title,
      signatureDataUrl: signatureDataUrl || form.disusunOleh.signatureDataUrl,
      date: todayStr,
      signedByUserId: req.user.id,
      signedAt: new Date().toISOString(),
    };
  } else if (slotType === 'diverifikasiOleh') {
    const slotIdx = form.diverifikasiOleh.findIndex((s) => s.key === slotKey);
    if (slotIdx >= 0) {
      form.diverifikasiOleh[slotIdx] = {
        ...form.diverifikasiOleh[slotIdx],
        name: name || req.user?.fullName || form.diverifikasiOleh[slotIdx].name,
        title: title || form.diverifikasiOleh[slotIdx].title,
        signatureDataUrl: signatureDataUrl || form.diverifikasiOleh[slotIdx].signatureDataUrl,
        date: todayStr,
        signedByUserId: req.user?.id,
        signedAt: new Date().toISOString(),
      };
    }
  } else if (slotType === 'disetujuiOleh') {
    const slotIdx = form.disetujuiOleh.findIndex((s) => s.key === slotKey);
    if (slotIdx >= 0) {
      form.disetujuiOleh[slotIdx] = {
        ...form.disetujuiOleh[slotIdx],
        name: name || req.user?.fullName || form.disetujuiOleh[slotIdx].name,
        title: title || form.disetujuiOleh[slotIdx].title,
        signatureDataUrl: signatureDataUrl || form.disetujuiOleh[slotIdx].signatureDataUrl,
        date: todayStr,
        signedByUserId: req.user?.id,
        signedAt: new Date().toISOString(),
      };
    }
  }

  const updated = await db.updateForm(req.params.id, form);
  await db.logAudit(
    req.user!.id,
    req.user!.username,
    'SIGN_FORM',
    `Menandatangani slot "${title || slotKey}" pada formulir ${form.registrationNo}`
  );

  return res.json({ success: true, form: updated, message: 'Tanda tangan berhasil disimpan.' });
});

// Superadmin Direct Fill ("Isi Langsung & Simpan")
apiRouter.post('/forms/:id/direct-fill', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const { diverifikasiOleh, disetujuiOleh } = req.body;
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  const todayStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date());

  if (diverifikasiOleh && Array.isArray(diverifikasiOleh)) {
    form.diverifikasiOleh = diverifikasiOleh.map((item) => ({
      ...item,
      date: item.date || (item.name ? todayStr : ''),
    }));
  }

  if (disetujuiOleh && Array.isArray(disetujuiOleh)) {
    form.disetujuiOleh = disetujuiOleh.map((item) => ({
      ...item,
      date: item.date || (item.name ? todayStr : ''),
    }));
  }

  const updated = await db.updateForm(req.params.id, form);
  await db.logAudit(
    req.user!.id,
    req.user!.username,
    'DIRECT_FILL_SIGNATURES',
    `Superadmin melakukan Isi Langsung & Simpan slot verifikasi/persetujuan pada form ${form.registrationNo}`
  );

  return res.json({ success: true, form: updated, message: 'Data pejabat & tanda tangan berhasil disimpan langsung.' });
});

// ==========================================
// ATTACHMENTS (Images, PDF, Excel, Clipboard)
// ==========================================
apiRouter.post('/forms/:id/attachments', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { fileName, fileType, fileSize, dataUrl } = req.body;
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  if (!fileName || !dataUrl) {
    return res.status(400).json({ error: 'File data atau nama file tidak valid.' });
  }

  const newAttachment = {
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    formId: req.params.id,
    fileName,
    fileType: fileType || 'image/png',
    fileSize: fileSize || Math.round(dataUrl.length * 0.75),
    dataUrl,
    order: (form.attachments || []).length + 1,
    uploadedAt: new Date().toISOString(),
  };

  form.attachments = [...(form.attachments || []), newAttachment];
  const updated = await db.updateForm(req.params.id, { attachments: form.attachments });

  await db.logAudit(
    req.user!.id,
    req.user!.username,
    'UPLOAD_ATTACHMENT',
    `Mengunggah lampiran "${fileName}" pada form ${form.registrationNo}`
  );

  return res.status(201).json({ success: true, attachment: newAttachment, form: updated });
});

apiRouter.delete('/forms/:id/attachments/:attachmentId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  form.attachments = (form.attachments || []).filter((a) => a.id !== req.params.attachmentId);
  const updated = await db.updateForm(req.params.id, { attachments: form.attachments });

  return res.json({ success: true, form: updated, message: 'Lampiran berhasil dihapus.' });
});

apiRouter.put('/forms/:id/attachments/reorder', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { orderedIds } = req.body;
  const form = db.getFormById(req.params.id);
  if (!form || !Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'Data tidak valid.' });
  }

  const map = new Map((form.attachments || []).map((a) => [a.id, a]));
  const reordered: any[] = [];

  orderedIds.forEach((id, idx) => {
    const item = map.get(id);
    if (item) {
      item.order = idx + 1;
      reordered.push(item);
    }
  });

  const updated = await db.updateForm(req.params.id, { attachments: reordered });
  return res.json({ success: true, form: updated });
});

// ==========================================
// EXPORT (Word & 1:1 HTML/PDF)
// ==========================================
apiRouter.get('/forms/:id/export/word', async (req: Request, res: Response) => {
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  try {
    const wordBuffer = await generateWordDocument(form);
    const safeProjName = (form.namaProyekTI || 'Dokumen_Aset')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .substring(0, 50);
    const filename = `Formulir_Dokumen_Aset_IT_-_${safeProjName}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', wordBuffer.length);
    return res.end(wordBuffer);
  } catch (err: any) {
    console.error('[Word Export Error]', err);
    return res.status(500).json({ error: 'Gagal membuat dokumen Word: ' + err.message });
  }
});

apiRouter.get('/forms/:id/export/pdf-html', async (req: Request, res: Response) => {
  const form = db.getFormById(req.params.id);
  if (!form) {
    return res.status(404).send('Formulir tidak ditemukan.');
  }

  const html = renderForm1to1Html(form);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

// ==========================================
// SETTINGS & WHATSAPP (FONNTE)
// ==========================================
apiRouter.get('/settings', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const settings = db.getSettings();
  // Mask token for security
  const maskedToken = settings.fonnteToken
    ? `${settings.fonnteToken.substring(0, 4)}••••••••${settings.fonnteToken.slice(-4)}`
    : '';

  return res.json({
    settings: {
      ...settings,
      fonnteTokenMasked: maskedToken,
      hasToken: Boolean(settings.fonnteToken),
    },
  });
});

apiRouter.put('/settings', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const { fonnteToken, fonnteSuperadminPhone, reminderTemplate, reminderCronSchedule, defaultDiverifikasiSlots, defaultDisetujuiSlots } = req.body;

  let cleanAdminPhone = fonnteSuperadminPhone;
  if (fonnteSuperadminPhone) {
    const val = validateIndonesianPhoneNumber(fonnteSuperadminPhone);
    if (!val.isValid) {
      return res.status(400).json({ error: val.error });
    }
    cleanAdminPhone = val.cleanPhone;
  }

  const updates: any = {};
  if (fonnteToken !== undefined && !fonnteToken.includes('••••')) {
    updates.fonnteToken = fonnteToken;
  }
  if (cleanAdminPhone !== undefined) updates.fonnteSuperadminPhone = cleanAdminPhone;
  if (reminderTemplate !== undefined) updates.reminderTemplate = reminderTemplate;
  if (reminderCronSchedule !== undefined) updates.reminderCronSchedule = reminderCronSchedule;
  if (defaultDiverifikasiSlots !== undefined) updates.defaultDiverifikasiSlots = defaultDiverifikasiSlots;
  if (defaultDisetujuiSlots !== undefined) updates.defaultDisetujuiSlots = defaultDisetujuiSlots;

  const saved = await db.updateSettings(updates);
  await db.logAudit(req.user!.id, req.user!.username, 'UPDATE_SETTINGS', 'Memperbarui konfigurasi sistem');

  return res.json({ success: true, settings: saved });
});

// Test WhatsApp send via Fonnte
apiRouter.post('/reminders/test', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const { phone, message } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Nomor WhatsApp tujuan wajib diisi.' });
  }

  const phoneVal = validateIndonesianPhoneNumber(phone);
  if (!phoneVal.isValid) {
    return res.status(400).json({ error: phoneVal.error });
  }

  const testMsg = message || 'Tes notifikasi dari Sistem Formulir Dokumentasi Aset Proyek TI Bank BTN via Fonnte.';
  const result = await sendFonnteMessage(phoneVal.cleanPhone!, testMsg);

  return res.json(result);
});

// Trigger manual reminder for a form
apiRouter.post('/reminders/send-now/:formId', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const form = db.getFormById(req.params.formId);
  if (!form) {
    return res.status(404).json({ error: 'Formulir tidak ditemukan.' });
  }

  const result = await sendFormReminders(form);
  await db.logAudit(
    req.user!.id,
    req.user!.username,
    'TRIGGER_REMINDER',
    `Manual trigger reminder untuk form ${form.registrationNo} (${result.sentCount} pesan dikirim)`
  );

  return res.json({ success: true, ...result });
});

// Reminder Recipients CRUD
apiRouter.get('/reminders/recipients', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const recipients = db.getReminderRecipients();
  return res.json({ recipients });
});

apiRouter.post('/reminders/recipients', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const { name, whatsappNumber, slotKey, slotTitle, isActive, id } = req.body;

  const phoneVal = validateIndonesianPhoneNumber(whatsappNumber);
  if (!phoneVal.isValid) {
    return res.status(400).json({ error: phoneVal.error });
  }

  const saved = await db.saveReminderRecipient({
    id: id || '',
    name: name || '',
    whatsappNumber: phoneVal.cleanPhone!,
    slotKey: slotKey || '',
    slotTitle: slotTitle || '',
    isActive: isActive !== undefined ? isActive : true,
  });

  return res.json({ success: true, recipient: saved });
});

apiRouter.delete('/reminders/recipients/:id', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const success = await db.deleteReminderRecipient(req.params.id);
  return res.json({ success });
});

// Reminder Logs & Audit Trail
apiRouter.get('/reminders/logs', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const logs = db.getReminderLogs();
  return res.json({ logs });
});

apiRouter.get('/audit-logs', authMiddleware, requireSuperadmin, async (req: AuthRequest, res: Response) => {
  const logs = db.getAuditLogs();
  return res.json({ logs });
});
