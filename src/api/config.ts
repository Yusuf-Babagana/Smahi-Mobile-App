import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/env';

// Server host comes from src/constants/env.ts (EXPO_PUBLIC_BACKEND_URL).
// The trailing slash matters: axios resolves relative paths like 'auth/login/' against it.
const BASE_URL = `${API_URL}/`;

console.log("🔗 Connecting to Backend at:", BASE_URL);

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

export default apiClient;