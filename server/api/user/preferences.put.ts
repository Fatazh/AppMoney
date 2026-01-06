import { readBody, createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

const validCurrencies = new Set(['IDR', 'USD']);
const validLanguages = new Set(['id', 'en']);

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);

  const updates: Record<string, any> = {};

  if (typeof body?.notificationsEnabled === 'boolean') {
    updates.notificationsEnabled = body.notificationsEnabled;
  }

  if (typeof body?.darkMode === 'boolean') {
    updates.darkMode = body.darkMode;
  }

  if (typeof body?.currency === 'string') {
    const currency = body.currency.toUpperCase();
    if (!validCurrencies.has(currency)) {
      throw createError({ statusCode: 400, statusMessage: 'Mata uang tidak valid.' });
    }
    updates.currency = currency;
  }

  if (typeof body?.language === 'string') {
    const language = body.language.toLowerCase();
    if (!validLanguages.has(language)) {
      throw createError({ statusCode: 400, statusMessage: 'Bahasa tidak valid.' });
    }
    updates.language = language;
  }

  if (body?.reportingStartDay !== undefined) {
    const day = Number(body.reportingStartDay);
    if (!Number.isFinite(day) || day < 1 || day > 31) {
      throw createError({ statusCode: 400, statusMessage: 'Tanggal periode tidak valid.' });
    }
    updates.reportingStartDay = Math.floor(day);
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada preferensi yang diperbarui.' });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updates,
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      notificationsEnabled: true,
      darkMode: true,
      currency: true,
      language: true,
      reportingStartDay: true,
    },
  });

  return { user: updated };
});
