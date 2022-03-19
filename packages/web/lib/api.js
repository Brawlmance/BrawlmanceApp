import fetch from 'isomorphic-unfetch'

const API_URL =
  process.browser && process.env.NODE_ENV !== 'development' ? 'https://brawlmance.com/api' : 'http://localhost:4401'

export default {
  get: function get(path) {
    return fetch(`${API_URL}${path}`).then(res => res.json())
  },
}
