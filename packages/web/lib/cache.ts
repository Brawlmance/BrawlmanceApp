interface CacheRow<T> {
  value: T
  diesAt: number
}

const cache = new Map<string, CacheRow<unknown>>()

const cacheApi = {
  get<T>(key: string): T | undefined {
    const cacheRow = cache.get(key)
    if (!cacheRow) return undefined
    return cacheRow.value as T
  },
  set<T>(key: string, value: T, ttl = 600): void {
    const diesAt = Date.now() + ttl * 1000
    cache.set(key, { value, diesAt })
  },
}

export default cacheApi

setInterval(() => {
  const tsNow = Date.now()
  cache.forEach((cacheRow, key) => {
    if (cacheRow.diesAt < tsNow) {
      cache.delete(key)
    }
  })
}, 1000)
