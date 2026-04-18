import db from './db'
import { getPatchDaysCondition, getPatchGlobalInfo, getPreviousPatchId } from './utils'

// TODO: shape returned from _formatRawStatsFromQuery
export async function getLegendStats(
  legendID: number,
  patch: string,
  tier: string
): Promise<Record<string, number> | null> {
  const daysCondition = await getPatchDaysCondition(patch, tier)
  const legendAnd = `AND legend_id = ${legendID}`
  const rows = (await db.query(`SELECT
        SUM(games) as games,
        SUM(wins)/SUM(games) as winrate,
        SUM(suicides)/SUM(games) as suicides,
        SUM(damagedealt)/SUM(games) as damagedealt,
        SUM(damageunarmed)/SUM(games) as damagedealt_unarmed,
        SUM(damagegadgets)/SUM(games) as damagedealt_gadgets,
        SUM(damageweaponone)/SUM(games) as damagedealt_weaponone,
        SUM(damageweapontwo)/SUM(games) as damagedealt_weapontwo,
        SUM(damagetaken)/SUM(games) as damagetaken,
        SUM(matchtime)/SUM(games) as matchtime,
        SUM(timeheldweaponone)/SUM(games) as matchtime_weaponone,
        SUM(timeheldweapontwo)/SUM(games) as matchtime_weapontwo
    FROM stats WHERE ${daysCondition} ${legendAnd}`)) as Record<string, number>[]
  const legendStats = rows[0]

  if (!legendStats?.games) return null

  return await _formatRawStatsFromQuery(legendStats, daysCondition)
}

async function _formatRawStatsFromQuery(
  legendStats: Record<string, number>,
  daysCondition: string
): Promise<Record<string, number> | null> {
  const patchGlobalInfo = await getPatchGlobalInfo(daysCondition)

  if (!legendStats.games || !legendStats.damagedealt || !legendStats.matchtime) return null
  const data: Record<string, number> = {
    games: legendStats.games,
    playrate: (legendStats.games / patchGlobalInfo.totalGames) * 100,
    winrate: legendStats.winrate * patchGlobalInfo.winRateBalance * 100,
    suicides: legendStats.suicides,
    damagedealt: legendStats.damagedealt,
    damagedealt_unarmed: legendStats.damagedealt_unarmed,
    damagedealt_gadgets: legendStats.damagedealt_gadgets,
    damagedealt_weaponone: legendStats.damagedealt_weaponone,
    damagedealt_weapontwo: legendStats.damagedealt_weapontwo,
    damagetaken: legendStats.damagetaken,
    matchtime: legendStats.matchtime,
    matchtime_weaponone: legendStats.matchtime_weaponone,
    matchtime_weapontwo: legendStats.matchtime_weapontwo,
    matchtime_unarmed: legendStats.matchtime - legendStats.matchtime_weaponone - legendStats.matchtime_weapontwo,
  }
  const dataFloats = Object.fromEntries(
    Object.entries(data).map(([name, val]) => {
      const num = parseFloat(parseFloat(String(val)).toFixed(2))
      return [name, num]
    })
  ) as Record<string, number>
  return dataFloats
}

/** One legend with formatted stats (mirrors PHP `getAllLegendStats` entries). */
export type LegendWithStats = {
  data: { legend_id: number; weapon_one: string; weapon_two: string }
  stats: Record<string, number>
}

const WEAPON_SPECIFIC_RANK_KEYS = new Set([
  'damagedealt_weaponone',
  'matchtime_weaponone',
  'damagedealt_weapontwo',
  'matchtime_weapontwo',
])

/** All legends that have stats for this patch/tier (same pool PHP uses for ranks). */
export async function getAllLegendsWithStats(patch: string, tier: string): Promise<LegendWithStats[]> {
  const rows = (await db.query('SELECT legend_id, weapon_one, weapon_two FROM legends')) as Array<{
    legend_id: number
    weapon_one: string
    weapon_two: string
  }>
  const statsList = await Promise.all(rows.map((r) => getLegendStats(r.legend_id, patch, tier)))
  const out: LegendWithStats[] = []
  for (let i = 0; i < rows.length; i++) {
    const stats = statsList[i]
    if (!stats) continue
    out.push({
      data: {
        legend_id: rows[i].legend_id,
        weapon_one: rows[i].weapon_one,
        weapon_two: rows[i].weapon_two,
      },
      stats,
    })
  }
  return out
}

