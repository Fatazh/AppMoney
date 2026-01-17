export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],

  css: [
    "@fortawesome/fontawesome-free/css/all.css",
    "~/assets/css/money-manager.css",
  ],

  app: {
    head: {
      link: [
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      ],
      meta: [
        { name: "theme-color", content: "#0b1220" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
      ],
    },
  },

  runtimeConfig: {
    exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY,
    public: {
      webPushPublicKey: process.env.WEB_PUSH_PUBLIC_KEY,
    },
  },

  nitro: {    
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },
});
