import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decodedUser = jwtDecode(storedToken);
                if (decodedUser.exp * 1000 > Date.now()) {
                    setUser({
                        username: decodedUser.sub,
                        role: decodedUser.role
                    });
                    setToken(storedToken);
                } else {
                    setUser(null);
                    localStorage.removeItem('token');
                }
            } catch (error) {
                setUser(null);
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken) => {
        try {
            const decodedUser = jwtDecode(newToken);
            setUser({
                username: decodedUser.sub,
                role: decodedUser.role
            });
            setToken(newToken);
            localStorage.setItem('token', newToken);
        } catch (error) {
            console.error("Login sırasında geçersiz token:", error);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const value = {
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};