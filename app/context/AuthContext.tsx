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
}

interface RegisterData {
  username: string;
  name: string;
  password: string;
}

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
      // Ensure we're consistently using a string representation of the ID
      apiService.setCurrentUserId(String(user.id));
      console.log("Set current user ID in API service:", user.id);
    } else {
      apiService.setCurrentUserId(null);
      console.log("Cleared current user ID in API service");
    }
  }, [apiService, user]);

  // Initialize user from localStorage on mount
  useEffect(() => {
    if (storedUser && token) {
      console.log("Restoring user from localStorage:", storedUser);
      setUser(storedUser);
      setLoading(false);
    } else if (!token) {
      setUser(null);
      setLoading(false);
    } else {
      fetchCurrentUser();
    }
  }, [storedUser, token]);

  const fetchCurrentUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // In a real app, you would have a /me endpoint
      // Here we fake it - in a real app this would be more reliable
      const users = await apiService.get<User[]>("/users");

      // Find user with matching token - this is more reliable than using first user
      const foundUser = users.find((u) => u.token === token);

      if (foundUser) {
        console.log("Found current user:", foundUser);
        setUser(foundUser);
        setStoredUser(foundUser); // Store in localStorage
      } else {
        console.warn("User not found with token, clearing auth state");
        clearToken();
        clearStoredUser();
        setUser(null);
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
    const protectedRoutes = ["/users", "/users/"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname === route || pathname?.startsWith("/users/")
    );

    if (!loading && !token && isProtectedRoute) {
      router.push("/login");
    }
  }, [pathname, token, loading, router]);

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
        setStoredUser(response); // Store in localStorage
        router.push("/users");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const response = await apiService.post<User>("/users", userData);
      if (response && response.token) {
        console.log("Registration successful, user:", response);
        setToken(response.token);
        setUser(response);
        setStoredUser(response); // Store in localStorage
        router.push("/users");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // If you have a logout API endpoint
      if (user?.id) {
        await apiService.post(`/logout/${user.id}`, {});
      }
      clearToken();
      clearStoredUser();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails on server, clear local state
      clearToken();
      clearStoredUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    return fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