export type StatRank = { rank: number; total: number }

/**
 * Competition rank per stat key (PHP `getRanks`). Weapon damage/time stats only compare legends
 * that share the same weapon in the mapped slot.
 */
export function computeLegendStatRanks(
  myWeaponOne: string,
  myWeaponTwo: string,
  myStats: Record<string, number>,
  allLegends: LegendWithStats[]
): Record<string, StatRank> {
  const result: Record<string, StatRank> = {}

  for (const key of Object.keys(myStats)) {
    const myStat = myStats[key]
    let rank = 1
    let total = 0

    if (WEAPON_SPECIFIC_RANK_KEYS.has(key)) {
      const thisSlot: 'weapon_one' | 'weapon_two' = key.includes('weaponone') ? 'weapon_one' : 'weapon_two'
      const myWeaponVal = thisSlot === 'weapon_one' ? myWeaponOne : myWeaponTwo
      const keyInitialPart = key.split('_')[0]

      for (const other of allLegends) {
        const od = other.data
        const os = other.stats
        let otherKey: string | false = false

        if (myWeaponVal === od.weapon_one) {
          otherKey = thisSlot === 'weapon_one' ? key : `${keyInitialPart}_weapontwo`
        } else if (myWeaponVal === od.weapon_two) {
          otherKey = thisSlot === 'weapon_two' ? key : `${keyInitialPart}_weaponone`
        }

        if (otherKey) {
          total++
          if (os[otherKey] > myStat) rank++
        }
      }
    } else {
      for (const other of allLegends) {
        total++
        if (other.stats[key] > myStat) rank++
      }
    }

    result[key] = { rank, total }
  }

  return result
}

function round2(n: number): number {
  return parseFloat(n.toFixed(2))
}

function averageLegendMetric(all: LegendWithStats[], statKey: 'winrate' | 'playrate'): number {
  if (all.length === 0) return 0
  const sum = all.reduce((s, o) => s + o.stats[statKey], 0)
  return sum / all.length
}

/** Win/play rate series by patch (oldest → newest), up to `maxPatches`, matching PHP charts. */
export async function buildLegendPatchHistory(
  legendId: number,
  startPatch: string,
  tier: string,
  maxPatches: number,
  firstPatchData?: { legendStats: Record<string, number>; allLegends: LegendWithStats[] }
): Promise<{
  patchIds: string[]
  legendWinrates: number[]
  legendPlayrates: number[]
  averageWinrates: number[]
  averagePlayrates: number[]
} | null> {
  const patchIds: string[] = []
  const legendWinrates: number[] = []
  const legendPlayrates: number[] = []
  const averageWinrates: number[] = []
  const averagePlayrates: number[] = []

  let pid: string | null = startPatch
  let useSeed = Boolean(firstPatchData)

  while (pid && patchIds.length < maxPatches) {
    let myStats: Record<string, number> | null
    let all: LegendWithStats[]

    if (useSeed && firstPatchData) {
      myStats = firstPatchData.legendStats
      all = firstPatchData.allLegends
      useSeed = false
    } else {
      myStats = await getLegendStats(legendId, pid, tier)
      all = await getAllLegendsWithStats(pid, tier)
    }

    if (!myStats || all.length === 0) break

    patchIds.unshift(pid)
    legendWinrates.unshift(round2(myStats.winrate))
    legendPlayrates.unshift(round2(myStats.playrate))
    averageWinrates.unshift(round2(averageLegendMetric(all, 'winrate')))
    averagePlayrates.unshift(round2(averageLegendMetric(all, 'playrate')))

    pid = await getPreviousPatchId(pid)
  }

  if (patchIds.length === 0) return null
  return {
    patchIds,
    legendWinrates,
    legendPlayrates,
    averageWinrates,
    averagePlayrates,
  }
}

export function computeRankChanges(
  current: Record<string, StatRank>,
  previous: Record<string, StatRank> | undefined
): Record<string, number | null> | undefined {
  if (!previous) return undefined
  const out: Record<string, number | null> = {}
  for (const key of Object.keys(current)) {
    const prev = previous[key]
    out[key] = prev ? current[key].rank - prev.rank : null
  }
  return out
}
