import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, LoginCredentials } from '../types';
import { authAPI } from '../api/client';
import { setSessionExpiredHandler } from '../api/config';
import { useRouter } from 'expo-router';
import { unregisterCurrentDevice } from '../utils/pushNotifications';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<User>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    // For flows that authenticate outside of login() (registration, post-
    // payment activation) but already have tokens + a fresh user object —
    // populates context/storage without re-hitting the login endpoint.
    setAuthUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    // Guards against apiClient's interceptor firing this once per concurrent
    // 401 (chat polling, artisan search, push registration can all be
    // in flight at once) — only actually clear state/redirect the first time.
    const sessionExpiredHandledRef = useRef(false);

    // Load user from storage on boot
    useEffect(() => {
        loadUser();
    }, []);

    // Registers with apiClient (src/api/config.ts) so a dead refresh token
    // (revoked/expired/blacklisted) forces the user back to login instead of
    // leaving AuthContext.user populated while every request silently 401s.
    useEffect(() => {
        setSessionExpiredHandler(() => {
            if (sessionExpiredHandledRef.current) return;
            sessionExpiredHandledRef.current = true;
            setUser(null);
            AsyncStorage.removeItem('user').catch(() => {});
            router.replace('/login');
        });
        return () => setSessionExpiredHandler(null);
    }, [router]);

    const loadUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const token = await SecureStore.getItemAsync('accessToken');

            if (storedUser && token) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to load user", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async ({ email, password }: LoginCredentials): Promise<User> => {
        // 1. Call API
        const response = await authAPI.login(email, password);
        const loggedInUser = response.user;

        // 2. Save Data
        sessionExpiredHandledRef.current = false; // fresh session — allow a future expiry to be handled again
        setUser(loggedInUser);
        await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));

        // Note: Tokens are usually saved by the API client, but we verify here
        // Verify tokens are saved if your authAPI doesn't handle it automatically
        // or handle it here if needed. Assuming authAPI.login handles token storage via client.ts mechanism

        return loggedInUser;
    };

    const logout = async () => {
        try {
            // Best-effort, bounded to 2s — stop this device from receiving
            // pushes for the account that's about to log out. Must run
            // before the tokens below are cleared, since it's an
            // authenticated call, but a slow/unreachable network (this app's
            // actual operating environment) shouldn't freeze the logout
            // button for up to apiClient's full 15s default timeout.
            await Promise.race([
                unregisterCurrentDevice().catch(() => {}),
                new Promise((resolve) => setTimeout(resolve, 2000)),
            ]);

            setUser(null);
            await AsyncStorage.removeItem('user');
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');

            // Navigate to login
            router.replace('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const setAuthUser = async (nextUser: User) => {
        sessionExpiredHandledRef.current = false; // fresh session — allow a future expiry to be handled again
        setUser(nextUser);
        await AsyncStorage.setItem('user', JSON.stringify(nextUser));
    };

    const updateUser = (userData: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...userData };
            AsyncStorage.setItem('user', JSON.stringify(updated)).catch(console.error);
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
