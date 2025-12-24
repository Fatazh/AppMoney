// nuxt.config.ts
import { fileURLToPath } from "node:url"; // Gunakan import bawaan Node.js, lebih stabil

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss"],

  css: [
    "@fortawesome/fontawesome-free/css/all.css",
    "~/assets/css/money-manager.css",
  ],

  // Agar Vite tidak merusak file generated Prisma
  vite: {
    optimizeDeps: {
      // Ganti path ini sesuai dengan output di schema.prisma Anda
      // Jika output anda "../app/generated/prisma", gunakan ini:
      exclude: ["../app/generated/prisma"],
    },
  },

  nitro: {
    experimental: {
      wasm: true, // Wajib ON untuk Cloudflare Workers + Prisma
    },

    // Kadang diperlukan agar Nitro tidak membuang file Prisma saat tree-shaking
    moduleSideEffects: [
      "../app/generated/prisma/index.js",
      "../app/generated/prisma/runtime/library.js",
      "../app/generated/prisma/runtime/wasm.js",
    ],

    alias: {
      "pg-native": fileURLToPath(
        new URL("./mock-pg-native.mjs", import.meta.url)
      ),
    },
  },
});
