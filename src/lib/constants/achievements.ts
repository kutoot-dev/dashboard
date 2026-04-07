/**
 * Constants: Achievement definitions
 *
 * Gamified milestones for branches. Evaluated client-side from score data.
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Predicate to check if unlocked (rank, score, etc.) */
  condition: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  rank: number;
  score: number;
  totalBranches: number;
  payoutAmount: number;
  streakWeeks: number;
  referralCount: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-trade",
    name: "First Trade",
    description: "Score calculated for the first time",
    icon: "🎯",
    condition: (ctx) => ctx.score > 0,
  },
  {
    id: "hot-streak",
    name: "Hot Streak",
    description: "3+ consecutive weeks of score improvement",
    icon: "🔥",
    condition: (ctx) => ctx.streakWeeks >= 3,
  },
  {
    id: "top-10",
    name: "Top 10",
    description: "Reach the top 10 in rankings",
    icon: "🏆",
    condition: (ctx) => ctx.rank <= 10,
  },
  {
    id: "century-club",
    name: "Century Club",
    description: "Achieve a composite score above 80",
    icon: "💯",
    condition: (ctx) => ctx.score >= 80,
  },
  {
    id: "referral-king",
    name: "Referral King",
    description: "Refer 3 or more branches to the platform",
    icon: "👑",
    condition: (ctx) => ctx.referralCount >= 3,
  },
  {
    id: "comeback-kid",
    name: "Comeback Kid",
    description: "Improve your rank by 10+ positions in one period",
    icon: "🚀",
    condition: () => false, // Evaluated externally with historical data
  },
  {
    id: "market-mover",
    name: "Market Mover",
    description: "Earn a payout in 5+ consecutive periods",
    icon: "📈",
    condition: (ctx) => ctx.streakWeeks >= 5 && ctx.payoutAmount > 0,
  },
];
