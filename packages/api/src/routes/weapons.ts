import type { Express, Request, Response } from 'express'
import db from '../lib/db'
import { getPatchDaysCondition, getPatchGlobalInfo, getReqPatchAndTier } from '../lib/utils'

export default function weaponsRoutes(app: Express): void {
  app.get('/v1/weapons', async function (req: Request, res: Response) {
    const { patch, tier } = await getReqPatchAndTier(req)

    const daysCondition = await getPatchDaysCondition(patch, tier)
    const patchGlobalInfo = await getPatchGlobalInfo(daysCondition)

    const sqlQuery = `
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
      WHERE ${daysCondition}
      GROUP BY wm.weapon_id
    `

    const aggregatedStats = (await db.query(sqlQuery)) as Record<string, number | string | null>[]
    const weaponsResult: Record<string, number | string>[] = []

    for (const row of aggregatedStats) {
      if (!row.total_games) continue

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

      const weaponData: Record<string, string | number> = {
        weapon_id: row.weapon_id ?? '',
        legends: legends,
        playrate: parseFloat(playrate.toFixed(2)),
        winrate: parseFloat((winrate * patchGlobalInfo.winRateBalance * 100).toFixed(2)),
        damage_dealt: parseFloat(damageDealt.toFixed(2)),
        damage_weapon_one: parseFloat(damageWeaponOne.toFixed(2)),
        damage_weapon_two: parseFloat(damageWeaponTwo.toFixed(2)),
        match_time: parseFloat(matchTime.toFixed(2)),
        timeheld: parseFloat(timeHeld.toFixed(2)),
        timeheld1: parseFloat(timeheld1.toFixed(2)),
        timeheld2: parseFloat(timeheld2.toFixed(2)),
      }

      weaponsResult.push(weaponData)
    }

    res.status(200).json({
      weapons: weaponsResult,
    })
  })
}
