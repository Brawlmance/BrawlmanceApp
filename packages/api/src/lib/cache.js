const cache = new Map()

module.exports = {
  get(key) {
    const cacheRow = cache.get(key)
    if (!cacheRow) return undefined
    return cacheRow.value
  },
  set(key, value, ttl = 600) {
    const diesAt = Date.now() + ttl * 1000
    const newCacheRow = { value, diesAt }
    cache.set(key, newCacheRow)
  },
}

setInterval(() => {
  const tsNow = Date.now()
  cache.forEach((cacheRow, key) => {
    if (cacheRow.diesAt < tsNow) {
      cache.delete(key)
    }
  })
}, 1000)
