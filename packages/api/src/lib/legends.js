const db = require('./db')
const { getPatchDaysCondition, getPatchGlobalInfo } = require('./utils')

module.exports.getLegendStats = async (legendID, patch, tier) => {
  const daysCondition = await getPatchDaysCondition(patch, tier)
  const legendAnd = `AND legend_id = ${legendID}`
  const [legendStats] = await db.query(`SELECT
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
    FROM stats WHERE ${daysCondition} ${legendAnd}`)

  if (!legendStats.games) return null

  return await _formatRawStatsFromQuery(legendStats, daysCondition)
}

async function _formatRawStatsFromQuery(legendStats, daysCondition) {
  const patchGlobalInfo = await getPatchGlobalInfo(daysCondition)

  if (!legendStats.games || !legendStats.damagedealt || !legendStats.matchtime) return null
  const data = {
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
      val = parseFloat(parseFloat(val).toFixed(2))
      return [name, val]
    })
  )
  return dataFloats
}
