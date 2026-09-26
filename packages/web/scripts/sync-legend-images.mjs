// Downloads portraits for legends that have no image in assets/img/legends yet.
// Legend keys come from the Brawlmance API; portraits are scraped from brawlhalla.com/legends,
// matched by the card's alt text (the legend's display name, lowercased = legend_name_key).
// Prints the file names it wrote, one per line.
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const API_URL = process.env.BRAWLMANCE_API_URL || 'http://localhost:4401'
const ROSTER_URL = 'https://www.brawlhalla.com/legends'
const IMAGE_WIDTH = 265

const imagesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../assets/img/legends')

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
}

// Keep in sync with legendImageFileName in components/useLegendImage.ts
function legendImageFileName(legendNameKey) {
  return legendNameKey
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
}

async function fetchOk(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Brawlmance)' } })
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  return res
}

const { legends } = await (await fetchOk(`${API_URL}/v1/legends`)).json()
const missing = legends
  .map((legend) => legend.legend_name_key)
  .filter((key) => !existsSync(path.join(imagesDir, `${legendImageFileName(key)}.png`)))

if (missing.length > 0) {
  const html = await (await fetchOk(ROSTER_URL)).text()
  const portraits = new Map()
  for (const [, src, alt] of html.matchAll(/<img[^>]*src="([^"]+Roster_Pose[^"]+\.png)"[^>]*alt="([^"]+)"/g)) {
    portraits.set(decodeEntities(alt).toLowerCase(), src)
  }

  for (const key of missing) {
    const src = portraits.get(key)
    if (!src) {
      console.error(`No portrait found on ${ROSTER_URL} for "${key}"`)
      continue
    }
    const input = Buffer.from(await (await fetchOk(src)).arrayBuffer())
    await sharp(input)
      .resize({ width: IMAGE_WIDTH })
      .png({ palette: true })
      .toFile(path.join(imagesDir, `${legendImageFileName(key)}.png`))
    console.log(`${legendImageFileName(key)}.png`)
  }
}
