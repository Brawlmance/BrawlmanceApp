import db from './db'
import { getPatchDaysCondition, getPatchGlobalInfo, getPreviousPatchId } from './utils'
import type { StatRank } from './legends'

export type WeaponStatsRow = {
  weapon_id: string
  legends: number
  games: number
  playrate: number
  winrate: number
  damage_dealt: number
  damage_weapon_one: number
  damage_weapon_two: number
  match_time: number
  timeheld: number
  timeheld1: number
  timeheld2: number
}

export type WeaponWithStats = {
  weapon_id: string
  stats: Record<string, number>
}

const WEAPON_SQL_FROM = `
  WITH weapon_mapping AS (
    SELECT legend_id, weapon_one AS weapon_id, 1 AS slot FROM legends WHERE weapon_one IS NOT NULL
    UNION ALL
    SELECT legend_id, weapon_two AS weapon_id, 2 AS slot FROM legends WHERE weapon_two IS NOT NULL
  )
  SELECT 
    wm.weapon_id,
    COUNT(DISTINCT wm.legend_id) AS total_legends,
    SUM(s.games) AS total_games,
    SUM(s.wins) AS total_wins,
    SUM(s.matchtime) AS total_matchtime,
    SUM(CASE WHEN wm.slot = 1 THEN s.damageweaponone ELSE 0 END) AS total_damage_w1,
    SUM(CASE WHEN wm.slot = 2 THEN s.damageweapontwo ELSE 0 END) AS total_damage_w2,
    SUM(CASE WHEN wm.slot = 1 THEN s.timeheldweaponone ELSE 0 END) AS total_timeheld_w1,
    SUM(CASE WHEN wm.slot = 2 THEN s.timeheldweapontwo ELSE 0 END) AS total_timeheld_w2
  FROM stats s
  JOIN weapon_mapping wm ON s.legend_id = wm.legend_id
  WHERE __DAYS__
  __WEAPON_FILTER__
  GROUP BY wm.weapon_id
`

function round2(n: number): number {
  return parseFloat(n.toFixed(2))
}

function rowToWeaponStatsRow(
  row: Record<string, number | string | null>,
  patchGlobalInfo: { winRateBalance: number; totalGames: number }
): WeaponStatsRow | null {
  if (!row.total_games) return null

  const games = parseFloat(String(row.total_games))
  const legends = parseFloat(String(row.total_legends))

  const winrate = parseFloat(String(row.total_wins)) / games
  const damageWeaponOne = parseFloat(String(row.total_damage_w1)) / games
  const damageWeaponTwo = parseFloat(String(row.total_damage_w2)) / games
  const matchTime = parseFloat(String(row.total_matchtime)) / games
  const timeheld1 = parseFloat(String(row.total_timeheld_w1)) / games
  const timeheld2 = parseFloat(String(row.total_timeheld_w2)) / games

  const damageDealt = damageWeaponOne + damageWeaponTwo
  const playrate = (games / legends / patchGlobalInfo.totalGames) * 100
  const timeHeld = timeheld1 + timeheld2

  return {
    weapon_id: String(row.weapon_id ?? ''),
    legends,
    games,
    playrate: round2(playrate),
    winrate: round2(winrate * patchGlobalInfo.winRateBalance * 100),
    damage_dealt: round2(damageDealt),
    damage_weapon_one: round2(damageWeaponOne),
    damage_weapon_two: round2(damageWeaponTwo),
    match_time: round2(matchTime),
    timeheld: round2(timeHeld),
    timeheld1: round2(timeheld1),
    timeheld2: round2(timeheld2),
  }
}

export function weaponStatsRowToRankStats(row: WeaponStatsRow): Record<string, number> {
  return {
    legends: row.legends,
    games: row.games,
    playrate: row.playrate,
    winrate: row.winrate,
    damage_dealt: row.damage_dealt,
    damage_weapon_one: row.damage_weapon_one,
    damage_weapon_two: row.damage_weapon_two,
    match_time: row.match_time,
    timeheld: row.timeheld,
    timeheld1: row.timeheld1,
    timeheld2: row.timeheld2,
  }
}

export async function getWeaponStatsRow(weaponId: string, patch: string, tier: string): Promise<WeaponStatsRow | null> {
  const daysCondition = await getPatchDaysCondition(patch, tier)
  const patchGlobalInfo = await getPatchGlobalInfo(daysCondition)
  const sql = WEAPON_SQL_FROM.replace('__DAYS__', daysCondition).replace('__WEAPON_FILTER__', 'AND wm.weapon_id = ?')
  const rows = (await db.query(sql, [weaponId])) as Record<string, number | string | null>[]
  const row = rows[0]
  if (!row) return null
  return rowToWeaponStatsRow(row, patchGlobalInfo)
}

