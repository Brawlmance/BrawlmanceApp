import type { Express, Request, Response } from 'express'
import db from '../lib/db'
import { getPatchDaysCondition, getReqPatchAndTier } from '../lib/utils'
import cache from '../lib/cache'

export default function patchesRoutes(app: Express): void {
  app.get('/v1/patches', async function (req: Request, res: Response) {
    const { tier } = await getReqPatchAndTier(req)
    const cacheKey = `patches-${tier}`

    const cachedResponse = cache.get<unknown>(cacheKey)
    if (cachedResponse !== undefined) {
      res.status(200).json(cachedResponse)
      return
    }

    let patches = (await db.query('SELECT id FROM patches WHERE changes=1 ORDER BY timestamp DESC LIMIT 500')) as {
      id: string
      games?: number
    }[]

    patches = await Promise.all(
      patches.map(async (patch) => {
        const daysCondition = await getPatchDaysCondition(patch.id, tier)
        const countRows = (await db.query(`SELECT SUM(games) as count
                                                     FROM stats
                                                     WHERE ${daysCondition}`)) as { count: number | null }[]
        const games = countRows[0]?.count
        patch.games = parseInt(String(games), 10) || 0
        return patch
      })
    )
    const response = {
      patches,
      tiers: ['All', 'Diamond', 'Platinum', 'Gold', 'Silver'],
    }

    cache.set(cacheKey, response, 60 * 60)

    res.status(200).json(response)
  })
}
