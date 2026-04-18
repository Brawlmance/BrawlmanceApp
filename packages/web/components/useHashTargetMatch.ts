import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

function currentHashFragment(): string {
  if (typeof window === 'undefined') return ''
  const h = window.location.hash
  const raw = h.startsWith('#') ? h.slice(1) : h
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/**
 * True when the document URL fragment equals `id`. Updates on client navigations
 * where CSS :target does not reliably recompute (Next.js router / pushState).
 */
export function useHashTargetMatch(id: string): boolean {
  const router = useRouter()
  const [matches, setMatches] = useState(false)

  const sync = useCallback(() => {
    setMatches(currentHashFragment() === id)
  }, [id])

  useEffect(() => {
    sync()
    router.events.on('routeChangeComplete', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      router.events.off('routeChangeComplete', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [router.events, sync])

  return matches
}
