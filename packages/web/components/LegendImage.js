import Image from 'next/image'
import { useLegendImage } from './useLegendImage'

export default function LegendImage({ legend, ...props }) {
  const legendImage = useLegendImage(legend)

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
