"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { useApi } from "@/hooks/useApi";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  getUser: () => User | null;
}

// RegisterData interface for registration form
interface RegisterData {
  username: string;
  name: string;
  password: string;
}

// Create context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { value: storedUser, set: setStoredUser, clear: clearStoredUser } =
    useLocalStorage<User | null>("currentUser", null);
  const { value: token, set: setToken, clear: clearToken } = useLocalStorage<
    string
  >("token", "");
  const router = useRouter();
  const pathname = usePathname();
  const apiService = useApi();

  // Update API service with current user ID whenever user changes
  useEffect(() => {
    if (user && user.id) {
      apiService.setCurrentUserId(String(user.id));
      console.log("Set current user ID in API service:", user.id);
    } else {
      apiService.setCurrentUserId(null);
      console.log("Cleared current user ID in API service");
    }
  }, [apiService, user]);

  // Validate session on initialization
  useEffect(() => {
    const validateSession = async () => {
      if (token) {
        try {
          await fetchCurrentUser();
        } catch (error) {
          console.error("Session validation failed:", error);
          clearToken();
          clearStoredUser();
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  // Fetch current user from API
  const fetchCurrentUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const users = await apiService.get<User[]>("/users");
      const foundUser = users.find((u) => u.token === token);

      if (foundUser && foundUser.status === "ONLINE") {
        console.log("Found current user:", foundUser);
        setUser(foundUser);
        setStoredUser(foundUser);
      } else {
        console.warn("User not found or not ONLINE, clearing auth state");
        // Clear authentication state
        clearToken();
        clearStoredUser();
        setUser(null);
        if (pathname !== "/login" && pathname !== "/register") {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      clearToken();
      clearStoredUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check for protected routes
  useEffect(() => {
    const protectedRoutes = ["/game-lobby", "/game-lobby/"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname === route || pathname?.startsWith("/game-lobby/")
    );
    if (!loading && !user && isProtectedRoute) {
      router.push("/login");
    } else if (!loading && user && pathname === "/") {
      router.push("/game-lobby");
    }
  }, [pathname, user, loading, router]);

  // Login function
  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.post<User>("/login", {
        username,
        password,
      });
      if (response && response.token) {
        console.log("Login successful, user:", response);
        setToken(response.token);
        setUser(response);
        setStoredUser(response);
        router.push("/game-lobby");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Registration function
  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const response = await apiService.post<User>("/users", userData);
      if (response && response.token) {
        console.log("Registration successful, user:", response);
        setToken(response.token);
        setUser(response);
        setStoredUser(response);
        router.push("/game-lobby");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        try {
          // Try to call the server, but don't wait if it fails
          await apiService.post(`/logout/${user.id}`, {});
        } catch (logoutError) {
          console.error(
            "Server logout failed, continuing with local logout:",
            logoutError,
          );
        }
      }
      // Always clear local state regardless of server response
      clearToken();
      clearStoredUser();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force cleanup in case of error
      clearToken();
      clearStoredUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh user function
  const refreshUser = async () => {
    return fetchCurrentUser();
  };

  // getUser function
  const getUser = () => user;

  // Provide context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        refreshUser,
        getUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
