import Router, { useRouter } from 'next/router'

export default function usePatchAndTier(): {
  patch: string | string[] | undefined
  tier: string | string[] | undefined
} {
  const router = useRouter()

  return { patch: router.query.patch, tier: router.query.tier }
}

export function changePatch(newPatchID: string): void {
  Router.push({
    pathname: Router.pathname,
    query: { ...Router.query, patch: newPatchID },
  })
}

export function changeTier(newTier: string): void {
  Router.push({
    pathname: Router.pathname,
    query: { ...Router.query, tier: newTier },
  })
}
