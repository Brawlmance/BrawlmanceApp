import { useRouter } from 'next/router'
export default function useUrlQueries(extraQueries) {
  const router = useRouter()
  const queries = Object.entries({ ...router.query, ...extraQueries })
  if (!queries.length) return ''

  return (
    '?' +
    queries
      .map(([name, val]) => {
        return `${name}=${val}`
      })
      .join('&')
  )
}
