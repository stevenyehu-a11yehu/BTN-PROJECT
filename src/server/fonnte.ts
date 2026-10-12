import cron from 'node-cron';
import { db } from './db/database.js';
import { FormDataRecord } from '../types/index.js';

export function validateIndonesianPhoneNumber(phone: string): { isValid: boolean; error?: string; cleanPhone?: string } {
  if (!phone) {
    return { isValid: false, error: 'Nomor WhatsApp wajib diisi' };
  }
  const clean = phone.trim().replace(/[-\s]/g, '');
  if (!/^08\d{8,11}$/.test(clean)) {
    return {
      isValid: false,
      error: 'Format nomor WhatsApp harus berformat 08xxxxxxxxxx (10-13 digit angka, diawali 08)',
    };
  }
  return { isValid: true, cleanPhone: clean };
}

export async function sendFonnteMessage(target: string, message: string): Promise<{ success: boolean; response: any }> {
  const phoneVal = validateIndonesianPhoneNumber(target);
  if (!phoneVal.isValid) {
    const errorMsg = phoneVal.error || 'Nomor tidak valid';
    await db.addReminderLog({
      target,
      message,
      status: 'FAILED',
      response: errorMsg,
    });
    return { success: false, response: errorMsg };
  }

  const settings = db.getSettings();
  const token = settings.fonnteToken || process.env.FONNTE_TOKEN;

  if (!token) {
    const errorMsg = 'Token Fonnte belum dikonfigurasi di Settings atau .env';
    console.warn('[Fonnte]', errorMsg);
    await db.addReminderLog({
      target: phoneVal.cleanPhone!,
      message,
      status: 'FAILED',
      response: errorMsg,
    });
    return { success: false, response: errorMsg };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('target', phoneVal.cleanPhone!);
    formData.append('message', message);
    formData.append('countryCode', '62');

    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const resText = await res.text();
    let resJson: any = null;
    try {
      resJson = JSON.parse(resText);
    } catch {
      resJson = { raw: resText };
    }

    const isSuccess = res.ok && (resJson?.status === true || resJson?.status === 'true' || resJson?.id);
    await db.addReminderLog({
      target: phoneVal.cleanPhone!,
      message,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      response: typeof resJson === 'object' ? JSON.stringify(resJson) : resText,
    });

    return { success: isSuccess, response: resJson };
  } catch (err: any) {
    console.error('[Fonnte Error]', err);
    await db.addReminderLog({
      target: phoneVal.cleanPhone!,
      message,
      status: 'FAILED',
      response: err.message || 'Network error',
    });
    return { success: false, response: err.message };
  }
}

// Event 1: Trigger saat Vendor Submit Form
export async function notifySuperadminOnVendorSubmit(form: FormDataRecord) {
  const settings = db.getSettings();
  const adminPhone = settings.fonnteSuperadminPhone || process.env.FONNTE_SUPERADMIN_PHONE || '081234567890';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  const message = `[BTN IT ASSET] Form Dokumentasi Baru Telah Disubmit!\n\nProyek: ${form.namaProyekTI} (${form.kodeProyekTI})\nVendor: ${form.pihakKedua}\nNo PKS: ${form.noPKSTerbaru}\nNo Registrasi: ${form.registrationNo}\n\nForm menunggu verifikasi & persetujuan manajemen BTN.\nLihat formulir: ${appUrl}`;

  return await sendFonnteMessage(adminPhone, message);
}

// Helper: Check which slots are not yet signed
export function getUnsignedSlots(form: FormDataRecord): { key: string; title: string; name: string }[] {
  const unsigned: { key: string; title: string; name: string }[] = [];

  for (const slot of form.diverifikasiOleh) {
    if (!slot.date && !slot.signatureDataUrl) {
      unsigned.push({ key: slot.key, title: slot.title, name: slot.name });
    }
  }

  for (const slot of form.disetujuiOleh) {
    if (!slot.date && !slot.signatureDataUrl) {
      unsigned.push({ key: slot.key, title: slot.title, name: slot.name });
    }
  }

  return unsigned;
}

// Trigger Manual atau Cron: Kirim reminder untuk sebuah form yang On Going
export async function sendFormReminders(form: FormDataRecord): Promise<{ sentCount: number; results: any[] }> {
  const settings = db.getSettings();
  const recipients = db.getReminderRecipients().filter((r) => r.isActive);
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const unsigned = getUnsignedSlots(form);

  if (unsigned.length === 0) {
    return { sentCount: 0, results: [] };
  }

  const results: any[] = [];
  let sentCount = 0;

  // 1. Kirim reminder spesifik ke setiap pejabat BTN yang belum tanda tangan
  for (const slot of unsigned) {
    // Cari penerima yang di-assign ke slot ini
    const targetRecipient = recipients.find(
      (r) =>
        r.slotKey === slot.key ||
        r.slotTitle.toLowerCase().trim() === slot.title.toLowerCase().trim()
    );

    if (targetRecipient) {
      let customMsg = settings.reminderTemplate
        .replace('{nama}', targetRecipient.name || slot.name || 'Bapak/Ibu')
        .replace('{nama_proyek}', form.namaProyekTI)
        .replace('{kode_proyek}', form.kodeProyekTI)
        .replace('{vendor}', form.pihakKedua)
        .replace('{slot_belum_ttd}', slot.title)
        .replace('{link}', appUrl);

      const res = await sendFonnteMessage(targetRecipient.whatsappNumber, customMsg);
      results.push({ target: targetRecipient.whatsappNumber, slot: slot.title, ...res });
      if (res.success) sentCount++;
    }
  }

  // 2. Kirim rekap ke Superadmin
  const adminPhone = settings.fonnteSuperadminPhone || process.env.FONNTE_SUPERADMIN_PHONE;
  if (adminPhone) {
    const slotListStr = unsigned.map((u, i) => `${i + 1}. ${u.title} (${u.name || 'Belum diisi'})`).join('\n');
    const adminSummary = `[REKAP REMINDER TTD BTN]\nProyek: ${form.namaProyekTI}\nStatus: ${form.status}\n\nDaftar slot belum ditandatangani:\n${slotListStr}\n\nSilakan tindak lanjuti: ${appUrl}`;
    const adminRes = await sendFonnteMessage(adminPhone, adminSummary);
    results.push({ target: adminPhone, slot: 'Superadmin Rekap', ...adminRes });
    if (adminRes.success) sentCount++;
  }

  return { sentCount, results };
}

// Inisialisasi scheduler node-cron
export function startReminderScheduler() {
  const settings = db.getSettings();
  const cronExpression = settings.reminderCronSchedule || '0 9 * * 1-5';

  if (!cron.validate(cronExpression)) {
    console.warn(`[Cron] Invalid cron expression: "${cronExpression}". Falling back to default "0 9 * * 1-5"`);
  }

  const validExpr = cron.validate(cronExpression) ? cronExpression : '0 9 * * 1-5';

  cron.schedule(validExpr, async () => {
    console.log('[Cron] Running scheduled WhatsApp reminders for On Going forms...');
    const forms = db.getForms().filter((f) => f.status === 'On Going' || f.status === 'Submitted');

    for (const form of forms) {
      try {
        await sendFormReminders(form);
      } catch (err) {
        console.error(`[Cron] Error reminding form ${form.id}:`, err);
      }
    }
  });

  console.log(`[Cron] Reminder scheduler started with pattern: "${validExpr}"`);
}
