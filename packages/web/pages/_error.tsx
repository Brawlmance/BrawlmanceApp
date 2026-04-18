import type { NextPageContext } from 'next'
import styles from './_error.module.css'

type ErrorProps = {
  statusCode: number | undefined
}

function Error({ statusCode }: ErrorProps) {
  return (
    <p className={styles.message}>
      {statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}
    </p>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err && 'statusCode' in err ? err.statusCode : 404
  return { statusCode }
}

export default Error
