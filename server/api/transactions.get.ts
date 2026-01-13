import { getQuery } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';
import { getReportingRangeForMonth, normalizeStartDay } from '../utils/reporting';

const parseMonthParam = (value?: string) => {
  if (!value) return null;
  const [yearText, monthText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  return { year, monthIndex: month - 1 };
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const query = getQuery(event);

  const rawPage = Number(query.page || 1);
  const rawLimit = Number(query.limit || 5);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = Number.isFinite(rawLimit)
    ? Math.min(50, Math.max(1, Math.floor(rawLimit)))
    : 5;

  const monthParam = typeof query.month === 'string' ? query.month : undefined;
  const range = parseMonthParam(monthParam);
  const startDay = normalizeStartDay(user.reportingStartDay);

  const period = range ? getReportingRangeForMonth(range.year, range.monthIndex, startDay) : null;

  const where = period
    ? { userId: user.id, date: { gte: period.start, lt: period.end } }
    : { userId: user.id };

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      select: {
        id: true,
        amount: true,
        date: true,
        createdAt: true,
        note: true,
        incomePeriod: true,
        productName: true,
        merchantName: true,
        shoppingType: true,
        quantity: true,
        pricePerUnit: true,
        promoType: true,
        promoValue: true,
        promoBuyX: true,
        promoGetY: true,
        category: { select: { id: true, name: true, type: true, icon: true } },
        wallet: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  const mapped = transactions.map((tx) => {
    const isExpense = tx.category.type === 'EXPENSE';
    const amount = Number(tx.amount || 0);
    const signedAmount = isExpense ? -amount : amount;
    return {
      id: tx.id,
      amount: signedAmount,
      date: tx.date.toISOString().split('T')[0],
      createdAt: tx.createdAt.toISOString(),
      productName: tx.productName,
      merchantName: tx.merchantName ?? null,
      shoppingType: tx.shoppingType ?? null,
      note: tx.note,
      incomePeriod: tx.incomePeriod,
      quantity: tx.quantity,
      pricePerUnit: tx.pricePerUnit ? Number(tx.pricePerUnit) : null,
      promoType: tx.promoType,
      promoValue: tx.promoValue ? Number(tx.promoValue) : null,
      promoBuyX: tx.promoBuyX ?? null,
      promoGetY: tx.promoGetY ?? null,
      category: {
        id: tx.category.id,
        name: tx.category.name,
        type: tx.category.type,
        icon: tx.category.icon,
      },
      wallet: tx.wallet ? { id: tx.wallet.id, name: tx.wallet.name } : null,
    };
  });

  return {
    page,
    limit,
    total,
    transactions: mapped,
  };
});
