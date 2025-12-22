import { createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const walletId = event.context.params?.id;

  if (!walletId) {
    throw createError({ statusCode: 400, statusMessage: 'Wallet id tidak ditemukan.' });
  }

  const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId: user.id } });
  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Dompet tidak ditemukan.' });
  }

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: { userId: user.id, walletId },
      data: { walletId: null },
    }),
    prisma.wallet.delete({ where: { id: walletId } }),
  ]);

  return { success: true };
});
