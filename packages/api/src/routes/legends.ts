import type { Express, Request, Response } from 'express'
import db from '../lib/db'
import { getLegendStats } from '../lib/legends'
import { getReqPatchAndTier } from '../lib/utils'
import cache from '../lib/cache'

// TODO: model `legends` table row + joined stats
// DB column uses snake_case
// eslint-disable-next-line camelcase
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

    // TODO: Finish getting data https://github.com/Brawlmance/Web/blob/master/application/routes/legend_stats.php

    res.status(200).json({
      legend,
    })
  })
}
