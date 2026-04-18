import { useState } from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import Legend from '../components/Legend'
import api from '../lib/api'
import { brawlmanceCsvFilename, downloadCsv } from '../lib/downloadCsv'

function legendsToCsvRows(legends) {
  const headers = [
    'legend_id',
    'bio_name',
    'strength',
    'dexterity',
    'defense',
    'speed',
    'weapon_one',
    'weapon_two',
    'games',
    'playrate',
    'winrate',
    'suicides',
    'damagetaken',
    'damagedealt',
    'damagedealt_unarmed',
    'damagedealt_gadgets',
    'damagedealt_weaponone',
    'damagedealt_weapontwo',
    'matchtime',
    'matchtime_unarmed',
    'matchtime_weaponone',
    'matchtime_weapontwo',
  ]
  const rows = legends.map(l => {
    const s = l.stats
    return [
      l.legend_id,
      l.bio_name,
      l.strength,
      l.dexterity,
      l.defense,
      l.speed,
      l.weapon_one,
      l.weapon_two,
      s.games,
      s.playrate,
      s.winrate,
      s.suicides,
      s.damagetaken,
      s.damagedealt,
      s.damagedealt_unarmed,
      s.damagedealt_gadgets,
      s.damagedealt_weaponone,
      s.damagedealt_weapontwo,
      s.matchtime,
      s.matchtime_unarmed,
      s.matchtime_weaponone,
      s.matchtime_weapontwo,
    ]
  })
  return [headers, ...rows]
}

Legends.propTypes = {
  legends: PropTypes.array,
}
export default function Legends({ legends }) {
  const router = useRouter()
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

      <div style={{ textAlign: 'center', marginTop: '2em' }}>
        <button
          type="button"
          onClick={() =>
            downloadCsv(brawlmanceCsvFilename('brawlmance-legends', router), legendsToCsvRows(sortedLegends))
          }
          style={{
            color: '#222',
          }}>
          Download as CSV
        </button>
      </div>
    </div>
  )
}

Legends.getInitialProps = async function(ctx) {
  const data = await api.get(`/v1/legends?patch=${ctx.query.patch}&tier=${ctx.query.tier}`)

  return {
    legends: data.legends || [],
  }
}
