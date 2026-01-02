import { getQuery } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

const parseMonthRange = (value?: string) => {
  if (!value) return null;
  const [yearText, monthText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
};

const toNumber = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const query = getQuery(event);
  const monthParam = typeof query.month === 'string' ? query.month : undefined;
  const range = parseMonthRange(monthParam);

  const start = range?.start ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = range?.end ?? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

  const [incomeAgg, expenseAgg, dailyCounts] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: user.id, date: { gte: start, lt: end }, category: { type: 'INCOME' } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, date: { gte: start, lt: end }, category: { type: 'EXPENSE' } },
      _sum: { amount: true },
    }),
    prisma.$queryRaw<
      Array<{
        day: Date | string;
        type: string;
        count: number;
      }>
    >`
      SELECT DATE(t."date") AS day, c."type" AS type, COUNT(*)::int AS count
      FROM "Transaction" t
      JOIN "Category" c ON c."id" = t."categoryId"
      WHERE t."userId" = ${user.id} AND t."date" >= ${start} AND t."date" < ${end}
      GROUP BY day, c."type"
      ORDER BY day ASC
    `,
  ]);

  const income = toNumber(incomeAgg._sum.amount);
  const expense = toNumber(expenseAgg._sum.amount);

  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const weekly = [];
  for (let day = 1, index = 0; day <= daysInMonth; day += 7, index += 1) {
    weekly.push({
      week: index + 1,
      startDay: day,
      endDay: Math.min(day + 6, daysInMonth),
      income: 0,
      expense: 0,
    });
  }

  dailyCounts.forEach((row) => {
    const rawDay = typeof row.day === 'string' ? row.day : row.day.toISOString().split('T')[0];
    const dayPart = rawDay.split('-')[2];
    const day = Number(dayPart);
    if (!Number.isFinite(day)) return;
    const index = Math.floor((day - 1) / 7);
    const bucket = weekly[index];
    if (!bucket) return;
    if (row.type === 'INCOME') {
      bucket.income += Number(row.count || 0);
    } else {
      bucket.expense += Number(row.count || 0);
    }
  });

  const maxVal = Math.max(
    ...weekly.map((bucket) => Math.max(bucket.income, bucket.expense)),
    1
  );

  return {
    month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
    summary: {
      income,
      expense,
      net: income - expense,
    },
    weekly: {
      data: weekly,
      maxVal,
      daysInMonth,
    },
  };
});
