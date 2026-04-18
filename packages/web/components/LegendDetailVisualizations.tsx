import { LegendPatchLineBlock, LegendRadarBlock, LegendSignatureStackedBars } from './LegendDetailCharts'
import type { LegendPatchHistory, LegendStats } from '../types/brawlmance'
import styles from './LegendDetailVisualizations.module.css'

type Props = {
  legendRatings: { strength: number; dexterity: number; defense: number; speed: number }
  averageStats: { strength: number; dexterity: number; defense: number; speed: number }
  patchHistory: LegendPatchHistory | null | undefined
  stats?: LegendStats | null
  weaponOne?: string
  weaponTwo?: string
}

export default function LegendDetailVisualizations({
  legendRatings,
  averageStats,
  patchHistory,
  stats,
  weaponOne,
  weaponTwo,
}: Props) {
  const showSignature = Boolean(
    stats && weaponOne !== undefined && weaponTwo !== undefined && stats.damagedealt > 0 && stats.matchtime > 0
  )

  return (
    <>
      <section aria-labelledby="legend-ratings-heading">
        <h2 id="legend-ratings-heading">Base ratings</h2>
        <LegendRadarBlock legendRatings={legendRatings} averageStats={averageStats} />
      </section>

      {showSignature && stats && (
        <section className={styles.sectionFollow} aria-labelledby="legend-signature-heading">
          <h2 id="legend-signature-heading">Combat signature</h2>
          <LegendSignatureStackedBars stats={stats} weaponOne={weaponOne!} weaponTwo={weaponTwo!} />
        </section>
      )}

      {patchHistory && patchHistory.patchIds.length > 0 && (
        <section className={styles.sectionFollow} aria-labelledby="legend-trends-heading">
          <h2 id="legend-trends-heading">Trends by patch</h2>
          <LegendPatchLineBlock
            title="Win rate %"
            patchHistory={patchHistory}
            legendKey="legendWinrates"
            averageKey="averageWinrates"
            ySuffix="%"
          />
          <LegendPatchLineBlock
            title="Play rate %"
            patchHistory={patchHistory}
            legendKey="legendPlayrates"
            averageKey="averagePlayrates"
            ySuffix="%"
          />
        </section>
      )}
    </>
  )
}
