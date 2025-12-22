export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/auth')) return;

  const { ensureLoaded, currentUser } = useMoneyManager();
  await ensureLoaded();

  if (!currentUser.value) {
    if (to.fullPath === '/') return navigateTo('/auth/login');

    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  }
});
