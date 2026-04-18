import { LegendPatchLineBlock, LegendRadarBlock } from './LegendDetailCharts'
import type { LegendPatchHistory } from '../types/brawlmance'

type Props = {
  legendRatings: { strength: number; dexterity: number; defense: number; speed: number }
  averageStats: { strength: number; dexterity: number; defense: number; speed: number }
  patchHistory: LegendPatchHistory | null | undefined
}

export default function LegendDetailVisualizations({ legendRatings, averageStats, patchHistory }: Props) {
  return (
    <>
      <section aria-labelledby="legend-ratings-heading">
        <h2 id="legend-ratings-heading">Base ratings</h2>
        <LegendRadarBlock legendRatings={legendRatings} averageStats={averageStats} />
      </section>

      {patchHistory && patchHistory.patchIds.length > 0 && (
        <section aria-labelledby="legend-trends-heading">
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
