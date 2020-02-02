import PropTypes from 'prop-types'
import Router, { useRouter } from 'next/router'
import Link from 'next/link'
import api from '../lib/api'

Rankings.propTypes = {
  legends: PropTypes.array,
  players: PropTypes.array,
}
export default function Rankings({ legends, players }) {
  const router = useRouter()
  if (!players) return null

  const newSort = e => {
    Router.push({
      pathname: Router.pathname,
      query: { ...Router.query, sort: e.target.value },
    })
  }
  const newLegend = e => {
    Router.push({
      pathname: Router.pathname,
      query: { ...Router.query, legend: e.target.value },
    })
  }

  const sort = router.query.sort || 'mastery'

  return (
    <>
      <div id="rankingform">
        <select value={router.query.legend || ''} onChange={newLegend}>
          {legends.map(legend => {
            return (
              <option key={legend.legend_id} value={legend.legend_id}>
                {legend.bio_name}
              </option>
            )
          })}
        </select>
        <select value={sort} onChange={newSort}>
          <option value="mastery">Mastery</option>
          <option value="elo">Elo</option>
          <option value="peak_elo">Peak Elo</option>
        </select>
      </div>
      <div style={{ overflow: 'auto' }}>
        <table id="ranking">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>{sort === 'mastery' ? 'Player Rating' : 'Legend Rating'}</th>
              <th>Legend Mastery</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              return <Player key={player.brawlhalla_id} player={player} rank={index + 1} sort={sort} />
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

Rankings.getInitialProps = async function(ctx) {
  const { legends } = await api.get(`/v1/legends`)

  const rankingLegend = ctx.query.legend || legends[0].legend_id
  const sort = ctx.query.sort || 'mastery'
  const rankingData = await api.get(`/v1/ranking/legend/${rankingLegend}?sort=${sort}`)

  return {
    legends: legends || [],
    players: rankingData.players || [],
  }
}

Player.propTypes = {
  player: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  rank: PropTypes.number.isRequired,
}
function Player({ player, rank, sort }) {
  return (
    <tr>
      <td>{ordinalSuffixOf(rank)}</td>
      <td>
        <Link href={`/search?brawlhalla_id=${player.brawlhalla_id}`}>
          <a>{player.name}</a>
        </Link>
        <p className="region">{player.region}</p>
      </td>
      <td>
        <p>
          {sort === 'peak_elo' ? player.peak_rating : player.rating} {sort === 'peak_elo' ? 'peak elo' : 'elo'}
        </p>
        <p>
          <span className="wins">{player.wins}W</span> <span className="losses">{player.games - player.wins} L</span>
        </p>
      </td>
      <td>
        <p>Level {player.level}</p>
        <p>{player.xp} XP</p>
      </td>
    </tr>
  )
}

function ordinalSuffixOf(i) {
  var j = i % 10
  var k = i % 100
  if (j === 1 && k !== 11) {
    return i + 'st'
  }
  if (j === 2 && k !== 12) {
    return i + 'nd'
  }
  if (j === 3 && k !== 13) {
    return i + 'rd'
  }
  return i + 'th'
}
