export type ScoringWeights = Record<string, number>;

export function normalizeScoringWeights(keys: string[], raw?: ScoringWeights): ScoringWeights {
  if (keys.length === 0) {
    return {};
  }

  const sanitized = keys.reduce<ScoringWeights>((acc, key) => {
    const value = Number(raw?.[key]);
    acc[key] = Number.isFinite(value) && value > 0 ? value : 0;
    return acc;
  }, {});

  const sum = Object.values(sanitized).reduce((total, value) => total + value, 0);

  if (sum <= 0) {
    const equal = 1 / keys.length;
    return keys.reduce<ScoringWeights>((acc, key) => {
      acc[key] = equal;
      return acc;
    }, {});
  }

  return keys.reduce<ScoringWeights>((acc, key) => {
    acc[key] = sanitized[key] / sum;
    return acc;
  }, {});
}

export function getScoringWeight(key: string, keys: string[], weights?: ScoringWeights): number {
  if (!keys.length) {
    return 0;
  }

  if (weights && Number.isFinite(weights[key])) {
    return Number(weights[key]);
  }

  return 1 / keys.length;
}
