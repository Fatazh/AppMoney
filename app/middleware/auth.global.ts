export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/auth')) return;

  const { ensureLoaded, currentUser, cacheOfflineSession } = useMoneyManager();
  if (process.client && !navigator.onLine) {
    await ensureLoaded();
    if (!currentUser.value) {
      return navigateTo('/auth/login');
    }
    return;
  }

  if (!currentUser.value) {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined;
    const response = await $fetch<{ user: { id: string; email: string; name?: string | null } | null }>(
      '/api/auth/me',
      { headers }
    ).catch(() => ({ user: null }));

    if (!response.user) {
      if (to.fullPath === '/') return navigateTo('/auth/login');

      return navigateTo({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      });
    }

    currentUser.value = response.user;
    cacheOfflineSession();
  }

  void ensureLoaded();
});
