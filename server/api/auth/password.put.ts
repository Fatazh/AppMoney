import { readBody, createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser, verifyPassword, hashPassword } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);
  const currentPassword = String(body?.currentPassword || '');
  const newPassword = String(body?.newPassword || '');

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Password wajib diisi.' });
  }

  if (newPassword.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 6 karakter.' });
  }

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  });

  if (!existing || !verifyPassword(currentPassword, existing.password)) {
    throw createError({ statusCode: 400, statusMessage: 'Password lama salah.' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashPassword(newPassword) },
  });

  return { ok: true };
});
