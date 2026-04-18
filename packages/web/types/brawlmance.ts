/** Shared UI/API shapes — extend as you model endpoints */

export type SortState = { by: string; order: 'up' | 'down' }

// TODO: align with /v1/legends payload
export type LegendRow = {
  legend_id: number
  bio_name: string
  strength: number
  dexterity: number
  defense: number
  speed: number
  weapon_one: string
  weapon_two: string
  legend_name_key: string
  stats: LegendStats
}

export type LegendStats = {
  games: number
  playrate: number
  winrate: number
  suicides: number
  damagetaken: number
  damagedealt: number
  damagedealt_unarmed: number
  damagedealt_gadgets: number
  damagedealt_weaponone: number
  damagedealt_weapontwo: number
  matchtime: number
  matchtime_unarmed: number
  matchtime_weaponone: number
  matchtime_weapontwo: number
}

// TODO: align with /v1/weapons payload
export type WeaponRow = {
  weapon_id: string
  legends: number
  playrate: number
  winrate: number
  damage_dealt: number
  damage_weapon_one: number
  damage_weapon_two: number
  match_time: number
  timeheld: number
  timeheld1: number
  timeheld2: number
}

export type HeaderData = {
  patches: { id: string; games: number }[]
  tiers: string[]
}

export type LegendStatRank = { rank: number; total: number }

export type LegendPatchHistory = {
  patchIds: string[]
  legendWinrates: number[]
  legendPlayrates: number[]
  averageWinrates: number[]
  averagePlayrates: number[]
}

export type WeaponDetailStats = {
  legends: number
  games: number
  playrate: number
  winrate: number
  damage_dealt: number
  damage_weapon_one: number
  damage_weapon_two: number
  match_time: number
  timeheld: number
  timeheld1: number
  timeheld2: number
}

/** `GET /v1/weapon/:weapon_id` */
export type WeaponDetailApiResponse = {
  weapon: {
    weapon_id: string
    stats?: WeaponDetailStats
  }
  ranks?: Record<string, LegendStatRank>
  previousRanks?: Record<string, LegendStatRank>
  rankChanges?: Record<string, number | null>
  patchHistory?: LegendPatchHistory | null
}

/** `GET /v1/legend/:legend_id` */
export type LegendDetailApiResponse = {
  legend: Omit<LegendRow, 'stats'> & { stats?: LegendStats }
  averageStats: {
    strength: number
    dexterity: number
    defense: number
    speed: number
  }
  ranks?: Record<string, LegendStatRank>
  previousRanks?: Record<string, LegendStatRank>
  rankChanges?: Record<string, number | null>
  patchHistory?: LegendPatchHistory | null
}
