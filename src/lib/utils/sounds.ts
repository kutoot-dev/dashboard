/**
 * Sound effects manager for gamified UI.
 *
 * Uses HTML5 Audio API. Sounds are lazy-loaded and cached.
 * Respects user preference via preferences store.
 */

const audioCache = new Map<string, HTMLAudioElement>();

export type SoundEffect = "bell" | "cha-ching" | "level-up" | "tick";

const SOUND_FILES: Record<SoundEffect, string> = {
  bell: "/sounds/bell.mp3",
  "cha-ching": "/sounds/cha-ching.mp3",
  "level-up": "/sounds/level-up.mp3",
  tick: "/sounds/tick.mp3",
};

function getAudio(sound: SoundEffect): HTMLAudioElement {
  const cached = audioCache.get(sound);
  if (cached) return cached;
  const audio = new Audio(SOUND_FILES[sound]);
  audio.preload = "auto";
  audioCache.set(sound, audio);
  return audio;
}

/** Play a sound effect if sounds are enabled */
export function playSound(sound: SoundEffect, enabled = true) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const audio = getAudio(sound);
    audio.currentTime = 0;
    audio.volume = 0.4;
    audio.play().catch(() => {
      // Autoplay blocked — ignore silently
    });
  } catch {
    // Audio not available — ignore silently
  }
}

/** Preload all sounds so they're ready for instant playback */
export function preloadSounds() {
  if (typeof window === "undefined") return;
  (Object.keys(SOUND_FILES) as SoundEffect[]).forEach(getAudio);
}
