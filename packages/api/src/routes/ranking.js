const db = require('../lib/db')
module.exports = app => {
  app.get('/v1/ranking/legend/:legend_id', async function(req, res) {
    const sort = req.query.sort
    const legendID = req.params.legend_id

    let players
    switch (sort) {
      case 'mastery': {
        players = await db.query(
          `SELECT player_legends.brawlhalla_id, players.name, players.region, players.rating, players.wins, players.games, player_legends.level, player_legends.xp FROM player_legends 
                LEFT JOIN players ON players.brawlhalla_id=player_legends.brawlhalla_id
                WHERE player_legends.legend_id=? ORDER BY player_legends.xp DESC LIMIT 50`,
          [legendID]
        )
        break
      }
      case 'elo':
      case 'peak_elo': {
        const orderField = sort === 'elo' ? 'rating' : 'peak_rating'
        players = await db.query(
          `SELECT player_ranked_legends.brawlhalla_id, players.name, players.region, player_ranked_legends.${orderField}, player_ranked_legends.wins, player_ranked_legends.games, player_legends.level, player_legends.xp FROM player_ranked_legends 
          LEFT JOIN players ON players.brawlhalla_id=player_ranked_legends.brawlhalla_id
          LEFT JOIN player_legends ON player_legends.brawlhalla_id=player_ranked_legends.brawlhalla_id AND player_legends.legend_id=player_ranked_legends.legend_id
          WHERE player_ranked_legends.legend_id=? ORDER BY player_ranked_legends.${orderField} DESC LIMIT 50`,
          [legendID]
        )
        break
      }
      default: {
        res.status(404).json({
          error: 'Sort type not recognized. Allowed values are: mastery, elo, peak_elo',
        })
        return
      }
    }

    res.status(200).json({
      players,
    })
  })

  app.get('/v1/ranking/user/:user_id', async function(req, res) {
    const userID = req.params.user_id

    const [
      player,
    ] = await db.query(
      'SELECT *, (SELECT COUNT(*) FROM player_legends WHERE brawlhalla_id=players.brawlhalla_id) as player_legends_count FROM players WHERE brawlhalla_id=?',
      [userID]
    )
    if (!player) {
      res.status(404).json({
        error: 'Player ID not found',
      })
      return
    }

    const [
      playerClan,
    ] = await db.query(
      'SELECT clans.*, clan_members.* FROM clan_members JOIN clans ON clans.clan_id=clan_members.clan_id WHERE clan_members.brawlhalla_id=?',
      [userID]
    )

    const legends = await db.query(
      `SELECT player_legends.*, legends.*, player_ranked_legends.rating, player_ranked_legends.peak_rating FROM player_legends JOIN legends ON legends.legend_id=player_legends.legend_id
LEFT JOIN player_ranked_legends ON player_ranked_legends.brawlhalla_id = player_legends.brawlhalla_id AND player_ranked_legends.legend_id = player_legends.legend_id
WHERE player_legends.brawlhalla_id=? ORDER BY player_legends.wins DESC`,
      [userID]
    )

    res.status(200).json({
      player,
      clan: playerClan,
      legends,
    })
  })
}
