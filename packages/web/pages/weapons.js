import PropTypes from 'prop-types'
import Weapon from '../components/Weapon'
import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { brawlmanceCsvFilename, downloadCsv } from '../lib/downloadCsv'

function weaponsToCsvRows(weapons) {
  const headers = [
    'weapon_id',
    'legends',
    'playrate',
    'winrate',
    'damage_dealt',
    'damage_weapon_one',
    'damage_weapon_two',
    'match_time',
    'timeheld',
    'timeheld1',
    'timeheld2',
  ]
  const rows = weapons.map(w => [
    w.weapon_id,
    w.legends,
    w.playrate,
    w.winrate,
    w.damage_dealt,
    w.damage_weapon_one,
    w.damage_weapon_two,
    w.match_time,
    w.timeheld,
    w.timeheld1,
    w.timeheld2,
  ])
  return [headers, ...rows]
}

Weapons.propTypes = {
  weapons: PropTypes.array,
}
export default function Weapons({ weapons }) {
  const router = useRouter()
  const [sort, setSort] = useState({ by: 'playrate', order: 'down' })

  if (!weapons) return null

  const sortedWeapons = weapons.sort((a, b) => {
    const bigger = sort.order === 'up' ? 1 : -1
    const smaller = sort.order === 'up' ? -1 : 1

    return a[sort.by] > b[sort.by] ? bigger : smaller
  })

  return (
    <div>
      {sortedWeapons.map(weapon => {
        return <Weapon key={weapon.weapon_id} weapon={weapon} sort={sort} setSort={setSort} />
      })}

      <div style={{ textAlign: 'center', marginTop: '2em' }}>
        <button
          type="button"
          onClick={() =>
            downloadCsv(brawlmanceCsvFilename('brawlmance-weapons', router), weaponsToCsvRows(sortedWeapons))
          }
          style={{
            color: '#222',
          }}>
          Download CSV
        </button>
      </div>
    </div>
  )
}

Weapons.getInitialProps = async function(ctx) {
  const data = await api.get(`/v1/weapons?patch=${ctx.query.patch}&tier=${ctx.query.tier}`)

  return {
    weapons: data.weapons || [],
  }
}
