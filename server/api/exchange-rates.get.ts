import { createError } from 'h3';

const cacheTtlMs = 1000 * 60 * 60;
let cache: { expiresAt: number; payload: { base: string; rates: Record<string, number>; fetchedAt: string } } | null = null;

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const apiKey = config.exchangeRateApiKey as string | undefined;
  const base = 'IDR';
  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    return cache.payload;
  }

  const url = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`
    : `https://open.er-api.com/v6/latest/${base}`;

  const response = await $fetch<any>(url).catch((error) => {
    throw createError({
      statusCode: 502,
      statusMessage: 'Gagal mengambil kurs mata uang.',
      data: { error: String(error) },
    });
  });

  const rates = response?.conversion_rates || response?.rates;
  const baseCode = response?.base_code || response?.base || base;

  if (!rates || typeof rates !== 'object') {
    throw createError({ statusCode: 502, statusMessage: 'Format kurs mata uang tidak valid.' });
  }

  const payload = {
    base: String(baseCode),
    rates,
    fetchedAt: new Date().toISOString(),
  };

  cache = { expiresAt: now + cacheTtlMs, payload };
  return payload;
});
