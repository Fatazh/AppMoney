import { readBody, createError, getHeader } from 'h3';
import { prisma } from '../../utils/prisma';
import { requireUser } from '../../utils/auth';

type PushSubscriptionPayload = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: { p256dh?: string; auth?: string };
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);
  const subscription = (body?.subscription || {}) as PushSubscriptionPayload;

  const endpoint = String(subscription.endpoint || '').trim();
  const p256dh = String(subscription.keys?.p256dh || '').trim();
  const auth = String(subscription.keys?.auth || '').trim();

  if (!endpoint || !p256dh || !auth) {
    throw createError({ statusCode: 400, statusMessage: 'Subscription tidak valid.' });
  }

  const expiresAt =
    typeof subscription.expirationTime === 'number'
      ? new Date(subscription.expirationTime)
      : null;
  const userAgent = getHeader(event, 'user-agent') || null;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: user.id, p256dh, auth, expiresAt, userAgent },
    create: { userId: user.id, endpoint, p256dh, auth, expiresAt, userAgent },
  });

  return { ok: true };
});
