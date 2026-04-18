import api from '../lib/api'
import type { NextPageContext } from 'next'

type HealthProps = { status: unknown }

export default function Health({ status }: HealthProps) {
  return <div>{JSON.stringify(status)}</div>
}

Health.getInitialProps = async function (ctx: NextPageContext) {
  const status = await api.get(`/health`)

  return {
    status,
  }
}
