import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  return { ok: true };
});
