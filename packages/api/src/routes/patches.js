const db = require('../lib/db')
const { getPatchDaysCondition, getReqPatchAndTier } = require('../lib/utils')

module.exports = app => {
  app.get('/v1/patches', async function(req, res) {
    const { tier } = await getReqPatchAndTier(req)
    let patches = await db.query('SELECT id FROM patches WHERE changes=1 ORDER BY timestamp DESC LIMIT 500')

    patches = await Promise.all(
      patches.map(async patch => {
        const daysCondition = await getPatchDaysCondition(patch.id, tier)
        const [{ count: games }] = await db.query(`SELECT SUM(games) as count FROM stats WHERE ${daysCondition}`)
        patch.games = parseInt(games) || 0
        return patch
      })
    )

    res.status(200).json({
      patches,
      tiers: ['All', 'Diamond', 'Platinum', 'Gold', 'Silver'],
    })
  })
}
