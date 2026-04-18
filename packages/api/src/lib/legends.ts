import db from './db'
import { getPatchDaysCondition, getPatchGlobalInfo } from './utils'

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
