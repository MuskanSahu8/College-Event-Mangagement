
import axios from "axios";

const ApiClient = axios.create({
    baseURL: "https://college-event-mangagement.onrender.com/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Store access token in memory
let accessToken = null;

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

// Refresh token queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};

// Response interceptor
ApiClient.interceptors.response.use(
    (response) => {
        // Save access token after successful signin
        if (response.config.url?.includes("/user/signin")) {
            if (response.data.accessToken) {
                setAccessToken(response.data.accessToken);
            }
        }

        // Clear token after logout
        if (response.config.url?.includes("/user/logout")) {
            setAccessToken(null);
        }

        return response;
    },

    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const requestURL = originalRequest.url || "";

        // Do not refresh these requests
        const excludedURLs = [
            "/user/signin",
            "/user/signup",
            "/user/refresh",
            "/user/logout"
        ];

        const isExcluded = excludedURLs.some((url) =>
            requestURL.includes(url)
        );

        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            isExcluded
        ) {
            return Promise.reject(error);
        }

        // If refresh is already running, wait for it
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${token}`;

                return ApiClient(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const response = await ApiClient.post(
                "/user/refresh"
            );

            const newToken = response.data.accessToken;

            if (!newToken) {
                throw new Error("New access token not received");
            }

            setAccessToken(newToken);

            processQueue(null, newToken);

            originalRequest.headers =
                originalRequest.headers || {};

            originalRequest.headers.Authorization =
                `Bearer ${newToken}`;

            return ApiClient(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);
            setAccessToken(null);

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default ApiClient;
