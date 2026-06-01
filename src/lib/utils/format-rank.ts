/** Display rank for UI (1-based; hide invalid/zero ranks). */
export function formatRank(rank: number | null | undefined): string {
  if (rank == null || rank < 1) {
    return "—";
  }

  return `#${rank}`;
}
