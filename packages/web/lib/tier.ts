/** Must match `validTiers` in packages/api/src/lib/utils.ts */
const VALID_TIERS = new Set(['All', 'Diamond', 'Platinum', 'Gold', 'Silver'])

export function normalizeTier(q: string | string[] | undefined): string {
  const raw = Array.isArray(q) ? q[0] : q
  if (!raw || !VALID_TIERS.has(raw)) return 'All'
  return raw
}
