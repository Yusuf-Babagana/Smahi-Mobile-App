import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/env';

// Server host comes from src/constants/env.ts (EXPO_PUBLIC_BACKEND_URL).
// The trailing slash matters: axios resolves relative paths like 'auth/login/' against it.
const BASE_URL = `${API_URL}/`;

console.log("🔗 Connecting to Backend at:", BASE_URL);

// This module can't reach React context (AuthContext lives above it in the
// tree, and this file is imported by plain non-component code too), so it
// notifies the app the same way: AuthProvider registers itself here on
// mount. Without this, a dead refresh token used to just clear SecureStore
// silently — AuthContext.user stayed populated, so every screen kept
// rendering as "logged in" while every single request (chat polling, push
// registration, artisan search, ...) 401'd forever with nothing telling the
// user to log back in.
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) {
    onSessionExpired = handler;
}

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // Increased timeout for mobile networks
});

// Add Token to every request if logged in
apiClient.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- 401 → refresh-and-retry ---
// Access tokens live 7 days; without this, an expired token made every request
// (even public ones) fail Unauthorized forever until the user re-logged-in.
// Shared promise so N parallel 401s (e.g. chat polling) trigger ONE refresh.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    try {
        const refresh = await SecureStore.getItemAsync('refreshToken');
        if (!refresh) return null;
        // Raw axios: must not go through apiClient (no auth header, no retry loop)
        const res = await axios.post(`${BASE_URL}auth/token/refresh/`, { refresh });
        const access = res.data?.access ?? null;
        if (access) await SecureStore.setItemAsync('accessToken', access);
        // ROTATE_REFRESH_TOKENS is on server-side: persist the replacement token
        if (res.data?.refresh) await SecureStore.setItemAsync('refreshToken', res.data.refresh);
        return access;
    } catch {
        return null;
    }
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const isLoginCall = original?.url?.includes('auth/login');
        if (error.response?.status === 401 && original && !original._retry && !isLoginCall) {
            original._retry = true;
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
            }
            const newToken = await refreshPromise;
            if (newToken) {
                original.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(original);
            }
            // Refresh failed (revoked/expired/blacklisted): drop the dead
            // session and tell AuthProvider to clear its state and send the
            // user to login, instead of every screen silently spamming 401s.
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await AsyncStorage.removeItem('user');
            onSessionExpired?.();
        }
        return Promise.reject(error);
    }
);

export default apiClient;