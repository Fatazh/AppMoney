export default defineNuxtPlugin(() => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail: PWA caching isn't critical for core usage.
    });
  });
});
