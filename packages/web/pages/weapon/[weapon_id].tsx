import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import type { NextPageContext } from 'next'
import type { StaticImageData } from 'next/image'
import useUrlQueries from '../../lib/useUrlQueries'
import api from '../../lib/api'
import { weaponId2Name } from '../../lib/weaponNames'
import type { WeaponDetailApiResponse, WeaponDetailStats } from '../../types/brawlmance'
import styles from '../legend/LegendDetailPage.module.css'

const WeaponDetailVisualizations = dynamic(() => import('../../components/WeaponDetailVisualizations'), {
  ssr: false,
  loading: () => <p className={styles.muted}>Loading charts…</p>,
})

type PageProps = { data?: WeaponDetailApiResponse; loadError?: string }

function statTableRows(stats: WeaponDetailStats) {
  return [
    { label: 'Playrate', minor: false, value: `${stats.playrate}%`, rankKey: 'playrate' },
    { label: 'Winrate', minor: false, value: `${stats.winrate}%`, rankKey: 'winrate' },
    {
      label: 'Legends',
      minor: false,
      value: Math.round(stats.legends).toLocaleString(),
      rankKey: 'legends',
    },
    {
      label: 'Games (patch slice)',
      minor: false,
      value: Math.round(stats.games).toLocaleString(),
      rankKey: 'games',
    },
    {
      label: 'Damage dealt (per game)',
      minor: false,
      value: stats.damage_dealt.toFixed(2),
      rankKey: 'damage_dealt',
    },
    {
      label: '(As weapon slot 1)',
      minor: true,
      value: stats.damage_weapon_one.toFixed(2),
      rankKey: 'damage_weapon_one',
    },
    {
      label: '(As weapon slot 2)',
      minor: true,
      value: stats.damage_weapon_two.toFixed(2),
      rankKey: 'damage_weapon_two',
    },
    {
      label: 'Match duration (seconds)',
      minor: false,
      value: stats.match_time.toFixed(2),
      rankKey: 'match_time',
    },
    {
      label: 'Time held (total)',
      minor: false,
      value: stats.timeheld.toFixed(2),
      rankKey: 'timeheld',
    },
    {
      label: '(Slot 1)',
      minor: true,
      value: stats.timeheld1.toFixed(2),
      rankKey: 'timeheld1',
    },
    {
      label: '(Slot 2)',
      minor: true,
      value: stats.timeheld2.toFixed(2),
      rankKey: 'timeheld2',
    },
  ]
}

function RankChangeCell({
  rankKey,
  rankChanges,
}: {
  rankKey: string
  rankChanges: WeaponDetailApiResponse['rankChanges']
}) {
  const delta = rankChanges?.[rankKey]
  if (delta === null || delta === undefined || delta === 0) {
    return (
      <td className={[styles.numeric, styles.rankChange].join(' ')} title="Vs previous patch (lower rank is better)">
        —
      </td>
    )
  }
  const worse = delta > 0
  return (
    <td className={[styles.numeric, styles.rankChange].join(' ')} title="Vs previous patch (lower rank is better)">
      <span className={worse ? styles.worse : styles.better}>
        {worse ? '▼' : '▲'} {Math.abs(delta)}
      </span>
    </td>
  )
}

function WeaponHeroImage({ weaponId }: { weaponId: string }) {
  let weaponImage: StaticImageData | undefined
  try {
    weaponImage = require(`../../assets/img/weapons/${weaponId}.png`) as StaticImageData
  } catch {
    // missing image
  }
  if (!weaponImage) return null
  return (
    <Image className={styles.weaponHeroThumb} src={weaponImage} alt={weaponId2Name(weaponId)} width={96} height={96} />
  )
}

