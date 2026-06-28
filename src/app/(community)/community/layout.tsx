"use client";

import { CommunityAuthProvider } from "@/components/providers/community-auth-provider";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommunityAuthProvider>
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">
        {children}
      </div>
    </CommunityAuthProvider>
  );
}
