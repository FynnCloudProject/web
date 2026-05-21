export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, fetchUser } = useAuth();

  const { isOffline } = useBackEndConfig();

  if (!user.value && !isOffline.value) {
    await fetchUser();
  }

  const publicRoutes = ["/auth/login", "/auth/register", "/auth/callback"];
  const isPublicRoute = publicRoutes.some(
    (route) => to.path === route || to.path.startsWith(route),
  );

  // If authenticated and trying to access a public route (like login), redirect to home
  if (user.value && isPublicRoute) {
    return navigateTo("/");
  }

  // If not authenticated and trying to access a protected route, redirect to login
  if (!user.value && !isPublicRoute) {
    if (import.meta.client) {
      // Only allow relative paths that don't start with // (prevent open redirect)
      const redirect = to.fullPath.startsWith('/') && !to.fullPath.startsWith('//')
        ? to.fullPath
        : '/';
      return navigateTo(
        "/auth/login?redirect=" + encodeURIComponent(redirect),
      );
    }
  }

  // If authenticated but not admin and trying to access admin routes, redirect to home
  if (user.value && to.path.startsWith("/admin") && !user.value.isAdmin) {
    return navigateTo("/");
  }
});
