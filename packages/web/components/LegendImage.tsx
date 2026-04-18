import Image, { type ImageProps } from 'next/image'
import { useLegendImage } from './useLegendImage'
import type { LegendRow } from '../types/brawlmance'
import styles from './LegendImage.module.css'

type LegendImageProps = { legend: LegendRow } & Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>

export default function LegendImage({ legend, className, ...props }: LegendImageProps) {
  const legendImage = useLegendImage(legend)

  if (!legendImage) return null

  return (
    <Image
      src={legendImage}
      alt={legend.bio_name}
      width={90}
      height={90}
      className={[styles.image, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
