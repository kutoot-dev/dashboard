/**
 * Confetti effects for gamified celebrations.
 *
 * Uses canvas-confetti when available, degrades silently otherwise.
 */

type ConfettiFunction = (opts?: Record<string, unknown>) => void;

let confettiModule: ConfettiFunction | null = null;

async function getConfetti(): Promise<ConfettiFunction | null> {
  if (confettiModule) return confettiModule;
  try {
    const mod = await import("canvas-confetti");
    confettiModule = mod.default as unknown as ConfettiFunction;
    return confettiModule;
  } catch {
    return null;
  }
}

/** Standard celebration burst (rank improvement, payout, etc.) */
export async function fireCelebration() {
  const confetti = await getConfetti();
  if (!confetti) return;
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ["#00ff88", "#FFD700", "#ff3366", "#3b82f6"],
  });
}

/** Gold rain for level-up events */
export async function fireGoldRain() {
  const confetti = await getConfetti();
  if (!confetti) return;
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.3 },
    colors: ["#FFD700", "#FFA500", "#FFFF00"],
    gravity: 0.6,
  });
}

/** Small sparkle for achievement unlock */
export async function fireSparkle() {
  const confetti = await getConfetti();
  if (!confetti) return;
  confetti({
    particleCount: 30,
    spread: 40,
    origin: { y: 0.6, x: 0.5 },
    colors: ["#FFD700", "#00ff88"],
    startVelocity: 20,
    gravity: 1.2,
  });
}
