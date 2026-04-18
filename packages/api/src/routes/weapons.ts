import type { Express, Request, Response } from 'express'
import { computeRankChanges } from '../lib/legends'
import cache from '../lib/cache'
import {
  buildWeaponPatchHistory,
  computeWeaponStatRanks,
  getAllWeaponsWithStats,
  getWeaponStatsRow,
  weaponExistsInLegends,
  weaponStatsRowToRankStats,
} from '../lib/weapons'
import { getReqPatchAndTier } from '../lib/utils'

export default function weaponsRoutes(app: Express): void {
  app.get('/v1/weapons', async function (req: Request, res: Response) {
    const { patch, tier } = await getReqPatchAndTier(req)

    const list = await getAllWeaponsWithStats(patch, tier)
    const rows = list.map((w) => {
      const s = w.stats
      return {
        weapon_id: w.weapon_id,
        legends: s.legends,
        playrate: s.playrate,
        winrate: s.winrate,
        damage_dealt: s.damage_dealt,
        damage_weapon_one: s.damage_weapon_one,
        damage_weapon_two: s.damage_weapon_two,
        match_time: s.match_time,
        timeheld: s.timeheld,
        timeheld1: s.timeheld1,
        timeheld2: s.timeheld2,
      }
    })

    res.status(200).json({
      weapons: rows,
    })
  })

  app.get('/v1/weapon/:weapon_id', async function (req: Request, res: Response) {
    const weaponId = req.params.weapon_id
    const { patch, tier } = await getReqPatchAndTier(req)

    const cacheKey = `weapon-detail-${tier}-${patch}-${weaponId}`
    const cachedResponse = cache.get<Record<string, unknown>>(cacheKey)
    if (cachedResponse !== undefined) {
      res.status(200).json(cachedResponse)
      return
    }

    const exists = await weaponExistsInLegends(weaponId)
    if (!exists) {
      res.status(404).json({
        error: 'Weapon not found',
      })
      return
    }

    const [row, allCurrent] = await Promise.all([
      getWeaponStatsRow(weaponId, patch, tier),
      getAllWeaponsWithStats(patch, tier),
    ])

    let ranks: ReturnType<typeof computeWeaponStatRanks> | undefined
    let previousRanks: ReturnType<typeof computeWeaponStatRanks> | undefined
    let rankChanges: ReturnType<typeof computeRankChanges> | undefined
    let patchHistory: Omit<Awaited<ReturnType<typeof buildWeaponPatchHistory>>, 'predecessor'> | undefined

    if (row) {
      const stats = weaponStatsRowToRankStats(row)
      ranks = computeWeaponStatRanks(stats, allCurrent)

      const built = await buildWeaponPatchHistory(weaponId, patch, tier, 10, {
        weaponStats: stats,
        allWeapons: allCurrent,
      })

      if (built) {
        const { predecessor, ...series } = built
        patchHistory = series

        if (predecessor) {
          previousRanks = computeWeaponStatRanks(predecessor.myStats, predecessor.all)
          rankChanges = computeRankChanges(ranks, previousRanks)
        }
      }
    }

    const response = {
      weapon: {
        weapon_id: weaponId,
        stats: row
          ? {
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
          : undefined,
      },
      ranks,
      previousRanks,
      rankChanges,
      patchHistory,
    }

    cache.set(cacheKey, response, 120)

    res.status(200).json(response)
  })
}
