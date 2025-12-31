import { prisma } from './prisma';
import { sendPushToUser } from './push';

type NotificationType = 'success' | 'warning' | 'info' | 'alert';

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  sendPush?: boolean;
  url?: string;
};

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  sendPush = false,
  url,
}: CreateNotificationInput) => {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type },
    select: { id: true },
  });

  if (sendPush) {
    try {
      await sendPushToUser(userId, {
        title,
        body: message,
        url,
        notificationId: notification.id,
      });
    } catch (error) {
      console.error('Push notification failed', error);
    }
  }

  return notification;
};
