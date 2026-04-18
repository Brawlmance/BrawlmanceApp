import '../assets/css/normalize.min.css'
import '../assets/css/main.css'
import '../assets/css/search.css'
import '../assets/css/legend_stats.css'
import Head from 'next/head'

import Link from 'next/link'
import App from 'next/app'
import PropTypes from 'prop-types'
import setupGoogleAnalytics from '../lib/google_analytics'
import usePatchAndTier, { changePatch, changeTier } from '../components/usePatchAndTier'
import api from '../lib/api'
import useUrlQueries from '../lib/useUrlQueries'
import cache from '../lib/cache'
import bg1 from '../assets/img/bg/bg1.jpg'
import bg2 from '../assets/img/bg/bg2.jpg'
import bg3 from '../assets/img/bg/bg3.jpg'
import logo from '../assets/img/logo.png'

setupGoogleAnalytics()

const bgs = [bg1, bg2, bg3]

MyApp.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object.isRequired,
  headerData: PropTypes.object.isRequired,
  bgIndex: PropTypes.number,
}
export default function MyApp({ Component, pageProps, headerData, bgIndex = 0 }) {
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
MyApp.getInitialProps = async ctx => {
  const appProps = await App.getInitialProps(ctx)

  const headerDataKey = `headerData:${ctx.router.query.tier}`
  let headerData = cache.get(headerDataKey)
  if (headerData === undefined) {
    headerData = await api.get(`/v1/patches?tier=${ctx.router.query.tier}`)
    cache.set(headerDataKey, headerData)
  }

  const bgIndex = Math.floor(Math.random() * bgs.length)

  return { ...appProps, headerData, bgIndex }
}

Header.propTypes = {
  headerData: PropTypes.object.isRequired,
}
function Header({ headerData }) {
  const { patch, tier } = usePatchAndTier()
  const urlQueries = useUrlQueries()
  const patches = headerData.patches
  const tiers = headerData.tiers
  let totalGamesThisPatch = 0
  if (!patch) totalGamesThisPatch = patches[0].games
  else if (patches.find(p => p.id === patch)) totalGamesThisPatch = patches.find(p => p.id === patch).games

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
              <select name="patch" value={patch} onChange={e => changePatch(e.target.value)}>
                {patches.map(patch => {
                  return <option key={patch.id}>{patch.id}</option>
                })}
              </select>
            </label>
            <input type="hidden" name="tier" value="<?=$tier?>" />
          </form>
          <form method="GET" style={{ display: 'inline' }} id="tierform">
            <input type="hidden" name="patch" value="<?=$patchid?>" />
            <label>
              <select name="tier" value={tier} onChange={e => changeTier(e.target.value)}>
                {tiers.map(tiername => {
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
