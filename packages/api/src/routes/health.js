const db = require('../lib/db')

module.exports = app => {
  app.get('/health', async function(req, res) {
    const tsLastUpdate = (await db.query('SELECT MAX(lastupdated) as lastupdated FROM players'))[0].lastupdated
    const tsNow = Math.floor(Date.now() / 1000)

    if (tsNow - tsLastUpdate > 60 * 60) {
      res.status(500).json({ status: '1h without new data' })
    } else {
      res.status(200).json({ status: 'Data coming in correctly' })
    }
  })
}
