import Link from "next/link";
import type { CommunityBuildScreen } from "@/lib/community-build/screens";

const accentStyles: Record<CommunityBuildScreen["accent"], { text: string; border: string; glow: string; bg: string }> = {
  purple: {
    text: "text-[#d0bcff]",
    border: "border-[#8b5cf6]/45",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.24)]",
    bg: "from-[#8b5cf6]/22",
  },
  yellow: {
    text: "text-[#efff00]",
    border: "border-[#efff00]/45",
    glow: "shadow-[0_0_40px_rgba(239,255,0,0.18)]",
    bg: "from-[#efff00]/18",
  },
  orange: {
    text: "text-[#ff5f00]",
    border: "border-[#ff5f00]/45",
    glow: "shadow-[0_0_40px_rgba(255,95,0,0.18)]",
    bg: "from-[#ff5f00]/18",
  },
  cyan: {
    text: "text-cyan-200",
    border: "border-cyan-300/40",
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.18)]",
    bg: "from-cyan-300/18",
  },
};

function IntegrationBlock({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  const List = ordered ? "ol" : "ul";

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
      <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">{title}</h3>
      <List className="mt-4 space-y-3 text-sm leading-6 text-white/72">
        {items.map((item) => (
          <li key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            {item}
          </li>
        ))}
      </List>
    </section>
  );
}

export function CommunityBuildCard({ screen }: { screen: CommunityBuildScreen }) {
  const accent = accentStyles[screen.accent];

  return (
    <Link
      href={`/community-build/${screen.slug}`}
      className={`group flex h-full flex-col rounded-[1.75rem] border ${accent.border} bg-linear-to-br ${accent.bg} via-white/[0.07] to-black/30 p-5 text-left backdrop-blur-xl transition duration-200 hover:-translate-y-1 ${accent.glow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`font-mono text-[11px] font-bold uppercase tracking-[0.24em] ${accent.text}`}>
            {screen.id} / {screen.category}
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold uppercase leading-tight text-white">
            {screen.title}
          </h2>
        </div>
        <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/72">
          {screen.route.includes("[") ? "Dynamic" : "Route"}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-white/68">{screen.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {screen.metrics.map((metric) => (
          <span key={metric} className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
            {metric}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="font-mono text-xs text-white/50">{screen.route}</span>
        <span className="rounded-full bg-[#efff00] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-black shadow-[4px_4px_0_#8b5cf6]">
          Design
        </span>
      </div>
    </Link>
  );
}

export function CommunityBuildDetail({ screen }: { screen: CommunityBuildScreen }) {
  const accent = accentStyles[screen.accent];

  return (
    <div className="min-h-screen rounded-[2rem] bg-[#131313] p-4 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] md:p-6">
      <section className={`relative overflow-hidden rounded-[2rem] border ${accent.border} bg-linear-to-br ${accent.bg} via-white/[0.08] to-black/40 p-6 ${accent.glow}`}>
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#8b5cf6]/24 blur-3xl" />
        <div className="absolute -bottom-24 left-12 h-56 w-56 rounded-full bg-[#efff00]/12 blur-3xl" />
        <div className="relative z-10">
          <Link href="/community-build" className="font-mono text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white">
            Back to all screens
          </Link>
          <p className={`mt-8 font-mono text-xs font-bold uppercase tracking-[0.35em] ${accent.text}`}>
            {screen.id} / Stitch {screen.stitchScreenId}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white md:text-6xl">
            {screen.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">{screen.headline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#efff00] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[5px_5px_0_#8b5cf6]">
              {screen.primaryAction}
            </span>
            <span className="rounded-full border border-white/15 bg-black/20 px-5 py-3 font-mono text-xs uppercase tracking-[0.14em] text-white/70">
              Target: {screen.route}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {screen.metrics.map((metric, index) => (
          <div key={metric} className="rounded-3xl border border-white/10 bg-white/[0.07] p-5">
            <p className={`font-mono text-xs font-bold uppercase tracking-[0.2em] ${accent.text}`}>0{index + 1}</p>
            <p className="mt-3 font-display text-2xl font-extrabold uppercase text-white">{metric}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#0e0e0e] p-4">
            <div className="mx-auto max-w-sm overflow-hidden rounded-[2rem] border border-white/12 bg-[#131313] shadow-2xl">
              <div className={`bg-linear-to-br ${accent.bg} via-white/[0.06] to-black px-5 pb-6 pt-5`}>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
                    {screen.category}
                  </span>
                  <span className="h-3 w-3 rounded-full bg-[#efff00] shadow-[0_0_18px_#efff00]" />
                </div>
                <h2 className="mt-8 font-display text-4xl font-black uppercase leading-none tracking-tight text-white">
                  {screen.headline}
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/64">{screen.summary}</p>
              </div>
              <div className="space-y-3 p-4">
                {screen.sections.map((section, index) => (
                  <div key={section} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${accent.border} font-mono text-xs font-black ${accent.text}`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{section}</p>
                      <p className="text-xs text-white/48">Glass card, neon accent, esports spacing</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 p-4">
                <button className="w-full rounded-full bg-[#efff00] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[5px_5px_0_#8b5cf6]">
                  {screen.primaryAction}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <IntegrationBlock title="Screen Sections" items={screen.sections} ordered />
          <IntegrationBlock title="API Actions" items={screen.apiActions} />
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <IntegrationBlock title="Integration Notes" items={screen.integrationNotes} />
        <IntegrationBlock title="QA Checklist" items={screen.qaChecks} />
      </section>
    </div>
  );
}
