import db from './db'
import cache from './cache'
import type { Request } from 'express'

export async function getPatchDaysCondition(patch: string, tier: string): Promise<string> {
  const cacheKey = `getPatchDaysCondition:${patch}:${tier}`
  const cachedResult = cache.get<string>(cacheKey)
  if (cachedResult !== undefined) return cachedResult

  const firstRows = (await db.query('SELECT timestamp FROM patches WHERE changes=1 AND id=?', [patch])) as {
    timestamp: number
  }[]
  let currentPatch: number | undefined = firstRows[0]?.timestamp

  if (!currentPatch) {
    const fallbackRows = (await db.query('SELECT MIN(timestamp) as timestamp FROM patches WHERE changes=1 LIMIT 1', [
      patch,
    ])) as { timestamp: number }[]
    currentPatch = fallbackRows[0]?.timestamp
  }

  if (currentPatch === undefined) {
    throw new Error('Could not resolve patch window')
  }

  const nextRows = (await db.query(
    'SELECT MIN(timestamp) as timestamp FROM patches WHERE changes=1 AND timestamp>? LIMIT 1',
    [currentPatch]
  )) as { timestamp: number }[]
  let nextPatch = nextRows[0]?.timestamp
  if (!nextPatch) nextPatch = Math.floor(Date.now() / 1000)

  const currentPatchDay = Math.floor(currentPatch / 60 / 60 / 24) + 1
  const nextPatchDay = Math.floor(nextPatch / 60 / 60 / 24) + 1

  const result = `(day>${currentPatchDay} AND day<${nextPatchDay} AND tier='${tier}')`
  cache.set(cacheKey, result)
  return result
}

export async function getPatchGlobalInfo(daysCondition: string): Promise<{ winRateBalance: number; totalGames: number }> {
  const cacheKey = `getPatchGlobalInfo:${daysCondition}`
  const cachedResult = cache.get<{ winRateBalance: number; totalGames: number }>(cacheKey)
  if (cachedResult !== undefined) return cachedResult

  const totalGamesRows = (await db.query(`SELECT SUM(games) as totalGames FROM stats WHERE ${daysCondition}`)) as {
    totalGames: number | null
  }[]
  const totalWinsRows = (await db.query(`SELECT SUM(wins) as totalWins FROM stats WHERE ${daysCondition}`)) as {
    totalWins: number | null
  }[]

  const totalGames = totalGamesRows[0]?.totalGames
  const totalWins = totalWinsRows[0]?.totalWins

  let winRateBalance: number
  if (!totalWins) {
    winRateBalance = 1
  } else {
    winRateBalance = (totalGames || 0) / totalWins / 2
  }

  const result = {
    winRateBalance,
    totalGames: totalGames || 0,
  }
  cache.set(cacheKey, result)
  return result
}

export async function getReqPatchAndTier(req: Request | undefined): Promise<{ patch: string; tier: string }> {
  if (!req) throw new Error('req param needed')
  let patch = req.query.patch as string | undefined
  let tier = req.query.tier as string | undefined

  const validTiers = new Set(['All', 'Diamond', 'Platinum', 'Gold', 'Silver'])
  if (!tier || !validTiers.has(tier)) tier = 'All'

  if (!patch || patch === 'undefined') {
    patch = await getCurrentPatch()
  }

  return {
    patch,
    tier,
  }
}

async function getCurrentPatch(): Promise<string> {
  const cacheKey = `getCurrentPatch`
  const cachedResult = cache.get<string>(cacheKey)
  if (cachedResult !== undefined) return cachedResult

  const tsNow = Math.floor(Date.now() / 1000)
  const rows = (await db.query(
    `SELECT id FROM patches WHERE changes='1' AND timestamp<${tsNow}-60*60*24*2 ORDER BY timestamp DESC LIMIT 1`
  )) as { id: string }[]
  const patch = rows[0]?.id
  if (!patch) throw new Error('No current patch found')
  cache.set(cacheKey, patch)
  return patch
}
