// nuxt.config.ts
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const prismaGeneratedPath = resolve(__dirname, "app/generated/prisma");
const isProduction = process.env.NODE_ENV === "production";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],

  css: [
    "@fortawesome/fontawesome-free/css/all.css",
    "~/assets/css/money-manager.css",
  ],

  build: {
    transpile: ["@prisma/client"],
  },

  vite: {
    // KUNCI PERBAIKAN:
    // Hanya paksa WASM sebagai aset saat Production (Cloudflare).
    // Saat Local, biarkan kosong agar Vite menanganinya secara default.
    assetsInclude: isProduction ? ["**/*.wasm"] : [],

    optimizeDeps: {
      exclude: [prismaGeneratedPath, "@prisma/client", "@prisma/adapter-pg"],
    },

    build: {
      rollupOptions: {
        external: ["pg-native"],
      },
    },
  },

  nitro: {
    experimental: {
      wasm: true,
    },

    moduleSideEffects: [
      resolve(prismaGeneratedPath, "query_engine_bg.postgresql.wasm"),
      resolve(prismaGeneratedPath, "index.js"),
    ],

    // Mocking pg-native hanya diperlukan saat Production (Cloudflare)
    // Di Local, library pg asli bisa berjalan normal.
    alias: isProduction
      ? {
          "pg-native": fileURLToPath(
            new URL("./mock-pg-native.mjs", import.meta.url)
          ),
        }
      : undefined,

    esbuild: {
      options: {
        // Loader copy hanya kita aktifkan saat Production
        loader: isProduction ? ({ ".wasm": "copy" } as any) : undefined,
      },
    },
  },
});
