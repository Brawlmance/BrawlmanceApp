import PropTypes from 'prop-types'
import Link from 'next/link'
import Image from 'next/image'
import Chevron from './Chevron'
import useUrlQueries from '../lib/useUrlQueries'

function weaponId2Name(name) {
  switch (name) {
    case 'RocketLance':
      return 'Rocket Lance'
    case 'Pistol':
      return 'Blasters'
    case 'Fists':
      return 'Gauntlets'
    case 'Katar':
      return 'Katars'
    default:
      return name
  }
}

Weapon.propTypes = {
  weapon: PropTypes.object.isRequired,
  sort: PropTypes.object.isRequired,
  setSort: PropTypes.func.isRequired,
}
export default function Weapon({ weapon, sort, setSort }) {
  const urlQueries = useUrlQueries()
  let weaponImage
  try {
    weaponImage = require(`../assets/img/weapons/${weapon.weapon_id}.png`)
  } catch (error) {}

  return (
    <div className="card" id={weapon.weapon_id}>
      <p>
        <Link href={`/weapons${urlQueries}#${weapon.weapon_id}`}>
          {weaponImage && (
            <Image
              src={weaponImage}
              alt={weaponId2Name(weapon.weapon_id)}
              width={28}
              height={28}
              style={{
                borderRadius: '4px',
                marginRight: '5px',
              }}
            />
          )}
          <b>{weaponId2Name(weapon.weapon_id)}</b>
        </Link>
        <Chevron type="weapon_id" sort={sort} setSort={setSort} />
      </p>
      <div className="statistical">
        <div>
          <p>
            Playr/Legends
            <Chevron type="playrate" sort={sort} setSort={setSort} />
          </p>{' '}
          {weapon.playrate}%
        </div>
        <div>
          <p>
            Winrate
            <Chevron type="winrate" sort={sort} setSort={setSort} />
          </p>{' '}
          {weapon.winrate}%
        </div>
        <div>
          <p>
            Legends
            <Chevron type="a" sort={sort} setSort={setSort} />
          </p>{' '}
          {weapon.legends}
        </div>
        <div>
          <p>
            Dmg dealt
            <Chevron type="damage_dealt" sort={sort} setSort={setSort} />
          </p>{' '}
          {weapon.damage_dealt}
        </div>
        <div>
          <p>
            Match duration
            <Chevron type="match_time" sort={sort} setSort={setSort} />
          </p>{' '}
          {weapon.match_time} seconds
        </div>
        <div>
          <p>
            Time Held
            <Chevron type="timeheld" sort={sort} setSort={setSort} />
          </p>{' '}
          {weapon.timeheld} seconds
        </div>
      </div>
    </div>
  )
}
