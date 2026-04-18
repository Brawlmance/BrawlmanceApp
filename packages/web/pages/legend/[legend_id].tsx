import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import type { NextPageContext } from 'next'
import LegendImage from '../../components/LegendImage'
import useUrlQueries from '../../lib/useUrlQueries'
import api from '../../lib/api'
import { weaponId2Name } from '../../lib/weaponNames'
import type { LegendDetailApiResponse, LegendStats } from '../../types/brawlmance'
import styles from './LegendDetailPage.module.css'

const LegendDetailVisualizations = dynamic(() => import('../../components/LegendDetailVisualizations'), {
  ssr: false,
  loading: () => <p className={styles.muted}>Loading charts…</p>,
})

type PageProps = { data?: LegendDetailApiResponse; loadError?: string }

function statTableRows(stats: LegendStats, weaponOne: string, weaponTwo: string) {
  const pct = (num: number, den: number) => (den ? ((num / den) * 100).toFixed(1) + '%' : '—')
  const w1 = weaponId2Name(weaponOne)
  const w2 = weaponId2Name(weaponTwo)
  return [
    { label: 'Playrate', minor: false, value: `${stats.playrate}%`, rankKey: 'playrate' },
    { label: 'Winrate', minor: false, value: `${stats.winrate}%`, rankKey: 'winrate' },
    {
      label: 'Damage taken',
      minor: false,
      value: Math.round(stats.damagetaken).toLocaleString(),
      rankKey: 'damagetaken',
    },
    {
      label: 'Damage dealt',
      minor: false,
      value: Math.round(stats.damagedealt).toLocaleString(),
      rankKey: 'damagedealt',
    },
    {
      label: '(Unarmed)',
      minor: true,
      value: pct(stats.damagedealt_unarmed, stats.damagedealt),
      rankKey: 'damagedealt_unarmed',
    },
    {
      label: '(Gadgets)',
      minor: true,
      value: pct(stats.damagedealt_gadgets, stats.damagedealt),
      rankKey: 'damagedealt_gadgets',
    },
    {
      label: `(${w1})`,
      minor: true,
      value: pct(stats.damagedealt_weaponone, stats.damagedealt),
      rankKey: 'damagedealt_weaponone',
    },
    {
      label: `(${w2})`,
      minor: true,
      value: pct(stats.damagedealt_weapontwo, stats.damagedealt),
      rankKey: 'damagedealt_weapontwo',
    },
    {
      label: 'Match duration (seconds)',
      minor: false,
      value: Math.round(stats.matchtime).toLocaleString(),
      rankKey: 'matchtime',
    },
    {
      label: '(Unarmed)',
      minor: true,
      value: pct(stats.matchtime_unarmed, stats.matchtime),
      rankKey: 'matchtime_unarmed',
    },
    {
      label: `(${w1})`,
      minor: true,
      value: pct(stats.matchtime_weaponone, stats.matchtime),
      rankKey: 'matchtime_weaponone',
    },
    {
      label: `(${w2})`,
      minor: true,
      value: pct(stats.matchtime_weapontwo, stats.matchtime),
      rankKey: 'matchtime_weapontwo',
    },
  ]
}

function RankChangeCell({
  rankKey,
  rankChanges,
}: {
  rankKey: string
  rankChanges: LegendDetailApiResponse['rankChanges']
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

export default function LegendDetailPage({ data, loadError }: PageProps) {
  const urlQueries = useUrlQueries()

  if (loadError || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>
          <p>{loadError ?? 'Something went wrong.'}</p>
          <p>
            <Link href={`/legends${urlQueries}`} className={styles.backLink}>
              ← Back to legends
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const { legend, averageStats, ranks, rankChanges, patchHistory } = data
  const hasStats = Boolean(legend.stats)
  const stats = legend.stats

  return (
    <div className={styles.page}>
      <Head>
        <title>{legend.bio_name} — Brawlmance</title>
      </Head>

      <nav className={styles.backRow} aria-label="Breadcrumb">
        <Link href={`/legends${urlQueries}#${encodeURIComponent(legend.legend_name_key)}`} className={styles.backLink}>
          ← Legends overview
        </Link>
      </nav>

      <header className={styles.hero}>
        <LegendImage legend={legend} />
        <div className={styles.heroText}>
          <h1>{legend.bio_name}</h1>
          <p className={styles.subtitle}>
            Legend id {legend.legend_id}
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
            <h2 className={styles.sectionTitle}>Matchup statistics</h2>
            <p className={styles.muted}>
              Values are per your selected patch and tier. Ranks compare this legend to every other legend with data;
              weapon rows only rank against legends using that weapon in the same slot.
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
                  {statTableRows(stats, String(legend.weapon_one), String(legend.weapon_two)).map((r) => {
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
              <LegendDetailVisualizations
                legendRatings={{
                  strength: Number(legend.strength),
                  dexterity: Number(legend.dexterity),
                  defense: Number(legend.defense),
                  speed: Number(legend.speed),
                }}
                averageStats={averageStats}
                patchHistory={patchHistory}
              />
            </div>
          </div>
        </div>
      )}

      {hasStats && stats && !ranks && <p className={styles.muted}>Ranks could not be computed for this request.</p>}
    </div>
  )
}

LegendDetailPage.getInitialProps = async (ctx: NextPageContext): Promise<PageProps> => {
  const rawId = ctx.query.legend_id
  const legendId = Array.isArray(rawId) ? rawId[0] : rawId
  if (!legendId) {
    if (ctx.res) ctx.res.statusCode = 400
    return { loadError: 'Missing legend id.' }
  }

  const patchQ = ctx.query.patch
  const tierQ = ctx.query.tier
  const patch = Array.isArray(patchQ) ? patchQ[0] : patchQ
  const tier = Array.isArray(tierQ) ? tierQ[0] : tierQ

  const params = new URLSearchParams()
  if (patch) params.set('patch', patch)
  if (tier) params.set('tier', tier ?? 'All')

  const qs = params.toString()
  const path = `/v1/legend/${encodeURIComponent(legendId)}${qs ? `?${qs}` : ''}`

  let json: LegendDetailApiResponse & { error?: string }
  try {
    json = (await api.get(path)) as LegendDetailApiResponse & { error?: string }
  } catch {
    if (ctx.res) ctx.res.statusCode = 502
    return { loadError: 'Could not reach the API.' }
  }

  if (json.error) {
    if (ctx.res) {
      ctx.res.statusCode = /not found/i.test(String(json.error)) ? 404 : 502
    }
    return { loadError: typeof json.error === 'string' ? json.error : 'Could not load legend.' }
  }

  return { data: json }
}
