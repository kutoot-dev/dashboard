import type { CreateDealPayload, Deal } from "@/lib/api/services/merchant.service";

export type DealPreset = {
  id: string;
  label: string;
  hint: string;
  payload: CreateDealPayload;
};

/** Minimum quick-create chips shown when enough templates remain available. */
export const MIN_QUICK_PRESETS = 5;

/** Maximum presets in the horizontal quick-create strip. */
export const MAX_QUICK_PRESETS = 8;

/**
 * Curated pool ordered by retail best practice:
 * margin-safe caps → basket builders → acquisition → peak basket → fixed-amount anchors.
 */
export const DEAL_PRESET_POOL: DealPreset[] = [
  {
    id: "flat-10",
    label: "10% OFF",
    hint: "All bills · footfall",
    payload: {
      discount_type: "percentage",
      discount_value: 10,
      min_order_value: null,
      max_discount_amount: null,
      code: null,
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "flat-8-cap-80",
    label: "8% OFF",
    hint: "Cap Rs 80 · margin-safe",
    payload: {
      discount_type: "percentage",
      discount_value: 8,
      min_order_value: null,
      max_discount_amount: 80,
      code: "FLAT08",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "flat-15",
    label: "15% OFF",
    hint: "All bills · balanced",
    payload: {
      discount_type: "percentage",
      discount_value: 15,
      min_order_value: null,
      max_discount_amount: null,
      code: null,
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "flat-12-min-199",
    label: "12% OFF",
    hint: "Min Rs 199 · cap Rs 150",
    payload: {
      discount_type: "percentage",
      discount_value: 12,
      min_order_value: 199,
      max_discount_amount: 150,
      code: "BITE12",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "flat-20-cap-200",
    label: "20% OFF",
    hint: "Cap Rs 200",
    payload: {
      discount_type: "percentage",
      discount_value: 20,
      min_order_value: null,
      max_discount_amount: 200,
      code: null,
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "lunch-15",
    label: "Lunch 15%",
    hint: "Min Rs 249 · cap Rs 200",
    payload: {
      discount_type: "percentage",
      discount_value: 15,
      min_order_value: 249,
      max_discount_amount: 200,
      code: "LUNCH15",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "welcome-25",
    label: "Welcome 25%",
    hint: "New guests · min Rs 299",
    payload: {
      discount_type: "percentage",
      discount_value: 25,
      min_order_value: 299,
      max_discount_amount: 250,
      code: "WELCOME25",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "happy-hour",
    label: "Happy Hour",
    hint: "18% OFF · cap Rs 180",
    payload: {
      discount_type: "percentage",
      discount_value: 18,
      min_order_value: 199,
      max_discount_amount: 180,
      code: "HAPPYHOUR",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "weekend-30",
    label: "Weekend 30%",
    hint: "Min Rs 499 · cap Rs 300",
    payload: {
      discount_type: "percentage",
      discount_value: 30,
      min_order_value: 499,
      max_discount_amount: 300,
      code: "WEEKEND30",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "bites-40",
    label: "Rs 40 OFF",
    hint: "Min Rs 199 · trial basket",
    payload: {
      discount_type: "fixed",
      discount_value: 40,
      min_order_value: 199,
      max_discount_amount: null,
      code: "BITES40",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "save-50",
    label: "Save Rs 50",
    hint: "Min Rs 299",
    payload: {
      discount_type: "fixed",
      discount_value: 50,
      min_order_value: 299,
      max_discount_amount: null,
      code: "SAVE50",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "save-75",
    label: "Save Rs 75",
    hint: "Min Rs 499",
    payload: {
      discount_type: "fixed",
      discount_value: 75,
      min_order_value: 499,
      max_discount_amount: null,
      code: "SAVE75",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "save-100",
    label: "Save Rs 100",
    hint: "Min Rs 799",
    payload: {
      discount_type: "fixed",
      discount_value: 100,
      min_order_value: 799,
      max_discount_amount: null,
      code: "SAVE100",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "family-combo",
    label: "Family Combo",
    hint: "Rs 150 OFF · Rs 1200+",
    payload: {
      discount_type: "fixed",
      discount_value: 150,
      min_order_value: 1200,
      max_discount_amount: null,
      code: "FAMILY150",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "first-20",
    label: "First Visit 20%",
    hint: "Min Rs 399 · cap Rs 250",
    payload: {
      discount_type: "percentage",
      discount_value: 20,
      min_order_value: 399,
      max_discount_amount: 250,
      code: "FIRST20",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "weekday-22",
    label: "Weekday 22%",
    hint: "Min Rs 599 · cap Rs 350",
    payload: {
      discount_type: "percentage",
      discount_value: 22,
      min_order_value: 599,
      max_discount_amount: 350,
      code: "WEEKDAY22",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "boost-28",
    label: "Boost 28%",
    hint: "Min Rs 699 · cap Rs 320",
    payload: {
      discount_type: "percentage",
      discount_value: 28,
      min_order_value: 699,
      max_discount_amount: 320,
      code: "BOOST28",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "mega-35",
    label: "Mega 35%",
    hint: "Min Rs 999 · cap Rs 400",
    payload: {
      discount_type: "percentage",
      discount_value: 35,
      min_order_value: 999,
      max_discount_amount: 400,
      code: "MEGA35",
      starts_at: null,
      expires_at: null,
    },
  },
  {
    id: "save-125",
    label: "Save Rs 125",
    hint: "Min Rs 999 · big ticket",
    payload: {
      discount_type: "fixed",
      discount_value: 125,
      min_order_value: 999,
      max_discount_amount: null,
      code: "SAVE125",
      starts_at: null,
      expires_at: null,
    },
  },
];

/** Scoring-metric → preset ids (must exist in {@link DEAL_PRESET_POOL}). */
export const METRIC_PRESET_MAP: Record<string, string[]> = {
  discount_aggression_score: ["flat-8-cap-80", "flat-10", "flat-12-min-199", "flat-15", "flat-20-cap-200"],
  user_growth_score: ["welcome-25", "first-20", "weekend-30", "happy-hour", "lunch-15"],
  repeat_rate_score: ["flat-15", "lunch-15", "save-50", "save-75", "bites-40"],
  gmv_score: ["family-combo", "save-125", "weekend-30", "mega-35", "boost-28"],
  platform_capture_score: ["happy-hour", "flat-12-min-199", "save-50", "weekday-22", "flat-15"],
};

type DynamicTemplate = {
  id: string;
  label: string;
  hint: string;
  codeBase: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number | null;
  max_discount_amount: number | null;
};

/** Extra templates used only when the curated pool is mostly exhausted. */
const DYNAMIC_PRESET_TEMPLATES: DynamicTemplate[] = [
  {
    id: "dyn-5-cap",
    label: "5% OFF",
    hint: "Cap Rs 50 · ultra safe",
    codeBase: "SAFE05",
    discount_type: "percentage",
    discount_value: 5,
    min_order_value: null,
    max_discount_amount: 50,
  },
  {
    id: "dyn-14-cap",
    label: "14% OFF",
    hint: "Min Rs 349 · cap Rs 220",
    codeBase: "DEAL14",
    discount_type: "percentage",
    discount_value: 14,
    min_order_value: 349,
    max_discount_amount: 220,
  },
  {
    id: "dyn-16-cap",
    label: "16% OFF",
    hint: "Min Rs 399 · cap Rs 240",
    codeBase: "DEAL16",
    discount_type: "percentage",
    discount_value: 16,
    min_order_value: 399,
    max_discount_amount: 240,
  },
  {
    id: "dyn-24-cap",
    label: "24% OFF",
    hint: "Min Rs 549 · cap Rs 280",
    codeBase: "DEAL24",
    discount_type: "percentage",
    discount_value: 24,
    min_order_value: 549,
    max_discount_amount: 280,
  },
  {
    id: "dyn-32-cap",
    label: "32% OFF",
    hint: "Min Rs 899 · cap Rs 380",
    codeBase: "DEAL32",
    discount_type: "percentage",
    discount_value: 32,
    min_order_value: 899,
    max_discount_amount: 380,
  },
  {
    id: "dyn-60-off",
    label: "Rs 60 OFF",
    hint: "Min Rs 349",
    codeBase: "OFF60",
    discount_type: "fixed",
    discount_value: 60,
    min_order_value: 349,
    max_discount_amount: null,
  },
  {
    id: "dyn-90-off",
    label: "Rs 90 OFF",
    hint: "Min Rs 599",
    codeBase: "OFF90",
    discount_type: "fixed",
    discount_value: 90,
    min_order_value: 599,
    max_discount_amount: null,
  },
  {
    id: "dyn-110-off",
    label: "Rs 110 OFF",
    hint: "Min Rs 849",
    codeBase: "OFF110",
    discount_type: "fixed",
    discount_value: 110,
    min_order_value: 849,
    max_discount_amount: null,
  },
  {
    id: "dyn-140-off",
    label: "Rs 140 OFF",
    hint: "Min Rs 1099",
    codeBase: "OFF140",
    discount_type: "fixed",
    discount_value: 140,
    min_order_value: 1099,
    max_discount_amount: null,
  },
  {
    id: "dyn-26-cap",
    label: "26% OFF",
    hint: "Min Rs 749 · cap Rs 300",
    codeBase: "SPARK26",
    discount_type: "percentage",
    discount_value: 26,
    min_order_value: 749,
    max_discount_amount: 300,
  },
];

function normalizeOptionalAmount(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value);
}

export function presetFingerprint(payload: CreateDealPayload): string {
  return [
    payload.discount_type,
    Number(payload.discount_value),
    normalizeOptionalAmount(payload.min_order_value ?? null) ?? "",
    normalizeOptionalAmount(payload.max_discount_amount ?? null) ?? "",
    payload.code?.trim().toUpperCase() ?? "",
  ].join("|");
}

export function presetMatchesDeal(payload: CreateDealPayload, deal: Deal): boolean {
  const presetCode = payload.code?.trim().toUpperCase();
  if (presetCode) {
    const dealCode = deal.code?.trim().toUpperCase();
    if (dealCode && dealCode === presetCode) {
      return true;
    }
  }

  return (
    deal.discount_type === payload.discount_type &&
    Number(deal.discount_value) === Number(payload.discount_value) &&
    normalizeOptionalAmount(deal.min_order_value) === normalizeOptionalAmount(payload.min_order_value ?? null) &&
    normalizeOptionalAmount(deal.max_discount_amount) === normalizeOptionalAmount(payload.max_discount_amount ?? null)
  );
}

export function isPresetAlreadyCreated(preset: DealPreset, deals: Deal[]): boolean {
  return deals.some((deal) => presetMatchesDeal(preset.payload, deal));
}

function reserveUniqueCode(base: string, usedCodes: Set<string>): string {
  const normalizedBase = base.trim().toUpperCase();
  if (!usedCodes.has(normalizedBase)) {
    usedCodes.add(normalizedBase);
    return normalizedBase;
  }

  for (let suffix = 2; suffix <= 99; suffix++) {
    const candidate = `${normalizedBase}${suffix}`;
    if (!usedCodes.has(candidate)) {
      usedCodes.add(candidate);
      return candidate;
    }
  }

  const fallback = `${normalizedBase}${Date.now().toString(36).slice(-4).toUpperCase()}`;
  usedCodes.add(fallback);
  return fallback;
}

function buildDynamicPreset(template: DynamicTemplate, usedCodes: Set<string>): DealPreset {
  const code = reserveUniqueCode(template.codeBase, usedCodes);

  return {
    id: `${template.id}-${code.toLowerCase()}`,
    label: template.label,
    hint: template.hint,
    payload: {
      discount_type: template.discount_type,
      discount_value: template.discount_value,
      min_order_value: template.min_order_value,
      max_discount_amount: template.max_discount_amount,
      code,
      starts_at: null,
      expires_at: null,
    },
  };
}

function seedUsedCodes(deals: Deal[], usedCodes: Set<string>) {
  for (const deal of deals) {
    const code = deal.code?.trim().toUpperCase();
    if (code) usedCodes.add(code);
  }
}

type SelectPresetOptions = {
  minCount?: number;
  maxCount?: number;
  preferredIds?: string[];
};

/**
 * Pick unique presets not yet live at this branch. Fills with dynamic templates until
 * {@link minCount} is met (when mathematically possible).
 */
export function selectAvailablePresets(existingDeals: Deal[], options: SelectPresetOptions = {}): DealPreset[] {
  const minCount = options.minCount ?? MIN_QUICK_PRESETS;
  const maxCount = options.maxCount ?? MAX_QUICK_PRESETS;
  const preferredIds = options.preferredIds?.filter(Boolean) ?? [];

  const usedCodes = new Set<string>();
  const usedFingerprints = new Set<string>();
  seedUsedCodes(existingDeals, usedCodes);

  const selected: DealPreset[] = [];

  const tryAdd = (preset: DealPreset): boolean => {
    if (selected.length >= maxCount) return false;
    if (isPresetAlreadyCreated(preset, existingDeals)) return false;

    const fingerprint = presetFingerprint(preset.payload);
    if (usedFingerprints.has(fingerprint)) return false;

    const code = preset.payload.code?.trim().toUpperCase();
    if (code && usedCodes.has(code)) return false;

    selected.push(preset);
    usedFingerprints.add(fingerprint);
    if (code) usedCodes.add(code);

    return true;
  };

  const orderedPool =
    preferredIds.length > 0
      ? [
          ...DEAL_PRESET_POOL.filter((preset) => preferredIds.includes(preset.id)),
          ...DEAL_PRESET_POOL.filter((preset) => !preferredIds.includes(preset.id)),
        ]
      : DEAL_PRESET_POOL;

  for (const preset of orderedPool) {
    tryAdd(preset);
  }

  if (selected.length < minCount) {
    for (const template of DYNAMIC_PRESET_TEMPLATES) {
      if (selected.length >= minCount) break;
      const dynamicPreset = buildDynamicPreset(template, usedCodes);
      tryAdd(dynamicPreset);
    }
  }

  return selected.slice(0, maxCount);
}

export function selectQuickCreatePresets(existingDeals: Deal[]): DealPreset[] {
  return selectAvailablePresets(existingDeals, {
    minCount: MIN_QUICK_PRESETS,
    maxCount: MAX_QUICK_PRESETS,
  });
}

export function selectRecommendedPresets(existingDeals: Deal[], metric: string): DealPreset[] {
  const preferredIds = METRIC_PRESET_MAP[metric] ?? [];

  return selectAvailablePresets(existingDeals, {
    minCount: Math.min(3, MIN_QUICK_PRESETS),
    maxCount: 6,
    preferredIds,
  });
}

/** Suggested starting points for a merchant-defined deal (tried in order). */
const CUSTOM_DEAL_SUGGESTIONS: Array<{
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number | null;
  max_discount_amount: number | null;
  codeBase: string;
}> = [
  {
    discount_type: "percentage",
    discount_value: 15,
    min_order_value: 299,
    max_discount_amount: 200,
    codeBase: "CUSTOM15",
  },
  {
    discount_type: "percentage",
    discount_value: 12,
    min_order_value: 249,
    max_discount_amount: 180,
    codeBase: "STORE12",
  },
  {
    discount_type: "fixed",
    discount_value: 60,
    min_order_value: 399,
    max_discount_amount: null,
    codeBase: "OFF60",
  },
  {
    discount_type: "percentage",
    discount_value: 18,
    min_order_value: 499,
    max_discount_amount: 220,
    codeBase: "VIP18",
  },
  {
    discount_type: "fixed",
    discount_value: 80,
    min_order_value: 599,
    max_discount_amount: null,
    codeBase: "SAVE80",
  },
];

/**
 * Prefill payload for the custom-deal form when quick presets are exhausted.
 * Picks the first balanced template not already live at this branch.
 */
export function suggestCustomDealDraft(existingDeals: Deal[]): CreateDealPayload {
  const usedCodes = new Set<string>();
  seedUsedCodes(existingDeals, usedCodes);

  for (const suggestion of CUSTOM_DEAL_SUGGESTIONS) {
    const draft: CreateDealPayload = {
      discount_type: suggestion.discount_type,
      discount_value: suggestion.discount_value,
      min_order_value: suggestion.min_order_value,
      max_discount_amount: suggestion.max_discount_amount,
      code: reserveUniqueCode(suggestion.codeBase, usedCodes),
      starts_at: null,
      expires_at: null,
    };

    if (!existingDeals.some((deal) => presetMatchesDeal(draft, deal))) {
      return draft;
    }
  }

  return {
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: null,
    max_discount_amount: 150,
    code: reserveUniqueCode("STORE", usedCodes),
    starts_at: null,
    expires_at: null,
  };
}
