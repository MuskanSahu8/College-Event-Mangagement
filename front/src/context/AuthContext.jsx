
import { createContext, useContext, useEffect, useState } from "react";
import ApiClient, { setAccessToken } from "../apiClient/Interceptor";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication when the application loads
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Axios interceptor will refresh the token if necessary
                const response = await ApiClient.get("/user/profile");

                setUser(response.data.user);
            } catch (error) {
                setUser(null);
                setAccessToken(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const isAuthenticated = !!user;

    // Store user and access token after signin
    const signin = (userData, token) => {
        setUser(userData);
        setAccessToken(token);
    };

    // Logout user
    const signout = async () => {
        try {
            await ApiClient.post("/user/logout");
        } catch (error) {
            console.log("Logout error:", error);
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
                signout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
