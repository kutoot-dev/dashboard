"use client";

import Link from "next/link";
import { useCommunityAuth } from "@/components/providers/community-auth-provider";

const links = [
  { href: "/community/feed", label: "Feed" },
  { href: "/community/create", label: "Create" },
  { href: "/community/conversations", label: "Chat" },
  { href: "/community/rewards", label: "Rewards" },
  { href: "/community/stamps", label: "Stamps" },
  { href: "/community/leaderboards", label: "Leaders" },
  { href: "/community/reward-media", label: "Media" },
];

export function CommunityShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useCommunityAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#8b5cf633,transparent_32%),#131313]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#131313]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/community/feed" className="font-[var(--font-brand-display)] text-xl font-extrabold uppercase tracking-tight text-white">
            Kutoot Community
          </Link>
          <nav className="hidden gap-2 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75 hover:border-[#efff00] hover:text-[#efff00]">
                {link.label}
              </Link>
            ))}
          </nav>
          <button onClick={() => void logout()} className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
            {user?.name || "Logout"}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-white/10 bg-[#131313]/90 p-2 backdrop-blur-xl md:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
