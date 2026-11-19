
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import ApiClient, {
    setAccessToken
} from "../apiClient/Interceptor";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication when application loads
    useEffect(() => {

        const checkAuth = async () => {
            try {
                const response = await ApiClient.get("/user/profile");

                setUser(response.data.user);

            } catch (error) {

                // If profile fails, try refreshing session
                try {
                    const refreshResponse = await ApiClient.post(
                        "/user/refresh"
                    );

                    const newToken =
                        refreshResponse.data.accessToken;

                    if (!newToken) {
                        throw new Error("Access token missing");
                    }

                    setAccessToken(newToken);

                    const profileResponse =
                        await ApiClient.get("/user/profile");

                    setUser(profileResponse.data.user);

                } catch (refreshError) {

                    setAccessToken(null);
                    setUser(null);

                }

            } finally {
                setLoading(false);
            }
        };

        checkAuth();

    }, []);

    const isAuthenticated = !!user;

    // Sign in
    const signin = (userData, token) => {

        setUser(userData);

        if (token) {
            setAccessToken(token);
        }
    };

    // Logout
    const signout = async () => {

        try {
            await ApiClient.post("/user/logout");

        } catch (error) {
            console.error("Logout error:", error);

        } finally {

            setAccessToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isAuthenticated,
                loading,
                signin,
                signout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
