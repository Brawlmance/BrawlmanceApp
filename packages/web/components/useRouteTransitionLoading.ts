import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

export function useRouteTransitionLoading(): boolean {
  const router = useRouter()
  const [routeLoading, setRouteLoading] = useState(false)
  const pendingNavRef = useRef(0)

  useEffect(() => {
    const onStart = () => {
      pendingNavRef.current += 1
      setRouteLoading(true)
    }
    const onEnd = () => {
      pendingNavRef.current = Math.max(0, pendingNavRef.current - 1)
      if (pendingNavRef.current === 0) setRouteLoading(false)
    }
    router.events.on('routeChangeStart', onStart)
    router.events.on('routeChangeComplete', onEnd)
    router.events.on('routeChangeError', onEnd)
    return () => {
      router.events.off('routeChangeStart', onStart)
      router.events.off('routeChangeComplete', onEnd)
      router.events.off('routeChangeError', onEnd)
    }
  }, [router])

  return routeLoading
}
