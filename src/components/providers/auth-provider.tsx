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
import {
  clearAuthSession,
  login as loginService,
  loginWithOtp as loginWithOtpService,
  logout as logoutService,
  getMe,
  sendLoginOtp as sendLoginOtpService,
} from "@/lib/api/services/auth.service";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import { useSelectedLocationStore } from "@/lib/stores/selected-location.store";
import { useQueryClientInstance } from "./query-provider";

function syncOpsHubSelectedLocation(user: AuthUser): void {
  if (user.role !== "operations_hub") {
    return;
  }

  const defaultId = user.default_location_id ?? user.branch_id;
  if (defaultId) {
    useSelectedLocationStore.getState().setSelectedLocationId(defaultId);
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithOtp: (mobile: string, otp: string) => Promise<void>;
  sendLoginOtp: (mobile: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClientInstance();

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const isOnboardingRoute = window.location.pathname.startsWith("/onboard");
    const hasToken = !!window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (isOnboardingRoute) {
      setIsLoading(false);
      return;
    }

    if (!hasToken) {
      clearAuthSession();
      setUser(null);
      setIsLoading(false);
      return;
    }

    getMe()
      .then((res) => {
        if (res.success && res.data) {
          syncOpsHubSelectedLocation(res.data);
          setUser(res.data);
        } else {
          clearAuthSession();
          setUser(null);
        }
      })
      .catch(() => {
        clearAuthSession();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await loginService(username, password);
      if (res.success) {
        queryClient.clear();
        if (res.data) {
          syncOpsHubSelectedLocation(res.data);
          setUser(res.data);
        }
        router.push("/dashboard");
      } else {
        throw new Error(res.error?.message ?? "Login failed");
      }
    },
    [router, queryClient],
  );

  const loginWithOtp = useCallback(
    async (mobile: string, otp: string) => {
      const res = await loginWithOtpService(mobile, otp);
      if (res.success) {
        queryClient.clear();
        if (res.data) {
          syncOpsHubSelectedLocation(res.data);
          setUser(res.data);
        }
        router.push("/dashboard");
      } else {
        throw new Error(res.error?.message ?? "Login failed");
      }
    },
    [router, queryClient],
  );

  const sendLoginOtp = useCallback(async (mobile: string) => {
    const res = await sendLoginOtpService(mobile);
    if (!res.success) {
      throw new Error(res.error?.message ?? "Could not send OTP.");
    }
  }, []);

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
        loginWithOtp,
        sendLoginOtp,
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
