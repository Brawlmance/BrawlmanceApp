import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import Legend from '../components/Legend'
import { useState } from 'react'
import api from '../lib/api'
import cache from '../lib/cache'

Index.propTypes = {
  legends: PropTypes.array,
  livestreams: PropTypes.array,
}
export default function Index({ legends, livestreams }) {
  if (!legends) return null
  const [sortWinrate, setSortWinrate] = useState({ by: 'winrate', order: 'down' })
  const [sortPlayrate, setSortPlayrate] = useState({ by: 'playrate', order: 'down' })

  const mostPlayedLegends = legends
    .sort((a, b) => {
      return a.stats.playrate > b.stats.playrate ? -1 : 1
    })
    .slice(0, 4)
    .sort((a, b) => {
      const bigger = sortPlayrate.order === 'up' ? 1 : -1
      const smaller = sortPlayrate.order === 'up' ? -1 : 1

      if (sortPlayrate.by === 'bio_name') return a[sortPlayrate.by] > b[sortPlayrate.by] ? bigger : smaller
      return a.stats[sortPlayrate.by] > b.stats[sortPlayrate.by] ? bigger : smaller
    })

  const highestWinrateLegends = legends
    .sort((a, b) => {
      return a.stats.winrate > b.stats.winrate ? -1 : 1
    })
    .slice(0, 4)
    .sort((a, b) => {
      const bigger = sortWinrate.order === 'up' ? 1 : -1
      const smaller = sortWinrate.order === 'up' ? -1 : 1

      if (sortWinrate.by === 'bio_name') return a[sortWinrate.by] > b[sortWinrate.by] ? bigger : smaller
      return a.stats[sortWinrate.by] > b.stats[sortWinrate.by] ? bigger : smaller
    })

  return (
    <div>
      <h1>Most played legends</h1>
      {mostPlayedLegends.map(legend => {
        return <Legend key={legend.legend_id} legend={legend} sort={sortPlayrate} setSort={setSortPlayrate} />
      })}
      <h1>Highest winrate legends</h1>
      {highestWinrateLegends.map(legend => {
        return <Legend key={legend.legend_id} legend={legend} sort={sortWinrate} setSort={setSortWinrate} />
      })}
      <h1>Most OP legends</h1>
      <p style={{ textAlign: 'center' }}>The ones that match your play style and make you happy</p>
      <div className="streams">
        <h1>Top live streams</h1>
        {livestreams.map(stream => {
          return (
            <div key={stream.id}>
              <a target="_blank" rel="noopener noreferrer nofollow" href={`https://www.twitch.tv/${stream.user_name}`}>
                <img src={stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')} />
                <span className="name">{stream.user_name}</span>
                <span className="viewers">
                  <i className="fa fa-user"></i>
                  {stream.viewer_count}
                </span>
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

Index.getInitialProps = async function(ctx) {
  const data = await api.get(`/v1/legends?patch=${ctx.query.patch}&tier=${ctx.query.tier}`)
  let livestreams
  try {
    livestreams = await getTopTwitchLivestreams()
  } catch (e) {}

  return {
    legends: data.legends || [],
    livestreams: livestreams || [],
  }
}

async function getTopTwitchLivestreams() {
  const key = `getTopTwitchLivestreams`
  let data = cache.get(key)
  if (data === undefined) {
    data = await fetch('https://api.twitch.tv/helix/streams?game_id=460316&first=4', {
      method: 'GET',
      headers: {
        'Client-ID': 'jnbefsfmq6ms8838022rdxn30duav2u',
      },
      mode: 'cors',
      cache: 'default',
    })
      .then(res => res.json())
      .then(res => res.data)

    cache.set(key, data)
  }
  return data
}
