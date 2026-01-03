import { getQuery } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const query = getQuery(event);
  const rawLimit = Number(query.limit || 20);
  const take = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, rawLimit)) : 20;
  const rawCursor = typeof query.cursor === 'string' ? query.cursor : '';

  let cursorDate: Date | null = null;
  let cursorId: string | null = null;

  if (rawCursor) {
    const [datePart, idPart] = rawCursor.split('|');
    const parsedDate = datePart ? new Date(datePart) : null;
    if (parsedDate && !Number.isNaN(parsedDate.getTime()) && idPart) {
      cursorDate = parsedDate;
      cursorId = idPart;
    }
  }

  const where =
    cursorDate && cursorId
      ? {
          userId: user.id,
          OR: [
            { createdAt: { lt: cursorDate } },
            { createdAt: cursorDate, id: { lt: cursorId } },
          ],
        }
      : { userId: user.id };

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
  });

  const hasMore = notifications.length > take;
  const items = hasMore ? notifications.slice(0, take) : notifications;
  const lastItem = items[items.length - 1];
  const nextCursor = hasMore && lastItem
    ? `${lastItem.createdAt.toISOString()}|${lastItem.id}`
    : null;

  return {
    notifications: items.map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: notif.read,
      createdAt: notif.createdAt.toISOString(),
    })),
    nextCursor,
  };
});
