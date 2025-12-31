import webpush from 'web-push';
import { prisma } from './prisma';

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  notificationId?: string;
};

let vapidReady = false;

const ensureVapid = () => {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  if (vapidReady) return true;
  const contact = process.env.WEB_PUSH_CONTACT || 'mailto:admin@example.com';
  webpush.setVapidDetails(contact, publicKey, privateKey);
  vapidReady = true;
  return true;
};

export const sendPushToUser = async (userId: string, payload: PushPayload) => {
  if (!ensureVapid()) return;

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        body
      )
    )
  );

  const staleEndpoints: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') return;
    const statusCode = (result.reason as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      staleEndpoints.push(subscriptions[index].endpoint);
    } else {
      console.error('Push send failed', result.reason);
    }
  });

  if (staleEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { userId, endpoint: { in: staleEndpoints } },
    });
  }
};
