import type { Express, Request, Response } from 'express'
import db from '../lib/db'

export default function healthRoutes(app: Express): void {
  app.get('/health', async function (_req: Request, res: Response) {
    const rows = (await db.query('SELECT MAX(lastupdated) as lastupdated FROM players')) as { lastupdated: number }[]
    const tsLastUpdate = rows[0]?.lastupdated
    const tsNow = Math.floor(Date.now() / 1000)

    if (tsLastUpdate === undefined || tsNow - tsLastUpdate > 60 * 60) {
      res.status(500).json({ status: '1h without new data' })
    } else {
      res.status(200).json({ status: 'Data coming in correctly' })
    }
  })
}
