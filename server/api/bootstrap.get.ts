import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

const toNumber = (value: any) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const [categories, wallets, transactions, notifications] = await prisma.$transaction([
    prisma.category.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, type: true, icon: true },
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
        id: true,
        amount: true,
        date: true,
        createdAt: true,
        note: true,
        productName: true,
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
  wallets.forEach((wallet) => {
    walletTotals.set(wallet.id, toNumber(wallet.initialBalance));
  });

  const mappedTransactions = transactions.map((tx) => {
    const amount = toNumber(tx.amount);
    const isExpense = tx.category.type === 'EXPENSE';
    const signedAmount = isExpense ? -amount : amount;
    if (tx.wallet?.id && walletTotals.has(tx.wallet.id)) {
      walletTotals.set(tx.wallet.id, (walletTotals.get(tx.wallet.id) || 0) + signedAmount);
    }

    return {
      id: tx.id,
      amount: signedAmount,
      date: tx.date.toISOString().split('T')[0],
      createdAt: tx.createdAt.toISOString(),
      productName: tx.productName,
      note: tx.note,
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
