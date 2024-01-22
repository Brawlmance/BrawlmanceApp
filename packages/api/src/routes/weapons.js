const db = require('../lib/db')
const { getPatchDaysCondition, getPatchGlobalInfo, getReqPatchAndTier } = require('../lib/utils')

module.exports = app => {
  app.get('/v1/weapons', async function(req, res) {
    const { patch, tier } = await getReqPatchAndTier(req)

    const daysCondition = await getPatchDaysCondition(patch, tier)
    const patchGlobalInfo = await getPatchGlobalInfo(daysCondition)

    const weaponsQuery = await db.query(
      'SELECT weapon_one as weapon FROM legends UNION SELECT weapon_two as weapon FROM legends'
    )

    const weaponsResult = []
    await Promise.all(
      weaponsQuery
        .map(x => x.weapon)
        .map(async weaponID => {
          const [{ games }] = await db.query(
            `SELECT SUM(games) as games FROM stats WHERE legend_id IN (SELECT legend_id FROM legends WHERE weapon_one='${weaponID}' OR weapon_two='${weaponID}') AND ${daysCondition}`
          )
          if (!games) return

          const [
            { legends, winrate, damageWeaponOne, damageWeaponTwo, matchTime, timeheld1, timeheld2 },
          ] = await db.query(
            `SELECT (SELECT COUNT(legend_id) FROM legends WHERE weapon_one='${weaponID}' OR weapon_two='${weaponID}') as legends,
                    (SELECT SUM(wins)/${games} as num FROM stats WHERE legend_id IN (SELECT legend_id FROM legends WHERE weapon_one='${weaponID}' OR weapon_two='${weaponID}') AND ${daysCondition}) as winrate,
                    (SELECT SUM(damageweaponone)/${games} as num FROM stats WHERE legend_id IN (SELECT legend_id FROM legends WHERE weapon_one='${weaponID}') AND ${daysCondition}) as damageWeaponOne,
                    (SELECT SUM(damageweapontwo)/${games} as num FROM stats WHERE legend_id IN (SELECT legend_id FROM legends WHERE weapon_two='${weaponID}') AND ${daysCondition}) as damageWeaponTwo,
                    (SELECT SUM(matchtime)/${games} as num FROM stats WHERE legend_id IN (SELECT legend_id FROM legends WHERE weapon_one='${weaponID}' OR weapon_two='${weaponID}') AND ${daysCondition}) as matchTime,
                    (SELECT SUM(timeheldweaponone)/${games} as num FROM stats WHERE legend_id IN (SELECT legend_id FROM legends WHERE weapon_one='${weaponID}') AND ${daysCondition}) as timeheld1,
                    (SELECT SUM(timeheldweapontwo)/${games} as num FROM stats WHERE legend_id IN (SELECT legend_id FROM legends WHERE weapon_two='${weaponID}') AND ${daysCondition}) as timeheld2`
          )

          const damageDealt = parseFloat(damageWeaponOne || 0) + parseFloat(damageWeaponTwo || 0)
          const playrate = (games / legends / patchGlobalInfo.totalGames) * 100
          const timeHeld = parseFloat(timeheld1 || 0) + parseFloat(timeheld2 || 0)

          const weaponData = {
            weapon_id: weaponID,
            legends,
            playrate: playrate.toFixed(2),
            winrate: (winrate * patchGlobalInfo.winRateBalance * 100).toFixed(2),
            damage_dealt: damageDealt.toFixed(2),
            damage_weapon_one: damageWeaponOne || 0,
            damage_weapon_two: damageWeaponTwo || 0,
            match_time: matchTime,
            timeheld: timeHeld,
            timeheld1: timeheld1 || 0,
            timeheld2: timeheld2 || 0,
          }
          const dataFloats = Object.fromEntries(
            Object.entries(weaponData).map(([name, val]) => {
              if (name !== 'weapon_id') {
                val = parseFloat(parseFloat(val).toFixed(2))
              }
              return [name, val]
            })
          )

          weaponsResult.push(dataFloats)
        })
    )

    res.status(200).json({
      weapons: weaponsResult,
    })
  })
}