export default function WeaponDetailPage({ data, loadError }: PageProps) {
  const urlQueries = useUrlQueries()

  if (loadError || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>
          <p>{loadError ?? 'Something went wrong.'}</p>
          <p>
            <Link href={`/weapons${urlQueries}`} className={styles.backLink}>
              ← Back to weapons
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const { weapon, ranks, rankChanges, patchHistory } = data
  const hasStats = Boolean(weapon.stats)
  const stats = weapon.stats
  const displayName = weaponId2Name(weapon.weapon_id)

  return (
    <div className={styles.page}>
      <Head>
        <title>{displayName} — Brawlmance</title>
      </Head>

      <nav className={styles.backRow} aria-label="Breadcrumb">
        <Link href={`/weapons${urlQueries}#${encodeURIComponent(weapon.weapon_id)}`} className={styles.backLink}>
          ← Weapons overview
        </Link>
      </nav>

      <header className={styles.hero}>
        <WeaponHeroImage weaponId={weapon.weapon_id} />
        <div className={styles.heroText}>
          <h1>{displayName}</h1>
          <p className={styles.subtitle}>
            Weapon id {weapon.weapon_id}
            {hasStats && stats ? ` · ${Math.round(stats.games).toLocaleString()} games in this patch/tier slice` : null}
          </p>
        </div>
      </header>

      {!hasStats && (
        <div className={styles.warning} role="status">
          No ranked statistics for this patch and tier yet (not enough games). Change patch or tier in the header.
        </div>
      )}

      {hasStats && stats && ranks && (
        <div className={styles.grid}>
          <div className={styles.tableColumn}>
            <h2 className={styles.sectionTitle}>Weapon statistics</h2>
            <p className={styles.muted}>
              Values are per your selected patch and tier. Ranks compare this weapon to every other weapon with data.
              Damage and time-held splits reflect use as weapon slot 1 vs slot 2 across all legends that wield this
              weapon.
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.statsTable}>
                <thead>
                  <tr>
                    <th scope="col">Stat</th>
                    <th scope="col">Value</th>
                    <th scope="col">Rank</th>
                    <th scope="col">Rank Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {statTableRows(stats).map((r) => {
                    const rk = ranks[r.rankKey]
                    return (
                      <tr key={r.rankKey} className={r.minor ? styles.rowMinor : undefined}>
                        <td>{r.label}</td>
                        <td className={styles.numeric}>{r.value}</td>
                        <td className={styles.numeric}>{rk ? `${rk.rank} / ${rk.total}` : '—'}</td>
                        <RankChangeCell rankKey={r.rankKey} rankChanges={rankChanges} />
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.chartsColumn}>
            <div className={styles.chartsPanel}>
              <WeaponDetailVisualizations patchHistory={patchHistory} />
            </div>
          </div>
        </div>
      )}

      {hasStats && stats && !ranks && <p className={styles.muted}>Ranks could not be computed for this request.</p>}
    </div>
  )
}

WeaponDetailPage.getInitialProps = async (ctx: NextPageContext): Promise<PageProps> => {
  const rawId = ctx.query.weapon_id
  const weaponId = Array.isArray(rawId) ? rawId[0] : rawId
  if (!weaponId) {
    if (ctx.res) ctx.res.statusCode = 400
    return { loadError: 'Missing weapon id.' }
  }

  const patchQ = ctx.query.patch
  const tierQ = ctx.query.tier
  const patch = Array.isArray(patchQ) ? patchQ[0] : patchQ
  const tier = Array.isArray(tierQ) ? tierQ[0] : tierQ

  const params = new URLSearchParams()
  if (patch) params.set('patch', patch)
  if (tier) params.set('tier', tier ?? 'All')

  const qs = params.toString()
  const path = `/v1/weapon/${encodeURIComponent(weaponId)}${qs ? `?${qs}` : ''}`

  let json: WeaponDetailApiResponse & { error?: string }
  try {
    json = (await api.get(path)) as WeaponDetailApiResponse & { error?: string }
  } catch {
    if (ctx.res) ctx.res.statusCode = 502
    return { loadError: 'Could not reach the API.' }
  }

  if (json.error) {
    if (ctx.res) {
      ctx.res.statusCode = /not found/i.test(String(json.error)) ? 404 : 502
    }
    return { loadError: typeof json.error === 'string' ? json.error : 'Could not load weapon.' }
  }

  return { data: json }
}
