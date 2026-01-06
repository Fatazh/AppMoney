import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { createError, getCookie, setCookie } from 'h3';
import { prisma } from './prisma';

const SESSION_COOKIE = 'mm_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'AUTH_SECRET is not set' });
  }
  return secret;
};

const signPayload = (payload: string) =>
  createHmac('sha256', getAuthSecret()).update(payload).digest('base64url');

const safeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
};

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
};

export const verifyPassword = (password: string, stored: string) => {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const next = scryptSync(password, salt, 64).toString('hex');
  return safeEqual(hash, next);
};

export const createSessionToken = (userId: string, expiresAt: number) => {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: expiresAt })).toString('base64url');
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
};

export const verifySessionToken = (token: string) => {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = signPayload(payload);
  if (!safeEqual(signature, expected)) return null;
  try {
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    const data = JSON.parse(decoded) as { uid?: string; exp?: number };
    if (!data.uid || !data.exp || Date.now() > data.exp) return null;
    return data.uid;
  } catch {
    return null;
  }
};

export const setSessionCookie = (event: any, userId: string) => {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const token = createSessionToken(userId, expiresAt);
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
};

export const clearSessionCookie = (event: any) => {
  setCookie(event, SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
};

export const getUserFromEvent = async (event: any) => {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token) return null;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      notificationsEnabled: true,
      darkMode: true,
      currency: true,
      language: true,
      reportingStartDay: true,
    },
  });
};

export const requireUser = async (event: any) => {
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  return user;
};
