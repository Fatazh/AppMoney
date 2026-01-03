import { readBody, createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

const validTypes = new Set(['CASH', 'BANK', 'WALLET']);
const toCents = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100);
};
const normalizeAmount = (value: number) => Math.round(value * 100) / 100;

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
  const balanceAdjustment = Number.isFinite(rawAdjustment)
    ? Math.round(rawAdjustment * 100) / 100
    : 0;

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

  const [incomeAgg, expenseAgg] = await prisma.$transaction([
    prisma.transaction.aggregate({
      where: { userId: user.id, walletId: wallet.id, category: { type: 'INCOME' } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, walletId: wallet.id, category: { type: 'EXPENSE' } },
      _sum: { amount: true },
    }),
  ]);

  const incomeTotalCents = toCents(incomeAgg._sum.amount);
  const expenseTotalCents = toCents(expenseAgg._sum.amount);
  const currentBalanceCents =
    toCents(wallet.initialBalance) + incomeTotalCents - expenseTotalCents;
  const nextBalanceCents = currentBalanceCents + toCents(balanceAdjustment);
  if (nextBalanceCents < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Saldo dompet tidak boleh minus.' });
  }

  const nextInitialBalance = normalizeAmount(Number(wallet.initialBalance || 0) + balanceAdjustment);

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
      data: { name, type, initialBalance: nextInitialBalance },
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
