"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";
import { login as loginService, logout as logoutService, getMe } from "@/lib/api/services/auth.service";
import { useQueryClientInstance } from "./query-provider";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClientInstance();

  useEffect(() => {
    getMe()
      .then((res) => {
        if (res.success) {
          setUser(res.data);
        }
      })
      .catch(() => {
        // Not authenticated
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginService(email, password);
      if (res.success) {
        queryClient.clear();
        setUser(res.data);
        router.push("/dashboard");
      } else {
        throw new Error(res.error?.message ?? "Login failed");
      }
    },
    [router, queryClient],
  );

  const logout = useCallback(async () => {
    await logoutService();
    queryClient.clear();
    setUser(null);
    router.push("/login");
  }, [router, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
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
