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

const patchWasmLoader = async (dir) => {
  const loaderPath = path.join(dir, 'wasm-edge-light-loader.mjs');
  if (!(await exists(loaderPath))) return;
  const content = await fs.readFile(loaderPath, 'utf8');
  const updated = content.replace('query_compiler_bg.wasm?module', 'query_compiler_bg.wasm');
  if (updated !== content) {
    await fs.writeFile(loaderPath, updated, 'utf8');
    console.log('[prisma-link] Patched wasm-edge-light-loader.mjs');
  }
};

if (await exists(source)) {
  await fs.mkdir(target, { recursive: true });
  await patchWasmLoader(source);
  await fs.cp(source, target, { recursive: true });
  await patchWasmLoader(target);
  console.log('[prisma-link] Copied .prisma/client to @prisma/client/.prisma/client');
} else {
  console.warn('[prisma-link] Source not found:', source);
}
