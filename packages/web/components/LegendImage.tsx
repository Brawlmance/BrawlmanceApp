import Image, { type ImageProps } from 'next/image'
import { useLegendImage } from './useLegendImage'
import type { LegendRow } from '../types/brawlmance'

type LegendImageProps = { legend: LegendRow } & Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>

export default function LegendImage({ legend, ...props }: LegendImageProps) {
  const legendImage = useLegendImage(legend)

  if (!legendImage) return null

  return (
    <Image
      src={legendImage}
      alt={legend.bio_name}
      width={90}
      height={90}
      style={{
        borderRadius: '8px',
      }}
      {...props}
    />
  )
}