export async function getAllWeaponStatsRows(patch: string, tier: string): Promise<WeaponStatsRow[]> {
  const daysCondition = await getPatchDaysCondition(patch, tier)
  const patchGlobalInfo = await getPatchGlobalInfo(daysCondition)
  const sql = WEAPON_SQL_FROM.replace('__DAYS__', daysCondition).replace('__WEAPON_FILTER__', '')
  const aggregatedStats = (await db.query(sql)) as Record<string, number | string | null>[]
  const out: WeaponStatsRow[] = []
  for (const row of aggregatedStats) {
    const w = rowToWeaponStatsRow(row, patchGlobalInfo)
    if (w) out.push(w)
  }
  return out
}

export async function weaponExistsInLegends(weaponId: string): Promise<boolean> {
  const rows = (await db.query('SELECT 1 FROM legends WHERE weapon_one = ? OR weapon_two = ? LIMIT 1', [
    weaponId,
    weaponId,
  ])) as unknown[]
  return rows.length > 0
}

export async function getAllWeaponsWithStats(patch: string, tier: string): Promise<WeaponWithStats[]> {
  const rows = await getAllWeaponStatsRows(patch, tier)
  return rows.map((r) => ({
    weapon_id: r.weapon_id,
    stats: weaponStatsRowToRankStats(r),
  }))
}

export function computeWeaponStatRanks(
  myStats: Record<string, number>,
  allWeapons: WeaponWithStats[]
): Record<string, StatRank> {
  const result: Record<string, StatRank> = {}
  for (const key of Object.keys(myStats)) {
    const myStat = myStats[key]
    let rank = 1
    let total = 0
    for (const other of allWeapons) {
      total++
      if (other.stats[key] > myStat) rank++
    }
    result[key] = { rank, total }
  }
  return result
}

function averageWeaponMetric(all: WeaponWithStats[], statKey: 'winrate' | 'playrate'): number {
  if (all.length === 0) return 0
  const sum = all.reduce((s, o) => s + o.stats[statKey], 0)
  return sum / all.length
}

async function collectPatchChain(startPatch: string, maxPatches: number): Promise<string[]> {
  const chain: string[] = []
  let pid: string | null = startPatch
  while (pid && chain.length < maxPatches) {
    chain.push(pid)
    pid = await getPreviousPatchId(pid)
  }
  return chain
}

export type WeaponPatchHistoryResult = {
  patchIds: string[]
  legendWinrates: number[]
  legendPlayrates: number[]
  averageWinrates: number[]
  averagePlayrates: number[]
  /** Stats for the patch immediately before `startPatch`, when that patch is part of the series (rank Δ). */
  predecessor: { myStats: Record<string, number>; all: WeaponWithStats[] } | undefined
}

/**
 * Win/play rate series by patch (oldest → newest), up to `maxPatches`, matching legend charts.
 * Fetches all patch windows in parallel to avoid sequential DB round-trips.
 */
export async function buildWeaponPatchHistory(
  weaponId: string,
  startPatch: string,
  tier: string,
  maxPatches: number,
  firstPatchData?: { weaponStats: Record<string, number>; allWeapons: WeaponWithStats[] }
): Promise<WeaponPatchHistoryResult | null> {
  const chain = await collectPatchChain(startPatch, maxPatches)
  if (chain.length === 0) return null

  type Fetched = { pid: string; myStats: Record<string, number> | null; all: WeaponWithStats[] }

  const raw = await Promise.all(
    chain.map((pid, index) => {
      if (index === 0 && firstPatchData) {
        return Promise.resolve<Fetched>({
          pid,
          myStats: firstPatchData.weaponStats,
          all: firstPatchData.allWeapons,
        })
      }
      return Promise.all([getWeaponStatsRow(weaponId, pid, tier), getAllWeaponsWithStats(pid, tier)]).then(
        ([weaponRow, allW]): Fetched => ({
          pid,
          myStats: weaponRow ? weaponStatsRowToRankStats(weaponRow) : null,
          all: allW,
        })
      )
    })
  )

  let end = 0
  for (let i = 0; i < raw.length; i++) {
    if (!raw[i].myStats || raw[i].all.length === 0) break
    end++
  }
  const valid = raw.slice(0, end)
  if (valid.length === 0) return null

  const patchIds: string[] = []
  const legendWinrates: number[] = []
  const legendPlayrates: number[] = []
  const averageWinrates: number[] = []
  const averagePlayrates: number[] = []

  for (let i = 0; i < valid.length; i++) {
    const { pid, myStats, all } = valid[i]
    patchIds.unshift(pid)
    legendWinrates.unshift(round2(myStats!.winrate))
    legendPlayrates.unshift(round2(myStats!.playrate))
    averageWinrates.unshift(round2(averageWeaponMetric(all, 'winrate')))
    averagePlayrates.unshift(round2(averageWeaponMetric(all, 'playrate')))
  }

  const predecessor =
    valid.length >= 2 && valid[1].myStats ? { myStats: valid[1].myStats, all: valid[1].all } : undefined

  return {
    patchIds,
    legendWinrates,
    legendPlayrates,
    averageWinrates,
    averagePlayrates,
    predecessor,
  }
}
