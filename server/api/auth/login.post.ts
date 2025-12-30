import { readBody, createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { setSessionCookie, verifyPassword } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email dan password wajib diisi.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.password)) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah.' });
  }

  setSessionCookie(event, user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      notificationsEnabled: user.notificationsEnabled,
      darkMode: user.darkMode,
      currency: user.currency,
      language: user.language,
    },
  };
});
