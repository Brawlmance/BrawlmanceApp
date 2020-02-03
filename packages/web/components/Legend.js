import PropTypes from 'prop-types'
import Chevron from './Chevron'
import Link from 'next/link'
import useUrlQueries from '../lib/useUrlQueries'

function legendName2divId(legend) {
  return legend.bio_name.replace(' ', '')
}
function weaponId2Name(name) {
  switch (name) {
    case 'RocketLance':
      return 'Rocket Lance'
    case 'Pistol':
      return 'Blasters'
    case 'Fists':
      return 'Gauntlets'
    case 'Katar':
      return 'Katars'
    default:
      return name
  }
}

Legend.propTypes = {
  legend: PropTypes.object.isRequired,
  sort: PropTypes.object.isRequired,
  setSort: PropTypes.func.isRequired,
}
export default function Legend({ legend, sort, setSort }) {
  const urlQueries = useUrlQueries()
  return (
    <div className="card" id={legendName2divId(legend)}>
      <img alt="" src={`/img/legends/${legend.legend_id}.png`} />
      <p>
        <Link href={`/legends${urlQueries}#${legendName2divId(legend)}`}>
          <a>
            <b>{legend.bio_name}</b>
          </a>
        </Link>{' '}
        <Chevron type="bio_name" sort={sort} setSort={setSort} />
      </p>
      <div className="stats">
        <div className="strength">{legend.strength}</div>
        <div className="dexterity">{legend.dexterity}</div>
        <div className="defense">{legend.defense}</div>
        <div className="speed">{legend.speed}</div>
      </div>
      <div className="statistical">
        <div>
          <p>
            Playrate <Chevron type="playrate" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.playrate}%
        </div>
        <div>
          <p>
            Winrate <Chevron type="winrate" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.winrate}%
        </div>
        <div>
          <p>
            Dmg taken <Chevron type="damagetaken" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.damagetaken}
        </div>
        <div>
          <p>
            Suicides <Chevron type="suicides" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.suicides}
        </div>
        <div>
          <p>
            Dmg dealt <Chevron type="damagedealt" sort={sort} setSort={setSort} />
          </p>
          {legend.stats.damagedealt.toLocaleString()}
          <div className="damagedealt">
            Unarmed: {((legend.stats.damagedealt_unarmed / legend.stats.damagedealt) * 100, 1).toLocaleString() + '%'}
          </div>
          <div className="damagedealt">
            Gadgets: {((legend.stats.damagedealt_gadgets / legend.stats.damagedealt) * 100, 1).toLocaleString() + '%'}
          </div>
          <div className="damagedealt">
            {weaponId2Name(legend.weapon_one)}:{' '}
            {((legend.stats.damagedealt_weaponone / legend.stats.damagedealt) * 100, 1).toLocaleString() + '%'}
          </div>
          <div className="damagedealt">
            {weaponId2Name(legend.weapon_two)}:{' '}
            {((legend.stats.damagedealt_weapontwo / legend.stats.damagedealt) * 100, 1).toLocaleString() + '%'}
          </div>
        </div>
        <div>
          <p>
            Match duration <Chevron type="matchtime" sort={sort} setSort={setSort} />
          </p>{' '}
          {legend.stats.matchtime.toLocaleString()} seconds
          <div className="matchtime">
            Unarmed: {((legend.stats.matchtime_unarmed / legend.stats.matchtime) * 100, 1).toLocaleString() + '%'}
          </div>
          <div className="matchtime">
            {weaponId2Name(legend.weapon_one)}:{' '}
            {((legend.stats.matchtime_weaponone / legend.stats.matchtime) * 100, 1).toLocaleString() + '%'}
          </div>
          <div className="matchtime">
            {weaponId2Name(legend.weapon_two)}:{' '}
            {((legend.stats.matchtime_weapontwo / legend.stats.matchtime) * 100, 1).toLocaleString() + '%'}
          </div>
        </div>
      </div>
    </div>
  )
}
