
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import ApiClient from "../apiClient/Interceptor";

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
                setUser(null);

            } finally {
                setLoading(false);
            }
        };

        checkAuth();

    }, []);

    const isAuthenticated = !!user;

    // Sign in
    const signin = (userData) => {
        setUser(userData);
    };

    // Logout
    const signout = async () => {

        try {
            await ApiClient.post("/user/logout");

        } catch (error) {
            console.error("Logout error:", error);

        } finally {
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
