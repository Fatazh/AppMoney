import { readBody, createError } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);
  const name = String(body?.name || '').trim();
  const rawAvatar = body?.avatarUrl;
  let avatarUrl: string | null | undefined;

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Nama wajib diisi.' });
  }

  if (rawAvatar === null) {
    avatarUrl = null;
  } else if (typeof rawAvatar === 'string') {
    const trimmed = rawAvatar.trim();
    if (!trimmed) {
      avatarUrl = null;
    } else {
      if (!trimmed.startsWith('data:image/')) {
        throw createError({ statusCode: 400, statusMessage: 'Avatar harus berupa gambar.' });
      }
      if (trimmed.length > 1000000) {
        throw createError({ statusCode: 400, statusMessage: 'Avatar terlalu besar. Maksimal 1MB.' });
      }
      avatarUrl = trimmed;
    }
  }

  const updates: { name: string; avatarUrl?: string | null } = { name };
  if (avatarUrl !== undefined) {
    updates.avatarUrl = avatarUrl;
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
    },
  });

  return { user: updated };
});
