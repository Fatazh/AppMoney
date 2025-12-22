// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  css: ["@fortawesome/fontawesome-free/css/all.css", "~/assets/css/money-manager.css"],
  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
  },
});
