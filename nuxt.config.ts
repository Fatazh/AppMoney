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
    optimizeDeps: {
      exclude: [prismaGeneratedPath, "@prisma/client", "@prisma/adapter-pg"],
    },

    build: {
      rollupOptions: {
        // KUNCI PERBAIKAN:
        // Kita gunakan Regex untuk menandai semua file .wasm sebagai "External".
        // Artinya: Vite dilarang mengubah, membundle, atau mengutak-atik file ini.
        // Biarkan Cloudflare yang menanganinya secara native.
        external: [
          /\.wasm$/, // Semua file berakhiran .wasm dianggap external
          "pg-native",
        ],
      },
    },
  },

  nitro: {
    experimental: {
      wasm: true,
    },

    // Pastikan file WASM ikut tercopy ke output folder
    moduleSideEffects: [
      resolve(prismaGeneratedPath, "query_engine_bg.postgresql.wasm"),
      resolve(prismaGeneratedPath, "index.js"),
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
        // Paksa esbuild menyalin file wasm sebagai binary murni
        loader: {
          ".wasm": "copy",
        } as any,
      },
    },
  },
});
