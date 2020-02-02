import fetch from 'isomorphic-unfetch'
import PropTypes from 'prop-types'
import Legend from '../components/Legend'
import { useState } from 'react'

Index.propTypes = {
  legends: PropTypes.array,
}
export default function Index({ legends }) {
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
      <div>
        <h1>Top live streams</h1>
        <p style={{ textAlign: 'center' }}>Coming soon</p>
      </div>
    </div>
  )
}

Index.getInitialProps = async function(ctx) {
  const res = await fetch(`http://localhost:4401/v1/legends?patch=${ctx.query.patch}&tier=${ctx.query.tier}`)
  const data = await res.json()

  return {
    legends: data.legends || [],
  }
}
