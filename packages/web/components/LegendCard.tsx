import Chevron from './Chevron'
import Link from 'next/link'
import LegendImage from './LegendImage'
import useUrlQueries from '../lib/useUrlQueries'
import { weaponId2Name } from '../lib/weaponNames'
import { useLegendImage } from './useLegendImage'
import { useHashTargetMatch } from './useHashTargetMatch'
import type { LegendRow, SortState } from '../types/brawlmance'
import styles from './LegendCard.module.css'

type LegendProps = {
  legend: LegendRow
  sort: SortState
  setSort: (s: SortState) => void
}

export default function LegendCard({ legend, sort, setSort }: LegendProps) {
  const urlQueries = useUrlQueries()
  const legendImage = useLegendImage(legend)
  const cardId = encodeURIComponent(legend.legend_name_key)
  const hashMatches = useHashTargetMatch(cardId)

  return (
    <div className={[styles.card, hashMatches ? styles.cardHighlighted : ''].filter(Boolean).join(' ')} id={cardId}>
      <div className={styles.cardHeaderRow}>
        {legendImage && <div className={styles.legendImageSpacer} aria-hidden />}

        {legendImage && <LegendImage legend={legend} />}

        <div className={styles.stats}>
          <div className={`${styles.statCell} ${styles.strength}`}>{legend.strength}</div>
          <div className={`${styles.statCell} ${styles.dexterity}`}>{legend.dexterity}</div>
          <div className={`${styles.statCell} ${styles.defense}`}>{legend.defense}</div>
          <div className={`${styles.statCell} ${styles.speed}`}>{legend.speed}</div>
        </div>
      </div>
      <p>
        <Link href={`/legend/${legend.legend_id}${urlQueries}`}>
          <b>{legend.bio_name}</b>
        </Link>
        <Chevron type="bio_name" sort={sort} setSort={setSort} />
      </p>
      <div className={styles.statistical}>
        <div>
          <p>
            Playrate
            <Chevron type="playrate" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.playrate}%
        </div>
        <div>
          <p>
            Winrate
            <Chevron type="winrate" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.winrate}%
        </div>
        <div>
          <p>
            Dmg taken
            <Chevron type="damagetaken" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.damagetaken}
        </div>
        <div>
          <p>
            Suicides
            <Chevron type="suicides" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.suicides}
        </div>
        <div>
          <p>
            Dmg dealt
            <Chevron type="damagedealt" sort={sort} setSort={setSort} />
          </p>
          {legend.stats.damagedealt.toFixed(0)}
          <div className={styles.detailMuted}>
            Unarmed: {((legend.stats.damagedealt_unarmed / legend.stats.damagedealt) * 100).toFixed(2) + '%'}
          </div>
          <div className={styles.detailMuted}>
            Gadgets: {((legend.stats.damagedealt_gadgets / legend.stats.damagedealt) * 100).toFixed(2) + '%'}
          </div>
          <div className={styles.detailMuted}>
            {weaponId2Name(legend.weapon_one)}:{' '}
            {((legend.stats.damagedealt_weaponone / legend.stats.damagedealt) * 100).toFixed(2) + '%'}
          </div>
          <div className={styles.detailMuted}>
            {weaponId2Name(legend.weapon_two)}:{' '}
            {((legend.stats.damagedealt_weapontwo / legend.stats.damagedealt) * 100).toFixed(2) + '%'}
          </div>
        </div>
        <div>
          <p>
            Match duration
            <Chevron type="matchtime" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.matchtime.toFixed(0)} seconds
          <div className={styles.detailMuted}>
            Unarmed: {((legend.stats.matchtime_unarmed / legend.stats.matchtime) * 100).toFixed(2) + '%'}
          </div>
          <div className={styles.detailMuted}>
            {weaponId2Name(legend.weapon_one)}:{' '}
            {((legend.stats.matchtime_weaponone / legend.stats.matchtime) * 100).toFixed(2) + '%'}
          </div>
          <div className={styles.detailMuted}>
            {weaponId2Name(legend.weapon_two)}:{' '}
            {((legend.stats.matchtime_weapontwo / legend.stats.matchtime) * 100).toFixed(2) + '%'}
          </div>
        </div>
      </div>
    </div>
  )
}
