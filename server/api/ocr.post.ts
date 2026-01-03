import { readBody, createError } from 'h3';
import { requireUser } from '../utils/auth';

const DEFAULT_OCR_URL = 'https://api.ocr.space/parse/image';
const MAX_IMAGE_LENGTH = 2_000_000;

const normalizeLanguage = (value: unknown) => {
  if (typeof value !== 'string') return 'ind';
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return 'ind';
  return trimmed;
};

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const body = await readBody(event);
  const image = typeof body?.image === 'string' ? body.image.trim() : '';
  const language = normalizeLanguage(body?.language);

  if (!image) {
    throw createError({ statusCode: 400, statusMessage: 'Gambar wajib diisi.' });
  }

  if (!image.startsWith('data:image/')) {
    throw createError({ statusCode: 400, statusMessage: 'Format gambar tidak valid.' });
  }

  if (image.length > MAX_IMAGE_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: 'Ukuran gambar terlalu besar.' });
  }

  const config = useRuntimeConfig();
  const apiKey = config.ocrApiKey as string | undefined;
  const apiUrl = (config.ocrApiUrl as string | undefined) || DEFAULT_OCR_URL;

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OCR belum dikonfigurasi.' });
  }

  const form = new FormData();
  form.append('base64Image', image);
  form.append('language', language);
  form.append('isOverlayRequired', 'false');
  form.append('OCREngine', '2');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { apikey: apiKey },
    body: form,
  });

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Gagal menghubungi OCR.' });
  }

  const payload = (await response.json()) as {
    ParsedResults?: Array<{ ParsedText?: string | null }>;
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string[] | string;
  };

  if (payload?.IsErroredOnProcessing) {
    const message = Array.isArray(payload.ErrorMessage)
      ? payload.ErrorMessage[0]
      : payload.ErrorMessage;
    throw createError({
      statusCode: 422,
      statusMessage: message || 'OCR gagal memproses gambar.',
    });
  }

  const parsedText = payload?.ParsedResults?.[0]?.ParsedText || '';

  return {
    text: parsedText,
  };
});
