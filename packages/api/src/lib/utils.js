const db = require('./db')
const cache = require('./cache')

module.exports.getPatchDaysCondition = getPatchDaysCondition
async function getPatchDaysCondition(patch, tier) {
  const cacheKey = `getPatchDaysCondition:${patch}:${tier}`
  const cachedResult = cache.get(cacheKey)
  if (cachedResult !== undefined) return cachedResult

  let [currentPatch] = await db.query('SELECT timestamp FROM patches WHERE changes=1 AND id=?', [patch])
  if (currentPatch) currentPatch = currentPatch.timestamp
  if (!currentPatch) {
    ;[
      { timestamp: currentPatch },
    ] = await db.query('SELECT MIN(timestamp) as timestamp FROM patches WHERE changes=1 LIMIT 1', [patch])
  }

  let [
    { timestamp: nextPatch },
  ] = await db.query('SELECT MIN(timestamp) as timestamp FROM patches WHERE changes=1 AND timestamp>? LIMIT 1', [
    currentPatch,
  ])
  if (!nextPatch) nextPatch = Math.floor(Date.now() / 1000)

  const currentPatchDay = Math.floor(currentPatch / 60 / 60 / 24) + 1 // patch stats start next day
  const nextPatchDay = Math.floor(nextPatch / 60 / 60 / 24) + 1 // patch stats start next day

  const result = `(day>${currentPatchDay} AND day<${nextPatchDay} AND tier='${tier}')`
  cache.set(cacheKey, result)
  return result
}

module.exports.getPatchGlobalInfo = getPatchGlobalInfo
async function getPatchGlobalInfo(daysCondition) {
  const cacheKey = `getPatchGlobalInfo:${daysCondition}`
  const cachedResult = cache.get(cacheKey)
  if (cachedResult !== undefined) return cachedResult

  const [{ totalGames }] = await db.query(`SELECT SUM(games) as totalGames FROM stats WHERE ${daysCondition}`)
  const [{ totalWins }] = await db.query(`SELECT SUM(wins) as totalWins FROM stats WHERE ${daysCondition}`)

  let winRateBalance
  if (!totalWins) {
    winRateBalance = 1
  } else {
    // Because we're not counting 100% of the matches, and only higher elos, we will have more wins than losses. We use this variable to normalize the winrates
    winRateBalance = totalGames / totalWins / 2
  }

  const result = {
    winRateBalance,
    totalGames: totalGames || 0,
  }
  cache.set(cacheKey, result)
  return result
}

module.exports.getReqPatchAndTier = getReqPatchAndTier
async function getReqPatchAndTier(req) {
  if (!req) throw new Error('req param needed')
  let patch = req.query.patch
  let tier = req.query.tier

  const validTiers = new Set(['All', 'Diamond', 'Platinum', 'Gold', 'Silver'])
  if (!validTiers.has(tier)) tier = 'All'

  if (!patch || patch === 'undefined') {
    patch = await getCurrentPatch()
  }

  return {
    patch,
    tier,
  }
}

async function getCurrentPatch() {
  const cacheKey = `getCurrentPatch`
  const cachedResult = cache.get(cacheKey)
  if (cachedResult !== undefined) return cachedResult

  const tsNow = Math.floor(Date.now() / 1000)
  const [{ id: patch }] = await db.query(
    `SELECT id FROM patches WHERE changes='1' AND timestamp<${tsNow}-60*60*24*2 ORDER BY timestamp DESC LIMIT 1`
  )
  cache.set(cacheKey, patch)
  return patch
}
