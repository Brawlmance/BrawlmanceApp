import { useRouter } from 'next/router'
import { useLayoutEffect, useState } from 'react'

function decodeFrag(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function urlFragment(asPath: string): string {
  const i = asPath.indexOf('#')
  return i < 0 ? '' : decodeFrag(asPath.slice(i + 1))
}

/**
 * Whether the URL fragment equals `id`. SSR starts false; `useLayoutEffect` syncs before paint.
 * Router events + `location.hash` cover Next client nav (pushState doesn’t fire `hashchange`).
 */
export function useHashTargetMatch(id: string): boolean {
  const router = useRouter()
  const [matches, setMatches] = useState(false)

  useLayoutEffect(() => {
    setMatches(urlFragment(router.asPath) === id)
  }, [id, router.asPath])

  return matches
}
