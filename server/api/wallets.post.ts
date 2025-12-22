import { readBody, createError } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

const validTypes = new Set(['CASH', 'BANK', 'WALLET']);

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);

  const name = String(body?.name || '').trim();
  const type = String(body?.type || '').toUpperCase();
  const rawBalance = Number(body?.initialBalance || 0);
  const initialBalance = Number.isFinite(rawBalance) ? rawBalance : 0;

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Nama dompet wajib diisi.' });
  }

  if (!validTypes.has(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipe dompet tidak valid.' });
  }

  const existing = await prisma.wallet.findFirst({
    where: {
      userId: user.id,
      name: { equals: name, mode: 'insensitive' },
    },
    select: { id: true },
  });

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Nama dompet sudah digunakan.' });
  }

  try {
    const wallet = await prisma.wallet.create({
      data: {
        name,
        type,
        initialBalance,
        userId: user.id,
      },
      select: { id: true, name: true, type: true, initialBalance: true },
    });

    return { wallet };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Nama dompet sudah digunakan.' });
    }
    throw error;
  }
});
