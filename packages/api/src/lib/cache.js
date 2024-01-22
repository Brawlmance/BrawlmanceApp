const cacheMap = new Map()

const cache = {
  get(key) {
    const cacheRow = cacheMap.get(key)
    if (!cacheRow) return undefined
    return cacheRow.value
  },
  set(key, value, ttl = 600) {
    const diesAt = Date.now() + ttl * 1000
    const newCacheRow = { value, diesAt }
    cacheMap.set(key, newCacheRow)
  },
}
module.exports = cache

setInterval(() => {
  const tsNow = Date.now()
  cacheMap.forEach((cacheRow, key) => {
    if (cacheRow.diesAt < tsNow) {
      cacheMap.delete(key)
    }
  })
}, 1000)
