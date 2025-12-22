import { readBody, createError } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

const validPromoTypes = new Set(['PERCENT', 'FIXED', 'BUY_X_GET_Y']);

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);

  const categoryId = String(body?.categoryId || '');
  const walletId = body?.walletId ? String(body.walletId) : null;
  const amount = Number(body?.amount || 0);
  const productName = String(body?.productName || '').trim();
  const note = body?.note ? String(body.note).trim() : null;
  const parsedDate = body?.date ? new Date(body.date) : new Date();
  const date = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const quantity = Math.max(1, Math.floor(Number(body?.quantity || 1)));
  const rawPrice = body?.pricePerUnit !== undefined ? Number(body.pricePerUnit) : null;
  const pricePerUnit = rawPrice !== null && Number.isFinite(rawPrice) ? rawPrice : null;

  let promoType: string | null = null;
  let promoValue: number | null = null;
  let promoBuyX: number | null = null;
  let promoGetY: number | null = null;

  if (body?.promoType) {
    const incoming = String(body.promoType).toUpperCase();
    if (validPromoTypes.has(incoming)) {
      promoType = incoming;
      promoValue = body?.promoValue !== undefined ? Number(body.promoValue) : null;
      promoBuyX = body?.promoBuyX !== undefined ? Number(body.promoBuyX) : null;
      promoGetY = body?.promoGetY !== undefined ? Number(body.promoGetY) : null;

      if (promoValue !== null && !Number.isFinite(promoValue)) promoValue = null;
      if (promoBuyX !== null && !Number.isFinite(promoBuyX)) promoBuyX = null;
      if (promoGetY !== null && !Number.isFinite(promoGetY)) promoGetY = null;
    }
  }

  if (!categoryId) {
    throw createError({ statusCode: 400, statusMessage: 'Kategori wajib diisi.' });
  }

  if (!walletId) {
    throw createError({ statusCode: 400, statusMessage: 'Dompet wajib diisi.' });
  }

  if (!productName) {
    throw createError({ statusCode: 400, statusMessage: 'Nama transaksi wajib diisi.' });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Jumlah transaksi harus lebih dari 0.' });
  }

  const category = await prisma.category.findFirst({ where: { id: categoryId, userId: user.id } });
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan.' });
  }

  const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId: user.id } });
  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Dompet tidak ditemukan.' });
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      date,
      note,
      productName,
      categoryId: category.id,
      userId: user.id,
      quantity,
      pricePerUnit,
      promoType,
      promoValue,
      promoBuyX,
      promoGetY,
      walletId: wallet.id,
    },
    select: { id: true },
  });

  return { transaction };
});
