import { LegendPatchLineBlock } from './LegendDetailCharts'
import type { LegendPatchHistory } from '../types/brawlmance'

type Props = {
  patchHistory: LegendPatchHistory | null | undefined
}

export default function WeaponDetailVisualizations({ patchHistory }: Props) {
  if (!patchHistory || patchHistory.patchIds.length === 0) return null

  return (
    <section aria-labelledby="weapon-trends-heading">
      <h2 id="weapon-trends-heading">Trends by patch</h2>
      <LegendPatchLineBlock
        title="Win rate %"
        patchHistory={patchHistory}
        legendKey="legendWinrates"
        averageKey="averageWinrates"
        ySuffix="%"
        primaryLabel="This weapon"
        averageLabel="Average (all weapons)"
      />
      <LegendPatchLineBlock
        title="Play rate %"
        patchHistory={patchHistory}
        legendKey="legendPlayrates"
        averageKey="averagePlayrates"
        ySuffix="%"
        primaryLabel="This weapon"
        averageLabel="Average (all weapons)"
      />
    </section>
  )
}
