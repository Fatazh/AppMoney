import { readBody, createError } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);
  const name = String(body?.name || '').trim();

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Nama wajib diisi.' });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name },
    select: {
      id: true,
      email: true,
      name: true,
      notificationsEnabled: true,
      darkMode: true,
      currency: true,
      language: true,
    },
  });

  return { user: updated };
});
