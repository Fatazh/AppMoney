import fs from 'node:fs/promises';
import path from 'node:path';

const source = path.resolve('node_modules/.prisma/client');
const target = path.resolve('node_modules/@prisma/client/.prisma/client');

const exists = async (p) => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

if (await exists(source)) {
  await fs.mkdir(target, { recursive: true });
  await fs.cp(source, target, { recursive: true });
  console.log('[prisma-link] Copied .prisma/client to @prisma/client/.prisma/client');
} else {
  console.warn('[prisma-link] Source not found:', source);
}
