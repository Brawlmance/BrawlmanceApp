import PropTypes from 'prop-types'
import Link from 'next/link'
import api from '../lib/api'
import useUrlQueries from '../lib/useUrlQueries'

Search.propTypes = {
  player: PropTypes.object.isRequired,
  clan: PropTypes.object,
  legends: PropTypes.array.isRequired,
}
export default function Search({ player, clan, legends }) {
  if (!player) return null

  let overallTotalGames = 0
  let overallDamageDealt = 0
  let overallDamageTaken = 0
  legends.forEach(legend => {
    overallTotalGames += legend.games
    overallDamageDealt += legend.damagedealt
    overallDamageTaken += legend.damagetaken
  })

  const agoStr = timeDifference(Date.now() / 1000, player.lastupdated)

  const urlQueries = useUrlQueries({
    brawlhalla_id: player.brawlhalla_id,
  })
  return (
    <>
      <div className="profile-header">
        <div className="name">
          <Link href={`/search${urlQueries}`}>
            <a>
              <img className="avatar" alt="" src={`/img/legends/${legends[0].legend_id}.png`} />
            </a>
          </Link>
          <Link href={`/search${urlQueries}`}>
            <a>
              <h1>
                {player.name} ({player.region})
              </h1>
            </a>
          </Link>
          {clan && <p>{clan.clan_name}</p>}
          <p>Updated {agoStr}</p>
        </div>
        <div className="info">
          <div className="stat">
            <strong>{player.tier}</strong>
            <span>Tier</span>
          </div>
          <div className="stat">
            <strong>#{player.rank}</strong>
            <span>Ranking</span>
          </div>
          <div className="stat">
            <strong>{player.rating}</strong>
            <span>Elo</span>
          </div>
        </div>
      </div>

      <h1>OVERALL SEASON PERFORMANCE</h1>
      <div className="profile-overall-performance">
        <div className="stats">
          <div className="stat">
            <strong>{player.level}</strong>
            <span>Level</span>
          </div>
          <div className="stat">
            <strong>
              {player.wins} - {player.games - player.wins}
            </strong>
            <span>Win - Loss</span>
          </div>
          <div className="stat">
            <strong>{((player.wins / player.games) * 100).toFixed(2)}%</strong>
            <span>Winrate</span>
          </div>
          <div className="stat">
            <strong>{(overallDamageDealt / overallTotalGames).toFixed(0)}</strong>
            <span>Avg Damage Dealt</span>
          </div>
          <div className="stat">
            <strong>{(overallDamageTaken / overallTotalGames).toFixed(0)}</strong>
            <span>Avg Damage Taken</span>
          </div>
        </div>
      </div>

      <h1>LEGEND STATS</h1>
      {legends.map(legend => {
        return (
          <div key={legend.legend_id} className="player-legend">
            <div className="name">
              <img
                className="legend-image"
                alt=""
                title={legend.bio_name}
                src={`/img/legends/${legend.legend_id}.png`}
              />
            </div>
            <div className="stat">
              <strong>{legend.level}</strong>
              <span>Level</span>
            </div>
            <div className="stat">
              <strong>
                {legend.wins} / {legend.games - legend.wins}
              </strong>
              <span>Win / Loss</span>
            </div>
            <div className="stat">
              <strong>
                {legend.rating} / {legend.peak_rating}
              </strong>
              <span>Elo / Peak elo</span>
            </div>
            <div className="stat">
              <strong>{(legend.games ? (legend.wins / legend.games) * 100 : 0).toFixed(2)}%</strong>
              <span>Winrate</span>
            </div>
            <div className="stat">
              <strong>{(legend.games ? (legend.games / overallTotalGames) * 100 : 0).toFixed(2)}%</strong>
              <span>Playrate</span>
            </div>
            <div className="stat">
              <strong>{(legend.games ? legend.damagedealt / legend.games : 0).toFixed(0)}</strong>
              <span>Avg Dmg dealt</span>
            </div>
            <div className="stat">
              <strong>{(legend.games ? legend.damagetaken / legend.games : 0).toFixed(0)}</strong>
              <span>Avg Dmg taken</span>
            </div>
            <div className="stat">
              <strong>{(legend.games ? legend.matchtime / legend.games : 0).toFixed(0)}s</strong>
              <span>Avg Match duration</span>
            </div>
          </div>
        )
      })}
    </>
  )
}

Search.getInitialProps = async function(ctx) {
  const brawlhallaID = ctx.query.brawlhalla_id
  const data = await api.get(`/v1/ranking/user/${brawlhallaID}`)

  return data
}
function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000
  var msPerHour = msPerMinute * 60
  var msPerDay = msPerHour * 24
  var msPerMonth = msPerDay * 30

  var elapsed = current - previous

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + ' seconds ago'
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago'
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago'
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago'
  } else return 'A long time ago'
}
