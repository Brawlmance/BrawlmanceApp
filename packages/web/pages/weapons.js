import fetch from 'isomorphic-unfetch'
import PropTypes from 'prop-types'
import Weapon from '../components/Weapon'
import { useState } from 'react'

Weapons.propTypes = {
  weapons: PropTypes.array,
}
export default function Weapons({ weapons }) {
  if (!weapons) return null
  const [sort, setSort] = useState({ by: 'playrate', order: 'down' })

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
    </div>
  )
}

Weapons.getInitialProps = async function(ctx) {
  const data = await fetch(
    `http://localhost:4401/v1/weapons?patch=${ctx.query.patch}&tier=${ctx.query.tier}`
  ).then(res => res.json())

  return {
    weapons: data.weapons || [],
  }
}
