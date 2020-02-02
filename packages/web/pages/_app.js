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

setupGoogleAnalytics()

MyApp.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object.isRequired,
  headerData: PropTypes.object.isRequired,
}
export default function MyApp({ Component, pageProps, headerData }) {
  const randomBG = [
    require('../assets/img/bg/bg1.jpg'),
    require('../assets/img/bg/bg2.jpg'),
    require('../assets/img/bg/bg3.jpg'),
  ][Math.floor(Date.now() / 60000) % 3]

  return (
    <>
      <Head>
        <title>Brawlmance - Brawlhalla Statistics</title>
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

  const headerData = await api.get(`/v1/patches?tier=${ctx.router.query.tier}`)

  return { ...appProps, headerData }
}

Header.propTypes = {
  headerData: PropTypes.object.isRequired,
}
function Header({ headerData }) {
  const { patch, tier } = usePatchAndTier()
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
              <Link href="/">
                <a>
                  <img src={require('../assets/img/logo.png')} alt="Logo" /> BRAWLMANCE
                </a>
              </Link>
            </li>
            <li>
              <Link href="/legends">
                <a>LEGENDS</a>
              </Link>
            </li>
            <li>
              <Link href="/weapons">
                <a>WEAPONS</a>
              </Link>
            </li>
            <li>
              <Link href="/rankings">
                <a>RANKINGS</a>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <a>ABOUT</a>
              </Link>
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
      <div className="header_warning">
        <p>We lost all historical data, and are working on recovering it.</p>
        <p>Additionally, this webpage has been rebuilt from the ground up, so there might be some bugs.</p>
      </div>
    </>
  )
}
