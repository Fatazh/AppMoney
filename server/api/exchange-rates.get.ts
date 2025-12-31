import { createError } from 'h3';

const CACHE_TTL_MS = 1000 * 60 * 60;
const API_URL = 'https://open.er-api.com/v6/latest/IDR';

let cachedRates: { base: string; rates: Record<string, number>; updatedAt: number } | null = null;

const buildResponse = (rates: Record<string, number>, updatedAt: number) => ({
  base: 'IDR',
  rates,
  updatedAt,
});

export default defineEventHandler(async () => {
  const now = Date.now();
  if (cachedRates && now - cachedRates.updatedAt < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw createError({ statusCode: 502, statusMessage: 'Gagal mengambil kurs.' });
    }

    const data = (await response.json()) as { rates?: Record<string, number>; result?: string };
    const usdRate = Number(data?.rates?.USD);
    if (!Number.isFinite(usdRate) || usdRate <= 0) {
      throw createError({ statusCode: 502, statusMessage: 'Format kurs tidak valid.' });
    }

    cachedRates = buildResponse({ IDR: 1, USD: usdRate }, now);
    return cachedRates;
  } catch (error) {
    if (cachedRates) return cachedRates;
    throw error;
  }
});
