// nuxt.config.ts
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// 1. FIX: Definisikan __dirname secara manual karena kita pakai type: module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Arahkan ke folder generated prisma yang benar
const prismaGeneratedPath = join(__dirname, "app/generated/prisma");

// Cek environment
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
    // 2. Terapkan strategi Hybrid untuk assets
    assetsInclude: isProduction ? ["**/*.wasm"] : [],

    optimizeDeps: {
      // Exclude folder generated agar Vite tidak menyentuhnya
      exclude: [prismaGeneratedPath, "@prisma/client", "@prisma/adapter-pg"],
    },

    build: {
      rollupOptions: {
        // Kita gunakan external agar Rollup tidak mencoba mem-bundle WASM menjadi JS text
        external: [/\.wasm$/, "pg-native"],
      },
    },
  },

  nitro: {
    experimental: {
      wasm: true,
    },

    // Pastikan file ini ikut terbawa saat deploy
    moduleSideEffects: [
      join(prismaGeneratedPath, "query_engine_bg.postgresql.wasm"),
      join(prismaGeneratedPath, "index.js"),
    ],

    alias: isProduction
      ? {
          "pg-native": fileURLToPath(
            new URL("./mock-pg-native.mjs", import.meta.url)
          ),
        }
      : undefined,

    esbuild: {
      options: {
        // 3. Paksa esbuild menyalin file sebagai binary (bukan text)
        loader: {
          ".wasm": "copy",
        } as any,
      },
    },
  },
});
