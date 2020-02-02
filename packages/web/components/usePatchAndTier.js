import Router, { useRouter } from 'next/router'

export default function usePatchAndTier() {
  const router = useRouter()

  return { patch: router.query.patch, tier: router.query.tier }
}

export function changePatch(newPatchID) {
  Router.push({
    pathname: Router.pathname,
    query: { ...Router.query, patch: newPatchID },
  })
}

export function changeTier(newTier) {
  Router.push({
    pathname: Router.pathname,
    query: { ...Router.query, tier: newTier },
  })
}
