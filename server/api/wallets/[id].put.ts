import { readBody, createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

const validTypes = new Set(['CASH', 'BANK', 'WALLET']);

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const walletId = event.context.params?.id;
  const body = await readBody(event);

  if (!walletId) {
    throw createError({ statusCode: 400, statusMessage: 'Wallet id tidak ditemukan.' });
  }

  const name = String(body?.name || '').trim();
  const type = String(body?.type || '').toUpperCase();
  const rawAdjustment = Number(body?.balanceAdjustment || 0);
  const balanceAdjustment = Number.isFinite(rawAdjustment) ? rawAdjustment : 0;

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Nama dompet wajib diisi.' });
  }

  if (!validTypes.has(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipe dompet tidak valid.' });
  }

  const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId: user.id } });
  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Dompet tidak ditemukan.' });
  }

  const currentBalance = Number(wallet.initialBalance || 0);
  const nextBalance = currentBalance + balanceAdjustment;

  const duplicate = await prisma.wallet.findFirst({
    where: {
      userId: user.id,
      name: { equals: name, mode: 'insensitive' },
      NOT: { id: wallet.id },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: 'Nama dompet sudah digunakan.' });
  }

  try {
    const updated = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { name, type, initialBalance: nextBalance },
      select: { id: true, name: true, type: true, initialBalance: true },
    });

    return { wallet: updated };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Nama dompet sudah digunakan.' });
    }
    throw error;
  }
});
