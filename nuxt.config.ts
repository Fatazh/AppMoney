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

  nitro: {
    experimental: {
      wasm: true,
    },
    esbuild: {
      options: {
        loader: {
          ".wasm": "copy",
        } as any,
      },
    },
  },
});
