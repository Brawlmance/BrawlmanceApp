const db = require('../lib/db')
const { getLegendStats } = require('../lib/legends')
const { getReqPatchAndTier } = require('../lib/utils')

module.exports = app => {
  app.get('/v1/legends', async function(req, res) {
    const { patch, tier } = await getReqPatchAndTier(req)

    const legends = await db.query('SELECT * FROM legends ORDER BY bio_name')

    const legendData = await Promise.all(legends.map(legend => getLegendStats(legend.legend_id, patch, tier)))

    const legendsResult = legends
      .map((legend, index) => {
        legend.stats = legendData[index]
        return legend
      })
      .filter(legend => legend.stats)

    res.status(200).json({
      legends: legendsResult,
    })
  })

  app.get('/v1/legend/:legend_id', async function(req, res) {
    const legendID = req.params.legend_id
    const { patch, tier } = await getReqPatchAndTier(req)

    const [legend] = await db.query('SELECT * FROM legends WHERE legend_id=?', [legendID])
    if (!legend) {
      res.status(404).json({
        error: 'Legend ID not found',
      })
      return
    }

    legend.stats = await getLegendStats(legend.legend_id, patch, tier)

    // TODO: Finish getting data https://github.com/Brawlmance/Web/blob/master/application/routes/legend_stats.php

    res.status(200).json({
      legend,
    })
  })
}
