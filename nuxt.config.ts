export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],

  css: [
    "@fortawesome/fontawesome-free/css/all.css",
    "~/assets/css/money-manager.css",
  ],

  runtimeConfig: {
    exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY,
  },

  nitro: {
    esbuild: {
      options: {
        target: "es2022",
      },
    },
  },

});
