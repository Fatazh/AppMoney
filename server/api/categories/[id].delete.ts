import { createError } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const categoryId = event.context.params?.id;

  if (!categoryId) {
    throw createError({ statusCode: 400, statusMessage: 'Kategori tidak ditemukan.' });
  }

  const category = await prisma.category.findFirst({ where: { id: categoryId, userId: user.id } });
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan.' });
  }

  try {
    await prisma.category.delete({ where: { id: category.id } });
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Kategori masih dipakai transaksi.',
    });
  }

  return { ok: true };
});
