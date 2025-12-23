// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  css: [
    "@fortawesome/fontawesome-free/css/all.css",
    "~/assets/css/money-manager.css",
  ],
  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
  },
  nitro: {
    alias: {
      "pg-native": fileURLToPath(
        new URL("./mock-pg-native.mjs", import.meta.url)
      ),
    },
  },
});
function fileURLToPath(arg0: URL): string | undefined {
  if (!(arg0 instanceof URL)) return undefined;
  if (arg0.protocol !== "file:") return undefined;

  let pathname = decodeURIComponent(arg0.pathname);

  // Windows drive letter: remove leading slash "/C:/" -> "C:/"
  if (pathname.length > 1 && pathname[0] === "/" && /^[A-Za-z]:/.test(pathname.slice(1, 3))) {
    pathname = pathname.slice(1);
  }

  // Normalize slashes for Windows
  if (process.platform === "win32") {
    pathname = pathname.replace(/\//g, "\\");
  }

  return pathname;
}

