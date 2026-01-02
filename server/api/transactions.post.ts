import { readBody, createError } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';
import { createNotification } from '../utils/notifications';

const validPromoTypes = new Set(['PERCENT', 'FIXED', 'BUY_X_GET_Y']);
const MAX_RETRIES = 2;

const normalizeAmount = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100) / 100;
};

const toCents = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100);
};

const isRetryable = (error: any) =>
  error?.code === 'P2034' || error?.code === '40001';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);

  const categoryId = String(body?.categoryId || '');
  const walletId = body?.walletId ? String(body.walletId) : null;
  const amount = normalizeAmount(body?.amount);
  const productName = String(body?.productName || '').trim();
  const note = body?.note ? String(body.note).trim() : null;
  const parsedDate = body?.date ? new Date(body.date) : new Date();
  const date = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const quantity = Math.max(1, Math.floor(Number(body?.quantity || 1)));
  const rawPrice = body?.pricePerUnit !== undefined ? normalizeAmount(body.pricePerUnit) : null;
  const pricePerUnit = rawPrice !== null && rawPrice > 0 ? rawPrice : null;

  let promoType: string | null = null;
  let promoValue: number | null = null;
  let promoBuyX: number | null = null;
  let promoGetY: number | null = null;

  if (body?.promoType) {
    const incoming = String(body.promoType).toUpperCase();
    if (validPromoTypes.has(incoming)) {
      promoType = incoming;
      promoValue = body?.promoValue !== undefined ? normalizeAmount(body.promoValue) : null;
      promoBuyX = body?.promoBuyX !== undefined ? Number(body.promoBuyX) : null;
      promoGetY = body?.promoGetY !== undefined ? Number(body.promoGetY) : null;

      if (promoValue !== null && promoValue < 0) promoValue = 0;
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
  const resolvedWalletId = walletId;

  if (!productName) {
    throw createError({ statusCode: 400, statusMessage: 'Nama transaksi wajib diisi.' });
  }

  if (amount === null || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Jumlah transaksi harus lebih dari 0.' });
  }

  const resolvedAmount = amount;
  const amountCents = toCents(resolvedAmount);

  const executeTransaction = () =>
    prisma.$transaction(
      async (tx) => {
        const category = await tx.category.findFirst({
          where: { id: categoryId, userId: user.id },
        });
        if (!category) {
          throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan.' });
        }

        const wallet = await tx.wallet.findFirst({
          where: { id: resolvedWalletId, userId: user.id },
        });
        if (!wallet) {
          throw createError({ statusCode: 404, statusMessage: 'Dompet tidak ditemukan.' });
        }

        const isExpense = category.type === 'EXPENSE';
        let nextBalanceCents: number | null = null;

        if (isExpense) {
          const [incomeAgg, expenseAgg] = await Promise.all([
            tx.transaction.aggregate({
              where: { userId: user.id, walletId: wallet.id, category: { type: 'INCOME' } },
              _sum: { amount: true },
            }),
            tx.transaction.aggregate({
              where: { userId: user.id, walletId: wallet.id, category: { type: 'EXPENSE' } },
              _sum: { amount: true },
            }),
          ]);

          const incomeTotalCents = toCents(incomeAgg._sum.amount);
          const expenseTotalCents = toCents(expenseAgg._sum.amount);
          const currentBalanceCents =
            toCents(wallet.initialBalance) + incomeTotalCents - expenseTotalCents;
          nextBalanceCents = currentBalanceCents - amountCents;
          if (nextBalanceCents < 0) {
            throw createError({ statusCode: 400, statusMessage: 'Saldo dompet tidak cukup.' });
          }
        }

        const created = await tx.transaction.create({
          data: {
            amount: resolvedAmount,
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

        return { transaction: created, walletName: wallet.name, nextBalanceCents };
      },
      { isolationLevel: 'Serializable' }
    );

  let result:
    | { transaction: { id: string }; walletName: string; nextBalanceCents: number | null }
    | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      result = await executeTransaction();
      break;
    } catch (error) {
      if (isRetryable(error) && attempt < MAX_RETRIES) {
        continue;
      }
      if (isRetryable(error)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Transaksi sedang diproses. Coba lagi.',
        });
      }
      throw error;
    }
  }

  if (!result) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal menyimpan transaksi. Coba lagi.',
    });
  }

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
  const lowBalanceThresholdCents = Math.round(lowBalanceThreshold * 100);
  if (
    result.nextBalanceCents !== null &&
    lowBalanceThresholdCents > 0 &&
    result.nextBalanceCents <= lowBalanceThresholdCents
  ) {
    const warningTitle = isEnglish ? 'Low balance' : 'Saldo menipis';
    const warningMessage = isEnglish
      ? `Wallet "${result.walletName}" balance is low.`
      : `Saldo dompet "${result.walletName}" menipis.`;

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

  return { transaction: result.transaction };
});
