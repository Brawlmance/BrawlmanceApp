/** TODO: align fully with /v1/ranking/user/:id */

export type RankingUserResponse = {
  error?: string
  player?: {
    name: string
    region: string
    lastupdated: number
    tier: string
    rank: number
    rating: number
    level: number
    wins: number
    games: number
    brawlhalla_id: number
  }
  clan?: { clan_name: string }
  legends: RankingUserLegendRow[]
}

export type RankingUserLegendRow = {
  legend_id: number
  bio_name: string
  level: number
  wins: number
  games: number
  rating: number
  peak_rating: number
  damagedealt: number
  damagetaken: number
  matchtime: number
  // TODO: remaining columns from join
  [key: string]: unknown
}
