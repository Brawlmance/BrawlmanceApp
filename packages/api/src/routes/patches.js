const db = require('../lib/db')
const { getPatchDaysCondition, getReqPatchAndTier } = require('../lib/utils')
const cache = require('../lib/cache')

module.exports = app => {
  app.get('/v1/patches', async function(req, res) {
    const { tier } = await getReqPatchAndTier(req)
    const cacheKey = `patches-${tier}`

    const cachedResponse = cache.get(cacheKey)
    if (cachedResponse !== undefined) {
      res.status(200).json(cachedResponse)
      return
    }

    let patches = await db.query('SELECT id FROM patches WHERE changes=1 ORDER BY timestamp DESC LIMIT 500')

    patches = await Promise.all(
      patches.map(async patch => {
        const daysCondition = await getPatchDaysCondition(patch.id, tier)
        const [{ count: games }] = await db.query(`SELECT SUM(games) as count
                                                     FROM stats
                                                     WHERE ${daysCondition}`)
        patch.games = parseInt(games) || 0
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
