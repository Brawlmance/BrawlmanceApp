import Weapon from '../components/Weapon'
import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { brawlmanceCsvFilename, downloadCsv } from '../lib/downloadCsv'
import type { SortState, WeaponRow } from '../types/brawlmance'
import type { NextPageContext } from 'next'

function weaponsToCsvRows(weapons: WeaponRow[]): (string | number)[][] {
  const headers = ['weapon_id', 'legends', 'playrate', 'winrate', 'damage_dealt', 'match_time', 'timeheld']
  const rows = weapons.map((w) => [
    w.weapon_id,
    w.legends,
    w.playrate,
    w.winrate,
    w.damage_dealt,
    w.match_time,
    w.timeheld,
  ])
  return [headers, ...rows]
}

type WeaponsProps = { weapons: WeaponRow[] }

export default function Weapons({ weapons }: WeaponsProps) {
  const router = useRouter()
  const [sort, setSort] = useState<SortState>({ by: 'playrate', order: 'down' })

  if (!weapons) return null

  const sortedWeapons = [...weapons].sort((a, b) => {
    const bigger = sort.order === 'up' ? 1 : -1
    const smaller = sort.order === 'up' ? -1 : 1
    const av = (a as Record<string, number | string>)[sort.by]
    const bv = (b as Record<string, number | string>)[sort.by]
    return av > bv ? bigger : smaller
  })

  return (
    <div>
      {sortedWeapons.map((weapon) => {
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

Weapons.getInitialProps = async function (ctx: NextPageContext) {
  const data = (await api.get(`/v1/weapons?patch=${ctx.query.patch}&tier=${ctx.query.tier}`)) as {
    weapons?: WeaponRow[]
  }

  return {
    weapons: data.weapons || [],
  }
}
