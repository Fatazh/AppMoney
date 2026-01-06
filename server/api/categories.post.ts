import { readBody, createError } from 'h3';
import { prisma } from '../utils/prisma';
import { requireUser } from '../utils/auth';

const validTypes = new Set(['INCOME', 'EXPENSE']);

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);

  const name = String(body?.name || '').trim();
  const type = String(body?.type || '').toUpperCase();
  const icon = body?.icon ? String(body.icon).trim() : 'fa-tag';
  const isSalary = typeof body?.isSalary === 'boolean' ? body.isSalary : false;

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Nama kategori wajib diisi.' });
  }

  if (!validTypes.has(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipe kategori tidak valid.' });
  }

  const existing = await prisma.category.findFirst({
    where: {
      userId: user.id,
      type,
      name: { equals: name, mode: 'insensitive' },
    },
    select: { id: true },
  });

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Nama kategori sudah digunakan.' });
  }

  try {
    const category = await prisma.category.create({
      data: { name, type, icon, isSalary: type === 'INCOME' ? isSalary : false, userId: user.id },
      select: { id: true, name: true, type: true, icon: true, isSalary: true },
    });

    return { category };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Nama kategori sudah digunakan.' });
    }
    throw error;
  }
});
