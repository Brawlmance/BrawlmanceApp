import { useState } from 'react'
import PropTypes from 'prop-types'
import Legend from '../components/Legend'
import api from '../lib/api'

Legends.propTypes = {
  legends: PropTypes.array,
}
export default function Legends({ legends }) {
  const [sort, setSort] = useState({ by: 'playrate', order: 'down' })

  if (!legends) return null

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
  const data = await api.get(`/v1/legends?patch=${ctx.query.patch}&tier=${ctx.query.tier}`)

  return {
    legends: data.legends || [],
  }
}
