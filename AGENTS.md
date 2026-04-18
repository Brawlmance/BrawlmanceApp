# Brawlmance — agent context

## What this project is

**Brawlmance** is a statistics site for **Brawlhalla** (the fighting game by Blue Mammoth Games). It surfaces match-derived metrics for **legends** (playable characters) and **weapons**, plus leaderboards for players. The product goal is to help players compare playrates, winrates, damage splits, and time-on-weapon in a patch- and tier-aware way.

The web app title and positioning: _Brawlmance — Brawlhalla Statistics_.

## Monorepo layout

| Package        | Role                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| `packages/web` | **Next.js** (Pages Router) frontend — UI, routing, client/SSR fetches to the API              |
| `packages/api` | **Express** HTTP API — reads from MySQL, applies patch/tier logic, optional in-memory caching |

Root scripts: `npm run lint` and `npm run typecheck` run both packages. Husky is used at the repo root (`prepare`).

## Domain terms

- **Legend** — A Brawlhalla character row (`legends` table) with `legend_id`, display names (`bio_name`, `legend_name_key`), base stats (`strength`, `dexterity`, `defense`, `speed`), and two weapon slots (`weapon_one`, `weapon_two`).
- **Patch** — A balance/content window identified by `patches.id` (string). Stats are scoped to the **days between patch timestamps** (`getPatchDaysCondition` in `packages/api/src/lib/utils.ts`). “Current” patch is resolved server-side when `patch` is missing or invalid.
- **Tier** — Rank bucket for stats: `All`, `Diamond`, `Platinum`, `Gold`, or `Silver`. Default when omitted: `All`. Stored/filtered on aggregated `stats` rows (`tier` column in SQL fragments).
- **Stats** — Per-legend aggregates from `stats`: games, wins, damage by source (unarmed, gadgets, weapon slots), time held per weapon, match time, etc. Derived fields include **playrate** (share of patch games) and **winrate** (normalized with a global **win rate balance** so the population centers sensibly).
- **Weapon** — Weapon id aggregated across legends that wield it; weapon endpoints roll up legend `stats` by mapping each legend’s `weapon_one` / `weapon_two` to weapon ids.

## API (`packages/api`)

- **Stack:** Express, `mysql2` pool, `body-parser`, `dotenv` (entry: `packages/api/index.ts` → `src/index.ts`).
- **Port:** `4401` (see `server.listen` in `src/index.ts`).
- **CORS:** Wide open (`*`) for typical browser use; supports `GET`, `POST`, `OPTIONS`.
- **Versioning:** JSON routes live under **`/v1/...`**.

### Main routes (illustrative)

| Method | Path                            | Notes                                                                    |
| ------ | ------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/v1/legends`                   | All legends with stats for `patch` + `tier`; cached ~120s                |
| GET    | `/v1/legend/:legend_id`         | One legend, optional ranks vs field, previous patch ranks, patch history |
| GET    | `/v1/weapons`                   | Weapon aggregates for `patch` + `tier`                                   |
| GET    | `/v1/patches`                   | Patch list with game counts; returns `tiers` list; cached ~1h            |
| GET    | `/v1/random_fact`               | Short stat snippet for the patch/tier window                             |
| GET    | `/v1/ranking/legend/:legend_id` | Top players for a legend; `sort=mastery \| elo \| peak_elo`              |
| GET    | `/v1/ranking/user/:user_id`     | Player profile, clan, legends                                            |
| GET    | `/health`                       | Health check (see `routes/health.ts`)                                    |

### Query parameters

Endpoints that slice stats typically accept:

- **`patch`** — Patch id; if missing/`undefined`, server picks current patch.
- **`tier`** — One of the five tiers; invalid values fall back to `All`.

Shared parsing: `getReqPatchAndTier` in `packages/api/src/lib/utils.ts`.

## Web (`packages/web`)

- **Stack:** Next.js **16**, React **19**, Pages Router (`pages/`), CSS modules, Radix (`@radix-ui/*`), `cmdk`, `isomorphic-unfetch`.
- **Port (production start):** `4400` (`next start --port 4400`).
- **API:** `lib/api.ts` is used to call the Brawlmance API
- **Routing / state:** Patch and tier follow the URL and global header (`usePatchAndTier`, `useUrlQueries`, `normalizeTier` in `lib/tier.ts`). Main pages include home (`/`), legends listing, weapons, rankings, search, about, health.

Shared UI types for legends/weapons/header live in `packages/web/types/brawlmance.ts` (some payloads still marked TODO to align exactly with API).

## Conventions for agents

- Prefer **small, focused changes**; match existing naming (API often **snake_case** in JSON/SQL from legacy PHP parity).
- When adding API behavior, wire routes in `packages/api/src/routes/index.ts` and keep **`/v1`** prefix consistent.
- When adding pages or data fetching, respect **patch/tier query** patterns already used in `_app` and pages.
- Run **`npm run typecheck`** and **`npm run lint`** from the repo root before finishing larger edits.
- **Keep this file accurate:** If a change affects anything described here (goals, data assumptions, domain terms, API routes or behavior, web stack or env, ports, or workflows), update **`AGENTS.md`** in the same change so future agents stay aligned.
