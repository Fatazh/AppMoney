import { prisma } from "../utils/prisma";
import { requireUser } from "../utils/auth";

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const from = startOfMonth(new Date());

  // total income/expense bulan ini (berdasar type category)
  const tx = await prisma.transaction.findMany({
    where: { userId: user.id, createdAt: { gte: from } },
    select: {
      amount: true,
      category: { select: { type: true, name: true, id: true } },
    },
  });

  let income = 0;
  let expense = 0;
  const byCategory = new Map<string, { name: string; total: number }>();

  for (const t of tx) {
    const amountCents = Math.round(Number(t.amount) * 100);
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
    monthFrom: from.toString(),
    incomeCents: income,
    expenseCents: expense,
    netCents: income - expense,
    expenseCategory: Array.from(byCategory.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8),
  };
});
