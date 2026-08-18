// Single source of truth for where each role lands after authentication.
// Used by app/index.tsx (cold start), app/login.tsx, and app/activate.tsx —
// keep them on this map so a role can never land somewhere different
// depending on which door it came through.
//
// state_coordinator shares the agent dashboard until it gets a dedicated one.
export const ROLE_HOME_ROUTES = {
    client: '/(tabs)/(home)',
    artisan: '/artisan/dashboard',
    agent: '/agent/dashboard',
    state_coordinator: '/agent/dashboard',
    admin: '/admin/dashboard',
} as const;

export const getHomeRouteForRole = (role?: string) =>
    ROLE_HOME_ROUTES[role as keyof typeof ROLE_HOME_ROUTES] || '/(tabs)/(home)';
