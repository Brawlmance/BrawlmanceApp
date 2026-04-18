import Link from 'next/link'
import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import Chevron from './Chevron'
import useUrlQueries from '../lib/useUrlQueries'
import type { SortState, WeaponRow } from '../types/brawlmance'

function weaponId2Name(name: string): string {
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

type WeaponProps = {
  weapon: WeaponRow
  sort: SortState
  setSort: (s: SortState) => void
}

export default function Weapon({ weapon, sort, setSort }: WeaponProps) {
  const urlQueries = useUrlQueries()
  let weaponImage: StaticImageData | undefined
  try {
    // eslint-disable-next-line import/no-commonjs
    weaponImage = require(`../assets/img/weapons/${weapon.weapon_id}.png`) as StaticImageData
  } catch {
    // missing image
  }

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
