import { readBody, createError } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';
import { createNotification } from '../utils/notifications';

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

  const isExpense = category.type === 'EXPENSE';
  let nextBalance: number | null = null;

  if (isExpense) {
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

    const incomeTotal = Number(incomeAgg._sum.amount || 0);
    const expenseTotal = Number(expenseAgg._sum.amount || 0);
    const currentBalance = Number(wallet.initialBalance || 0) + incomeTotal - expenseTotal;
    nextBalance = currentBalance - amount;
    if (nextBalance < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Saldo dompet tidak cukup.' });
    }
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

  const isEnglish = user.language === 'en';
  const successTitle = isEnglish ? 'Transaction saved' : 'Transaksi berhasil';
  const successMessage = isEnglish
    ? `Transaction "${productName}" was saved.`
    : `Transaksi "${productName}" berhasil disimpan.`;

  try {
    await createNotification({
      userId: user.id,
      title: successTitle,
      message: successMessage,
      type: 'success',
      sendPush: Boolean(user.notificationsEnabled),
      url: '/analytics?section=transactions',
    });
  } catch (error) {
    console.error('Failed to create transaction notification', error);
  }

  const lowBalanceThreshold = Number(process.env.LOW_BALANCE_THRESHOLD || 50000);
  if (nextBalance !== null && lowBalanceThreshold > 0 && nextBalance <= lowBalanceThreshold) {
    const warningTitle = isEnglish ? 'Low balance' : 'Saldo menipis';
    const warningMessage = isEnglish
      ? `Wallet "${wallet.name}" balance is low.`
      : `Saldo dompet "${wallet.name}" menipis.`;

    try {
      await createNotification({
        userId: user.id,
        title: warningTitle,
        message: warningMessage,
        type: 'warning',
        sendPush: Boolean(user.notificationsEnabled),
        url: '/master',
      });
    } catch (error) {
      console.error('Failed to create low balance notification', error);
    }
  }

  return { transaction };
});
