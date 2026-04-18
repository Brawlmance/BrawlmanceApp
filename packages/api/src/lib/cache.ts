interface CacheRow<T> {
  value: T
  diesAt: number
}

const cacheMap = new Map<string, CacheRow<unknown>>()

const cache = {
  get<T>(key: string): T | undefined {
    const cacheRow = cacheMap.get(key)
    if (!cacheRow) return undefined
    return cacheRow.value as T
  },
  set<T>(key: string, value: T, ttl = 600): void {
    const diesAt = Date.now() + ttl * 1000
    cacheMap.set(key, { value, diesAt })
  },
}
export default cache

setInterval(() => {
  const tsNow = Date.now()
  cacheMap.forEach((cacheRow, key) => {
    if (cacheRow.diesAt < tsNow) {
      cacheMap.delete(key)
    }
  })
}, 1000)
