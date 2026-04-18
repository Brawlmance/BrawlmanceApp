import '../assets/css/normalize.min.css'
import '../assets/css/main.css'
import '../assets/css/search.css'
import '../assets/css/legend_stats.css'
import Head from 'next/head'

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import App, { type AppContext, type AppProps } from 'next/app'
import setupGoogleAnalytics from '../lib/google_analytics'
import usePatchAndTier, { changePatch, changeTier } from '../components/usePatchAndTier'
import api from '../lib/api'
import { normalizeTier } from '../lib/tier'
import useUrlQueries from '../lib/useUrlQueries'
import cache from '../lib/cache'
import bg1 from '../assets/img/bg/bg1.jpg'
import bg2 from '../assets/img/bg/bg2.jpg'
import bg3 from '../assets/img/bg/bg3.jpg'
import logo from '../assets/img/logo.png'
import type { HeaderData } from '../types/brawlmance'

setupGoogleAnalytics()

const bgs = [bg1, bg2, bg3]

type AppOwnProps = { headerData: HeaderData; bgIndex: number }

export default function MyApp({ Component, pageProps, headerData, bgIndex = 0 }: AppProps & AppOwnProps) {
  const randomBG = bgs[bgIndex % bgs.length].src
  return (
    <>
      <Head>
        <title>Brawlmance - Brawlhalla Statistics</title>
        <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container" id="main">
        <Header headerData={headerData} />
        <div id="content">
          <Component {...pageProps} />
        </div>
        <footer>
          <p>Backgrounds of stages, legend portraits, and stat icons by Blue Mammoth Games</p>
          <p>Using Brawlhalla, Steam, and Twitch APIs. Using JQuery, TinySort, Chart.js, and FontAwesome</p>
          <p>
            Brawlmance isn&apos;t endorsed by Blue Mammoth Games and doesn&apos;t reflect the views or opinions of Blue
            Mammoth Games or anyone officially involved in producing or managing Brawlhalla. Brawlhalla and Blue Mammoth
            Games are trademarks or registered trademarks of Blue Mammoth Games
          </p>
        </footer>
      </div>
      <img className="bg" src={randomBG} alt="" />
    </>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext)
  const tierQ = appContext.router?.query?.tier
  const tierParam = Array.isArray(tierQ) ? tierQ[0] : tierQ

  const headerDataKey = `headerData:${tierParam}`
  let headerData = cache.get<HeaderData>(headerDataKey)
  if (headerData === undefined) {
    const data = (await api.get(`/v1/patches?tier=${tierParam ?? 'undefined'}`)) as HeaderData
    headerData = data
    cache.set(headerDataKey, headerData)
  }

  const bgIndex = Math.floor(Math.random() * bgs.length)

  return { ...appProps, headerData, bgIndex }
}

function Header({ headerData: headerDataFromApp }: { headerData: HeaderData }) {
  const router = useRouter()
  const { patch, tier } = usePatchAndTier()
  const [headerData, setHeaderData] = useState<HeaderData>(headerDataFromApp)

  const tierNormalized = normalizeTier(router.query.tier)

  useEffect(() => {
    if (!router.isReady) return
    let cancelled = false
    api.get(`/v1/patches?tier=${encodeURIComponent(tierNormalized)}`).then((data) => {
      if (!cancelled) setHeaderData(data as HeaderData)
    })
    return () => {
      cancelled = true
    }
  }, [router.isReady, tierNormalized])

  const urlQueries = useUrlQueries()
  const patches = headerData.patches
  const tiers = headerData.tiers
  let totalGamesThisPatch = 0
  const patchStr = Array.isArray(patch) ? patch[0] : patch
  if (!patchStr) totalGamesThisPatch = patches[0].games
  else {
    const p = patches.find((p) => p.id === patchStr)
    if (p) totalGamesThisPatch = p.games
  }

  const patchValue = patchStr ?? ''
  const tierValue = Array.isArray(tier) ? tier[0] : (tier ?? '')

  return (
    <>
      <header>
        <div id="menu">
          <ul>
            <li id="brawlmance">
              <Link href={`/${urlQueries}`}>
                <img src={logo.src} width={logo.width} height={logo.height} alt="Logo" /> BRAWLMANCE
              </Link>
            </li>
            <li>
              <Link href={`/legends${urlQueries}`}>LEGENDS</Link>
            </li>
            <li>
              <Link href={`/weapons${urlQueries}`}>WEAPONS</Link>
            </li>
            <li>
              <Link href={`/rankings${urlQueries}`}>RANKINGS</Link>
            </li>
            <li>
              <Link href={`/about${urlQueries}`}>ABOUT</Link>
            </li>
          </ul>
        </div>
        <div id="aggregationstatus">
          <form method="GET" style={{ display: 'inline' }} id="patchform">
            <label>
              Patch{' '}
              <select name="patch" value={patchValue} onChange={(e) => changePatch(e.target.value)}>
                {patches.map((p) => {
                  return <option key={p.id}>{p.id}</option>
                })}
              </select>
            </label>
            <input type="hidden" name="tier" value={tierValue} />
          </form>
          <form method="GET" style={{ display: 'inline' }} id="tierform">
            <input type="hidden" name="patch" value={patchValue} />
            <label>
              <select name="tier" value={tierValue} onChange={(e) => changeTier(e.target.value)}>
                {tiers.map((tiername) => {
                  return <option key={tiername}>{tiername}</option>
                })}
              </select>
            </label>
          </form>
          <span id="n_analyzed">Games analyzed: {totalGamesThisPatch.toLocaleString()}</span>
        </div>
      </header>
      {totalGamesThisPatch < 200000 && (
        <div className="header_warning">
          <p>WARNING: We don&apos;t have enough data yet</p>
        </div>
      )}
    </>
  )
}
