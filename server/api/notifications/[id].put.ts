import { createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const notificationId = event.context.params?.id;

  if (!notificationId) {
    throw createError({ statusCode: 400, statusMessage: 'Notifikasi tidak ditemukan.' });
  }

  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });

  if (result.count === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Notifikasi tidak ditemukan.' });
  }

  return { ok: true };
});
