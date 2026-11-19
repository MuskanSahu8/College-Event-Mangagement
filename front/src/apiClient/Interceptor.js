
import axios from "axios";

const ApiClient = axios.create({
    baseURL:"http://localhost:3000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Response interceptor
ApiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error(
            "API Error:",
            error.response?.data || error.message
        );

        return Promise.reject(error);
    }
);

export default ApiClient;
