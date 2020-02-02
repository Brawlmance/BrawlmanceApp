const db = require('../lib/db')
const { getPatchDaysCondition, getReqPatchAndTier } = require('../lib/utils')

module.exports = app => {
  app.get('/v1/random_fact', async function(req, res) {
    const { patch, tier } = await getReqPatchAndTier(req)
    const daysCondition = await getPatchDaysCondition(patch, tier)

    let result
    const random = Math.floor(Math.random() * 4) + 1
    switch (random) {
      case 1: {
        result = '50% average winrate'
        break
      }
      case 2: {
        const [{ num }] = await db.query(`SELECT SUM(kounarmed)/SUM(kos) as num FROM stats WHERE ${daysCondition}`)
        result = Math.round(num * 1000) / 10 + '% kos made unarmed'
        break
      }
      case 4: {
        const [{ num }] = await db.query(
          `SELECT (SUM(matchtime)-SUM(timeheldweaponone)-SUM(timeheldweapontwo)) / SUM(matchtime) as num FROM stats WHERE ${daysCondition}`
        )
        result = Math.round(num * 1000) / 10 + '% of time unarmed'
        break
      }
      default: {
        const [{ num }] = await db.query(
          `SELECT SUM(damagegadgets)/SUM(games) as num FROM stats WHERE ${daysCondition}`
        )
        result = Math.round(num * 10) / 10 + ' average damage made with gadgets per game'
        break
      }
    }

    res.status(200).json({
      result,
    })
  })
}
