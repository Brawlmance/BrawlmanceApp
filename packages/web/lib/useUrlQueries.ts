import { useRouter } from 'next/router'

/** Query keys shared across the app (patch/tier picker). Never include dynamic route params or page-local state. */
const GLOBAL_QUERY_KEYS = ['patch', 'tier'] as const

function queryValueToString(val: string | string[] | undefined): string {
  if (val === undefined) return ''
  return Array.isArray(val) ? (val[0] ?? '') : val
}

/**
 * Builds a `?…` string for cross-page links: preserves patch/tier and optional extras only.
 * Does not forward `legend_id`, `weapon_id`, rankings `sort`/`legend`, search `brawlhalla_id`, etc.
 */
export default function useUrlQueries(extraQueries?: Record<string, string | number | undefined>): string {
  const router = useRouter()
  const out: Record<string, string> = {}

  for (const key of GLOBAL_QUERY_KEYS) {
    const s = queryValueToString(router.query[key] as string | string[] | undefined)
    if (s !== '') out[key] = s
  }

  if (extraQueries) {
    for (const [k, v] of Object.entries(extraQueries)) {
      if (v === undefined) continue
      out[k] = String(v)
    }
  }

  const entries = Object.entries(out)
  if (!entries.length) return ''

  return '?' + entries.map(([name, val]) => `${encodeURIComponent(name)}=${encodeURIComponent(val)}`).join('&')
}
