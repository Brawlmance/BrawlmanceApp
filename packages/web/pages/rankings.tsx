import type { ChangeEvent } from 'react'
import Router, { useRouter } from 'next/router'
import Link from 'next/link'
import api from '../lib/api'
import useUrlQueries from '../lib/useUrlQueries'
import type { LegendRow } from '../types/brawlmance'
import type { NextPageContext } from 'next'

/** TODO: align with /v1/ranking/legend/:id players rows */
type RankingsPlayerRow = {
  brawlhalla_id: number
  name: string
  region: string
  wins: number
  games: number
  rating: number
  peak_rating: number
  level: number
  xp: number
}

type RankingsProps = { legends: LegendRow[]; players: RankingsPlayerRow[] }

export default function Rankings({ legends, players }: RankingsProps) {
  const router = useRouter()
  if (!players) return null

  const newSort = (e: ChangeEvent<HTMLSelectElement>) => {
    Router.push({
      pathname: Router.pathname,
      query: { ...Router.query, sort: e.target.value },
    })
  }
  const newLegend = (e: ChangeEvent<HTMLSelectElement>) => {
    Router.push({
      pathname: Router.pathname,
      query: { ...Router.query, legend: e.target.value },
    })
  }

  const sortParam = router.query.sort
  const sort = (Array.isArray(sortParam) ? sortParam[0] : sortParam) || 'mastery'

  const legendQuery = router.query.legend
  const legendValue = Array.isArray(legendQuery) ? legendQuery[0] : legendQuery || ''

  return (
    <>
      <div id="rankingform">
        <select value={legendValue} onChange={newLegend}>
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

Rankings.getInitialProps = async function (ctx: NextPageContext) {
  const legData = (await api.get(`/v1/legends`)) as { legends?: LegendRow[] }
  const legends = legData.legends || []

  const rankingLegend = (ctx.query.legend as string | undefined) || String(legends[0]?.legend_id ?? '')
  const sort = (ctx.query.sort as string | undefined) || 'mastery'
  const rankingData = (await api.get(`/v1/ranking/legend/${rankingLegend}?sort=${sort}`)) as {
    players?: RankingsPlayerRow[]
  }

  return {
    legends: legends || [],
    players: rankingData.players || [],
  }
}

function Player({
  player,
  rank,
  sort,
}: {
  player: RankingsPlayerRow
  sort: string
  rank: number
}) {
  const urlQueries = useUrlQueries({
    brawlhalla_id: player.brawlhalla_id,
  })
  return (
    <tr>
      <td>{ordinalSuffixOf(rank)}</td>
      <td>
        <Link href={`/search${urlQueries}`}>{player.name}</Link>
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

function ordinalSuffixOf(i: number): string {
  const j = i % 10
  const k = i % 100
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
