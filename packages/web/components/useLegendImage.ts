import type { StaticImageData } from 'next/image'

// Keep in sync with legendImageFileName in scripts/sync-legend-images.mjs.
// Characters like "&" break next/image's internal fetch, so file names only keep [a-z0-9 ].
export function legendImageFileName(legendNameKey: string): string {
  return legendNameKey
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
}

export function useLegendImage(legend: { legend_name_key: string }): StaticImageData | undefined {
  let legendImage: StaticImageData | undefined
  try {
    // Dynamic legend portraits — TODO: import map or validate keys if you want stricter typing
    legendImage = require(`../assets/img/legends/${legendImageFileName(legend.legend_name_key)}.png`) as StaticImageData
  } catch {
    // missing image
  }
  return legendImage
}
