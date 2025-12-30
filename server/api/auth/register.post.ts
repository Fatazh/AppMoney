import { readBody, createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { hashPassword, setSessionCookie } from '../../utils/auth';

const expenseDefaults = ['Makanan', 'Belanja', 'Transport', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'];
const incomeDefaults = ['Gaji', 'Bonus', 'Investasi', 'Hadiah', 'Penjualan', 'Lainnya'];
const categoryIcons: Record<string, string> = {
  Makanan: 'fa-mug-hot',
  Belanja: 'fa-shopping-bag',
  Transport: 'fa-car',
  Tagihan: 'fa-bolt',
  Hiburan: 'fa-film',
  Kesehatan: 'fa-heart',
  Gaji: 'fa-briefcase',
  Bonus: 'fa-gift',
  Investasi: 'fa-chart-line',
  Hadiah: 'fa-gift',
  Penjualan: 'fa-box-open',
  Lainnya: 'fa-coins',
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Nama wajib diisi.' });
  }

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email dan password wajib diisi.' });
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 6 karakter.' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar.' });
  }

  const user = await prisma.user.create({
    data: { name, email, password: hashPassword(password) },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      notificationsEnabled: true,
      darkMode: true,
      currency: true,
      language: true,
    },
  });

  await prisma.$transaction([
    prisma.category.createMany({
      data: expenseDefaults.map((name) => ({
        name,
        type: 'EXPENSE',
        icon: categoryIcons[name] || 'fa-tag',
        userId: user.id,
      })),
      skipDuplicates: true,
    }),
    prisma.category.createMany({
      data: incomeDefaults.map((name) => ({
        name,
        type: 'INCOME',
        icon: categoryIcons[name] || 'fa-tag',
        userId: user.id,
      })),
      skipDuplicates: true,
    }),
    prisma.wallet.create({
      data: { name: 'Dompet Tunai', type: 'CASH', initialBalance: 0, userId: user.id },
    }),
  ]);

  setSessionCookie(event, user.id);

  return { user };
});
