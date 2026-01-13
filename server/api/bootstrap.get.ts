import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

const toNumber = (value: any) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [categories, wallets, transactionsAll, transactionsMonth, notifications] = await prisma.$transaction([
    prisma.category.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, type: true, icon: true, isSalary: true },
      orderBy: { name: 'asc' },
    }),
    prisma.wallet.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, type: true, initialBalance: true },
      orderBy: { name: 'asc' },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      select: {
        amount: true,
        walletId: true,
        category: { select: { type: true } },
      },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: monthStart, lt: monthEnd } },
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
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      select: { id: true, title: true, message: true, type: true, read: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const walletTotals = new Map<string, number>();
  const walletIncomeTotals = new Map<string, number>();
  const walletExpenseTotals = new Map<string, number>();
  wallets.forEach((wallet) => {
    walletTotals.set(wallet.id, toNumber(wallet.initialBalance));
    walletIncomeTotals.set(wallet.id, 0);
    walletExpenseTotals.set(wallet.id, 0);
  });

  transactionsAll.forEach((tx) => {
    const amount = toNumber(tx.amount);
    const isExpense = tx.category.type === 'EXPENSE';
    const signedAmount = isExpense ? -amount : amount;
    if (tx.walletId && walletTotals.has(tx.walletId)) {
      walletTotals.set(tx.walletId, (walletTotals.get(tx.walletId) || 0) + signedAmount);
      if (isExpense) {
        walletExpenseTotals.set(
          tx.walletId,
          (walletExpenseTotals.get(tx.walletId) || 0) + amount
        );
      } else {
        walletIncomeTotals.set(
          tx.walletId,
          (walletIncomeTotals.get(tx.walletId) || 0) + amount
        );
      }
    }
  });

  const mappedTransactions = transactionsMonth.map((tx) => {
    const amount = toNumber(tx.amount);
    const isExpense = tx.category.type === 'EXPENSE';
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
      pricePerUnit: tx.pricePerUnit ? toNumber(tx.pricePerUnit) : null,
      promoType: tx.promoType,
      promoValue: tx.promoValue ? toNumber(tx.promoValue) : null,
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

  const mappedWallets = wallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    initialBalance: toNumber(wallet.initialBalance),
    balance: walletTotals.get(wallet.id) ?? toNumber(wallet.initialBalance),
    incomeTotal: walletIncomeTotals.get(wallet.id) ?? 0,
    expenseTotal: walletExpenseTotals.get(wallet.id) ?? 0,
  }));

  return {
    user,
    wallets: mappedWallets,
    categories,
    transactions: mappedTransactions,
    notifications: notifications.map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: notif.read,
      createdAt: notif.createdAt.toISOString(),
    })),
  };
});
