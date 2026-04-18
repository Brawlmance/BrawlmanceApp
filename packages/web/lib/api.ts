import fetch from 'isomorphic-unfetch'
import { env } from './env'

const API_URL = typeof window !== 'undefined' ? env.NEXT_PUBLIC_API_URL_FOR_CLIENT : env.API_URL_FOR_SSR

const api = {
  // TODO: narrow JSON response types per endpoint
  get(path: string): Promise<unknown> {
    return fetch(`${API_URL}${path}`).then((res) => res.json())
  },
}

export default api
