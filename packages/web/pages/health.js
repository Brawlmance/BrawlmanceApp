import PropTypes from 'prop-types'
import api from '../lib/api'

Health.propTypes = {
  status: PropTypes.array,
}
export default function Health({ status }) {
  return <div>{JSON.stringify(status)}</div>
}

Health.getInitialProps = async function(ctx) {
  const status = await api.get(`/health`)

  return {
    status,
  }
}
