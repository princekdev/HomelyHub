import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
} from "../services/authService";
import { registerUnauthorizedHandler } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const res = await fetchCurrentUser();
      setUser(res.data.user);
    } catch (err) {
      // Stale / invalid token — wipe it so it isn't re-sent on future requests
      localStorage.removeItem("homelyhub_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    registerUnauthorizedHandler(() => {
      localStorage.removeItem("homelyhub_token");
      setUser(null);
    });
  }, [loadUser]);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    if (res.data.token) localStorage.setItem("homelyhub_token", res.data.token);
    setUser(res.data.user);
    toast.success("Welcome back!");
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await registerUser(payload);
    if (res.data.token) localStorage.setItem("homelyhub_token", res.data.token);
    setUser(res.data.user);
    toast.success("Account created successfully!");
    return res.data.user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // ignore network errors on logout
    }
    localStorage.removeItem("homelyhub_token");
    setUser(null);
    toast.success("Logged out");
  };

  const updateUserInPlace = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUserInPlace,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
