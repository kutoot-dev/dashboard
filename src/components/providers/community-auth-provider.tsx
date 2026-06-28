"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearCommunitySession,
  getCommunityMe,
  logoutCommunity,
  sendCommunityOtp,
  verifyCommunityOtp,
} from "@/lib/api/services/community-auth.service";
import { COMMUNITY_TOKEN_STORAGE_KEY } from "@/lib/api/community-client";
import type { CommunityUser } from "@/lib/types/community";

interface CommunityAuthContextValue {
  user: CommunityUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (identifier: string) => Promise<void>;
  verifyOtp: (identifier: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const CommunityAuthContext = createContext<CommunityAuthContextValue | null>(null);

export function CommunityAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CommunityUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasToken = !!window.localStorage.getItem(COMMUNITY_TOKEN_STORAGE_KEY);
    if (!hasToken) {
      clearCommunitySession();
      return;
    }

    getCommunityMe()
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          clearCommunitySession();
          setUser(null);
        }
      })
      .catch(() => {
        clearCommunitySession();
        setUser(null);
      });
  }, []);

  const sendOtp = useCallback(async (identifier: string) => {
    await sendCommunityOtp(identifier);
  }, []);

  const verifyOtp = useCallback(
    async (identifier: string, otp: string) => {
      const res = await verifyCommunityOtp(identifier, otp);
      if (res.data.requires_name) {
        throw new Error("Please complete your name in the mobile app before using community feed.");
      }
      if (res.data.user) {
        setUser(res.data.user);
      }
      router.push("/community/feed");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await logoutCommunity();
    setUser(null);
    router.push("/community/login");
  }, [router]);

  return (
    <CommunityAuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading: false,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </CommunityAuthContext.Provider>
  );
}

export function useCommunityAuth() {
  const context = useContext(CommunityAuthContext);
  if (!context) {
    throw new Error("useCommunityAuth must be used within CommunityAuthProvider");
  }
  return context;
}
