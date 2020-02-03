import PropTypes from 'prop-types'
import api from '../lib/api'

About.propTypes = {
  randomFact: PropTypes.string.isRequired,
}
export default function About({ randomFact }) {
  return (
    <div className="about">
      <p>Data collected from the top ~400,000 brawlhalla players (Roughly from Silver 2 to Top 1)</p>
      <p>
        We don&apos;t have a way to only count ranked matches (until they release the game history API), so we&apos;re
        counting custom and other queues, but the data should be accurate enough. I&apos;ve tried a couple of times to
        have BMG check their stats VS mines with no luck, but they said that it should be representative
      </p>
      <p>Random fact: {randomFact}</p>
      <p>
        Made with love by <a href="https://balbona.me/">NiciusB</a>
      </p>
      <p>
        Other cool brawlhalla fansites (and other things): <a href="https://brawldb.com/">BrawlDB</a>,{' '}
        <a href="https://brawlspot.com/">Brawlspot</a>, <a href="https://www.stats.brawlhalla.fr/">Brawlhalla stats</a>
      </p>
      <p>
        This project is open source! Check it out at <a href="https://github.com/Brawlmance">Github</a>
      </p>
    </div>
  )
}

About.getInitialProps = async function(ctx) {
  const data = await api.get(`/v1/random_fact?patch=${ctx.query.patch}&tier=${ctx.query.tier}`)

  return {
    randomFact: data.result || '',
  }
}
