import { getQuery } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const query = getQuery(event);
  const rawLimit = Number(query.limit || 20);
  const take = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, rawLimit)) : 20;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return {
    notifications: notifications.map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: notif.read,
      createdAt: notif.createdAt.toISOString(),
    })),
  };
});
