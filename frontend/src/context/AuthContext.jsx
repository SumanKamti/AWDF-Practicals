import { createContext, useContext, useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  loginUser,
  registerUser,
  googleAuth,
  getCurrentUser,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // "login" | "register"

  const logout = useCallback((showNotification = true) => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken("");
    setUser(null);

    if (showNotification) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "Logged out successfully",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  }, []);

  // Check token validity on mount
  useEffect(() => {
    let ignore = false;

    const verifyToken = async () => {
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!savedToken) {
        if (!ignore) setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        if (!ignore) {
          setUser(userData);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        }
      } catch {
        if (!ignore) {
          logout(false);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    verifyToken();

    // Listen to unauthorized 401 events globally
    const handleUnauthorized = () => {
      logout(false);
      setIsAuthModalOpen(true);
      setAuthModalMode("login");
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Your authentication session has expired. Please log in again to continue.",
      });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      ignore = true;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.token && res.user) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Welcome back, ${res.user.name}!`,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return res;
    }
    throw new Error(res.error || "Login failed");
  };

  const register = async (name, email, password) => {
    const res = await registerUser(name, email, password);
    if (res.token && res.user) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Account created! Welcome, ${res.user.name}!`,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return res;
    }
    throw new Error(res.error || "Registration failed");
  };

  const loginWithGoogle = async (credential) => {
    const res = await googleAuth(credential);
    if (res.token && res.user) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Welcome, ${res.user.name}!`,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return res;
    }
    throw new Error(res.error || "Google authentication failed");
  };

  const openLoginModal = () => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode("register");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
