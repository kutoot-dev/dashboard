import { CommunityBuildCard } from "@/components/community-build/community-build-screen";
import {
  COMMUNITY_BUILD_CATEGORIES,
  COMMUNITY_BUILD_SCREENS,
} from "@/lib/community-build/screens";

export default function CommunityBuildPage() {
  return (
    <main className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#131313] p-6 text-white shadow-[0_28px_80px_rgba(10,12,30,0.34)] md:p-8">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#8b5cf6]/30 blur-3xl" />
        <div className="absolute -bottom-28 right-10 h-72 w-72 rounded-full bg-[#efff00]/14 blur-3xl" />
        <div className="relative z-10">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.35em] text-[#efff00]">
            Merchant Community Build
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl">
            Kutoot gamified squad rewards screens
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
            All 24 Stitch screens are mapped here with matching street-bold visual direction, target routes,
            API actions, integration notes, and QA checks for community, teams, rewards, ranks, chat, stamps,
            and profile flows.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Screens</p>
              <p className="mt-2 font-display text-4xl font-black text-white">{COMMUNITY_BUILD_SCREENS.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Docs</p>
              <p className="mt-2 font-display text-4xl font-black text-white">2</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Design</p>
              <p className="mt-2 font-display text-4xl font-black text-white">Dark</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Theme</p>
              <p className="mt-2 font-display text-4xl font-black text-white">Neon</p>
            </div>
          </div>
        </div>
      </section>

      {COMMUNITY_BUILD_CATEGORIES.map((category) => {
        const screens = COMMUNITY_BUILD_SCREENS.filter((screen) => screen.category === category);
        if (screens.length === 0) return null;

        return (
          <section key={category}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  {screens.length} screens
                </p>
                <h2 className="mt-1 font-display text-3xl font-black uppercase text-foreground">{category}</h2>
              </div>
            </div>
            <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
              {screens.map((screen) => (
                <CommunityBuildCard key={screen.id} screen={screen} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
