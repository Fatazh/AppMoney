import { readBody, createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);
  const endpoint = String(body?.endpoint || '').trim();

  if (!endpoint) {
    throw createError({ statusCode: 400, statusMessage: 'Endpoint tidak valid.' });
  }

  await prisma.pushSubscription.deleteMany({
    where: { userId: user.id, endpoint },
  });

  return { ok: true };
});
