import { readBody, createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

const validTypes = new Set(['INCOME', 'EXPENSE']);

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const categoryId = event.context.params?.id;
  const body = await readBody(event);

  if (!categoryId) {
    throw createError({ statusCode: 400, statusMessage: 'Kategori tidak ditemukan.' });
  }

  const name = String(body?.name || '').trim();
  const type = String(body?.type || '').toUpperCase();
  const icon = body?.icon ? String(body.icon).trim() : 'fa-tag';
  const rawIsSalary = body?.isSalary;

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Nama kategori wajib diisi.' });
  }

  if (!validTypes.has(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipe kategori tidak valid.' });
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id },
  });
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan.' });
  }
  const resolvedIsSalary =
    typeof rawIsSalary === 'boolean' ? rawIsSalary : Boolean(category.isSalary);

  const duplicate = await prisma.category.findFirst({
    where: {
      userId: user.id,
      type,
      name: { equals: name, mode: 'insensitive' },
      NOT: { id: category.id },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: 'Nama kategori sudah digunakan.' });
  }

  try {
    const updated = await prisma.category.update({
      where: { id: category.id },
      data: { name, type, icon, isSalary: type === 'INCOME' ? resolvedIsSalary : false },
      select: { id: true, name: true, type: true, icon: true, isSalary: true },
    });

    return { category: updated };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Nama kategori sudah digunakan.' });
    }
    throw error;
  }
});
