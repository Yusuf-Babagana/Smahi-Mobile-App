import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// --------------------------------------------------------
// LIVE PRODUCTION SERVER
const BASE_URL = 'https://smahi1.pythonanywhere.com/api';
// --------------------------------------------------------

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