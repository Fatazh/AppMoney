export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],

  css: [
    "@fortawesome/fontawesome-free/css/all.css",
    "~/assets/css/money-manager.css",
  ],

  nitro: {
    externals: {
    // Pastikan @prisma/client tidak di-bundle, tapi di-load dari node_modules
    inline: [],
    external: ["@prisma/client"]
  },
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
