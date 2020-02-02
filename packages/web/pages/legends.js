import { useState } from 'react'
import fetch from 'isomorphic-unfetch'
import PropTypes from 'prop-types'
import Legend from '../components/Legend'

Legends.propTypes = {
  legends: PropTypes.array,
}
export default function Legends({ legends }) {
  if (!legends) return null
  const [sort, setSort] = useState({ by: 'playrate', order: 'down' })

  const sortedLegends = legends.sort((a, b) => {
    const bigger = sort.order === 'up' ? 1 : -1
    const smaller = sort.order === 'up' ? -1 : 1

    if (sort.by === 'bio_name') return a[sort.by] > b[sort.by] ? bigger : smaller
    return a.stats[sort.by] > b.stats[sort.by] ? bigger : smaller
  })

  return (
    <div>
      {sortedLegends.map(legend => {
        return <Legend key={legend.legend_id} legend={legend} sort={sort} setSort={setSort} />
      })}
    </div>
  )
}

Legends.getInitialProps = async function(ctx) {
  const data = await fetch(
    `http://localhost:4401/v1/legends?patch=${ctx.query.patch}&tier=${ctx.query.tier}`
  ).then(res => res.json())

  return {
    legends: data.legends || [],
  }
}
