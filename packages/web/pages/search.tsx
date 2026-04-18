import Link from 'next/link'
import api from '../lib/api'
import useUrlQueries from '../lib/useUrlQueries'
import LegendImage from '../components/LegendImage'
import type { NextPageContext } from 'next'
import type { RankingUserResponse, RankingUserLegendRow } from '../types/ranking'
import type { LegendRow } from '../types/brawlmance'

type SearchProps = { rankingUserData: RankingUserResponse }

export default function Search({ rankingUserData }: SearchProps) {
  const urlQueries = useUrlQueries({
    brawlhalla_id: rankingUserData?.player?.brawlhalla_id,
  })

  if (rankingUserData.error) return <div>{rankingUserData.error}</div>
  const { player, clan, legends } = rankingUserData
  if (!player) return <div>Player not found</div>
  if (!legends || legends.length === 0) return <div>No data for {player.name}</div>

  let overallTotalGames = 0
  let overallDamageDealt = 0
  let overallDamageTaken = 0
  legends.forEach(legend => {
    overallTotalGames += legend.games
    overallDamageDealt += legend.damagedealt
    overallDamageTaken += legend.damagetaken
  })

  const agoStr = timeDifference(Date.now(), player.lastupdated * 1000)
  const firstLegend = legends[0] as unknown as LegendRow

  return (
    <>
      <div className="profile-header">
        <div className="name">
          <Link href={`/search${urlQueries}`}>
            <LegendImage className="avatar" legend={firstLegend} />
          </Link>
          <Link href={`/search${urlQueries}`}>
            <h1>
              {player.name} ({player.region})
            </h1>
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
      {legends.map((legend: RankingUserLegendRow) => {
        return (
          <div key={legend.legend_id} className="player-legend">
            <div className="name">
              <LegendImage legend={legend as unknown as LegendRow} />
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

Search.getInitialProps = async function (ctx: NextPageContext) {
  const brawlhallaID = ctx.query.brawlhalla_id
  const data = (await api.get(`/v1/ranking/user/${brawlhallaID}`)) as RankingUserResponse

  return {
    rankingUserData: data,
  }
}

function timeDifference(current: number, previous: number): string {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30

  const elapsed = current - previous

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
