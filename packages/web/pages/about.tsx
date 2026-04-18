import api from '../lib/api'
import type { NextPageContext } from 'next'

type AboutProps = { randomFact: string }

export default function About({ randomFact }: AboutProps) {
  return (
    <div className="about">
      <p>
        Due to Brawlhalla&apos;s API limits, our data is collected from the current top ~25,000 ranked brawlhalla
        players (Roughly from Platinum to Top 1)
      </p>
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
        This project is open source! Check it out at <a href="https://github.com/Brawlmance">Github</a>
      </p>
    </div>
  )
}

About.getInitialProps = async function (ctx: NextPageContext) {
  const data = (await api.get(`/v1/random_fact?patch=${ctx.query.patch}&tier=${ctx.query.tier}`)) as { result?: string }

  return {
    randomFact: data.result || '',
  }
}
