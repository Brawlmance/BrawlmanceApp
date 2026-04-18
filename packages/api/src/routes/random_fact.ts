import type { Express, Request, Response } from 'express'
import db from '../lib/db'
import { getPatchDaysCondition, getReqPatchAndTier } from '../lib/utils'

export default function randomFactRoutes(app: Express): void {
  app.get('/v1/random_fact', async function (req: Request, res: Response) {
    const { patch, tier } = await getReqPatchAndTier(req)
    const daysCondition = await getPatchDaysCondition(patch, tier)

    let result: string
    const random = Math.floor(Math.random() * 4) + 1
    switch (random) {
      case 1: {
        result = '50% average winrate'
        break
      }
      case 2: {
        const rows = (await db.query(`SELECT SUM(kounarmed)/SUM(kos) as num FROM stats WHERE ${daysCondition}`)) as {
          num: number | null
        }[]
        const num = rows[0]?.num ?? 0
        result = Math.round(num * 1000) / 10 + '% kos made unarmed'
        break
      }
      case 4: {
        const rows = (await db.query(
          `SELECT (SUM(matchtime)-SUM(timeheldweaponone)-SUM(timeheldweapontwo)) / SUM(matchtime) as num FROM stats WHERE ${daysCondition}`
        )) as { num: number | null }[]
        const num = rows[0]?.num ?? 0
        result = Math.round(num * 1000) / 10 + '% of time unarmed'
        break
      }
      default: {
        const rows = (await db.query(
          `SELECT SUM(damagegadgets)/SUM(games) as num FROM stats WHERE ${daysCondition}`
        )) as { num: number | null }[]
        const num = rows[0]?.num ?? 0
        result = Math.round(num * 10) / 10 + ' average damage made with gadgets per game'
        break
      }
    }

    res.status(200).json({
      result,
    })
  })
}
