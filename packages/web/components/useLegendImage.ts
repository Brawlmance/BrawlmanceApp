import type { StaticImageData } from 'next/image'

export function useLegendImage(legend: { legend_name_key: string }): StaticImageData | undefined {
  let legendImage: StaticImageData | undefined
  try {
    // Dynamic legend portraits — TODO: import map or validate keys if you want stricter typing
    // eslint-disable-next-line import/no-commonjs
    legendImage = require(`../assets/img/legends/${legend.legend_name_key}.png`) as StaticImageData
  } catch {
    // missing image
  }
  return legendImage
}
