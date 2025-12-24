// nuxt.config.ts
import { fileURLToPath } from "node:url";

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
    assetsInclude: isProduction ? ["**/*.wasm"] : [],

    optimizeDeps: {
      exclude: ["../app/generated/prisma"],
    },
  },

  nitro: {
    experimental: {
      wasm: isProduction,
    },

    moduleSideEffects: [
      "../app/generated/prisma/query_engine_bg.postgresql.wasm",
      "../app/generated/prisma/*.wasm",
    ],

    alias: isProduction
      ? {
          "pg-native": fileURLToPath(
            new URL("./mock-pg-native.mjs", import.meta.url)
          ),
        }
      : undefined,
  },
});
