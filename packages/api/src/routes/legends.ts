import type { Express, Request, Response } from 'express'
import db from '../lib/db'
import {
  buildLegendPatchHistory,
  computeLegendStatRanks,
  computeRankChanges,
  getAllLegendsWithStats,
  getLegendStats,
} from '../lib/legends'
import { getPreviousPatchId, getReqPatchAndTier } from '../lib/utils'
import cache from '../lib/cache'

// TODO: model `legends` table row + joined stats
// DB column uses snake_case
type LegendRow = Record<string, unknown> & { legend_id: number; stats?: Record<string, number> | null }

export default function legendsRoutes(app: Express): void {
  app.get('/v1/legends', async function (req: Request, res: Response) {
    const { patch, tier } = await getReqPatchAndTier(req)
    const cacheKey = `legends-${tier}-${patch}`

    const cachedResponse = cache.get<unknown>(cacheKey)
    if (cachedResponse !== undefined) {
      res.status(200).json(cachedResponse)
      return
    }

    const legends = (await db.query('SELECT * FROM legends ORDER BY bio_name')) as LegendRow[]

    const legendData = await Promise.all(legends.map((legend) => getLegendStats(legend.legend_id, patch, tier)))

    const legendsResult = legends
      .map((legend, index) => {
        legend.stats = legendData[index] ?? null
        return legend
      })
      .filter((legend) => legend.stats)
    const response = {
      legends: legendsResult,
    }

    cache.set(cacheKey, response, 120)

    res.status(200).json(response)
  })

  app.get('/v1/legend/:legend_id', async function (req: Request, res: Response) {
    const legendID = req.params.legend_id
    const { patch, tier } = await getReqPatchAndTier(req)

    const rows = (await db.query('SELECT * FROM legends WHERE legend_id=?', [legendID])) as LegendRow[]
    const legend = rows[0]
    if (!legend) {
      res.status(404).json({
        error: 'Legend ID not found',
      })
      return
    }

    legend.stats = (await getLegendStats(legend.legend_id, patch, tier)) ?? undefined

    const avgRows = (await db.query(
      'SELECT AVG(strength) AS strength, AVG(dexterity) AS dexterity, AVG(defense) AS defense, AVG(speed) AS speed FROM legends'
    )) as Array<{ strength: number | null; dexterity: number | null; defense: number | null; speed: number | null }>
    const avg = avgRows[0]
    const averageStats = {
      strength: parseFloat(Number(avg?.strength ?? 0).toFixed(2)),
      dexterity: parseFloat(Number(avg?.dexterity ?? 0).toFixed(2)),
      defense: parseFloat(Number(avg?.defense ?? 0).toFixed(2)),
      speed: parseFloat(Number(avg?.speed ?? 0).toFixed(2)),
    }

    let ranks: ReturnType<typeof computeLegendStatRanks> | undefined
    let previousRanks: ReturnType<typeof computeLegendStatRanks> | undefined
    let rankChanges: ReturnType<typeof computeRankChanges> | undefined
    let patchHistory: Awaited<ReturnType<typeof buildLegendPatchHistory>> | undefined

    if (legend.stats) {
      const allCurrent = await getAllLegendsWithStats(patch, tier)
      ranks = computeLegendStatRanks(
        String(legend.weapon_one ?? ''),
        String(legend.weapon_two ?? ''),
        legend.stats,
        allCurrent
      )

      const previousPatchId = await getPreviousPatchId(patch)
      if (previousPatchId) {
        const prevStats = await getLegendStats(legend.legend_id, previousPatchId, tier)
        const allPrev = await getAllLegendsWithStats(previousPatchId, tier)
        if (prevStats && allPrev.length > 0) {
          previousRanks = computeLegendStatRanks(
            String(legend.weapon_one ?? ''),
            String(legend.weapon_two ?? ''),
            prevStats,
            allPrev
          )
          rankChanges = computeRankChanges(ranks, previousRanks)
        }
      }

      patchHistory = await buildLegendPatchHistory(legend.legend_id, patch, tier, 10, {
        legendStats: legend.stats,
        allLegends: allCurrent,
      })
    }

    res.status(200).json({
      legend,
      averageStats,
      ranks,
      previousRanks,
      rankChanges,
      patchHistory,
    })
  })
}
