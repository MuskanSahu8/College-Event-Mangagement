
import axios from "axios";

const ApiClient = axios.create({
    baseURL: "https://college-event-mangagement.onrender.com/api",
    withCredentials: true
});

// Store access token in memory
let accessToken = null;

// Function to update access token
export const setAccessToken = (token) => {
    accessToken = token;
};

// Request interceptor
ApiClient.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

ApiClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/user/signin") &&
            !originalRequest.url.includes("/user/refresh")
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return ApiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await ApiClient.post("/user/refresh");

                const newToken = response.data.accessToken;

                setAccessToken(newToken);

                processQueue(null, newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                return ApiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                setAccessToken(null);

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default ApiClient;
