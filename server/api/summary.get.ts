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

const toCents = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100);
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const query = getQuery(event);
  const monthParam = typeof query.month === 'string' ? query.month : undefined;
  const range = parseMonthParam(monthParam);
  const startDay = normalizeStartDay(user.reportingStartDay);
  const fallback = getReportingRangeForMonth(
    new Date().getFullYear(),
    new Date().getMonth(),
    startDay
  );
  const period = range
    ? getReportingRangeForMonth(range.year, range.monthIndex, startDay)
    : fallback;

  // total income/expense bulan ini (berdasar tanggal transaksi)
  const tx = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: period.start, lt: period.end } },
    select: {
      amount: true,
      category: { select: { type: true, name: true, id: true } },
    },
  });

  let income = 0;
  let expense = 0;
  const byCategory = new Map<string, { name: string; total: number }>();

  for (const t of tx) {
    const amountCents = toCents(t.amount);
    if (t.category.type === "INCOME") income += amountCents;
    else {
      expense += amountCents;
      const key = t.category.id;
      const cur = byCategory.get(key) ?? { name: t.category.name, total: 0 };
      cur.total = (cur.total as number) + amountCents;
      byCategory.set(key, cur);
    }
  }

  return {
    monthFrom: period.start.toString(),
    incomeCents: income,
    expenseCents: expense,
    netCents: income - expense,
    expenseCategory: Array.from(byCategory.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8),
  };
});
