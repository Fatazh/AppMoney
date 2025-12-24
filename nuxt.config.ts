// nuxt.config.ts
import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],

  css: [
    "@fortawesome/fontawesome-free/css/all.css",
    "~/assets/css/money-manager.css",
  ],

  // 1. Agar Nuxt mengenali file prisma
  build: {
    transpile: ["@prisma/client"],
  },

  // 2. KUNCI UTAMA: Mencegah error "Magic header" & "Found cons"
  // Kita melarang Vite melakukan optimasi pada folder generated prisma
  vite: {
    optimizeDeps: {
      exclude: ["../app/generated/prisma"],
    },
  },

  nitro: {
    // 3. Wajib ON untuk Cloudflare Workers
    experimental: {
      wasm: true,
    },

    // 4. Pastikan file WASM terbawa saat build
    moduleSideEffects: [
      "../app/generated/prisma/query_engine_bg.postgresql.wasm", // Pastikan nama file ini sesuai (cek folder generated Anda)
      // Atau gunakan wildcard jika ragu:
      "../app/generated/prisma/*.wasm",
    ],

    alias: {
      "pg-native": fileURLToPath(
        new URL("./mock-pg-native.mjs", import.meta.url)
      ),
    },
  },
});
