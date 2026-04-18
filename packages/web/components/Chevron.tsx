import type { SortState } from '../types/brawlmance'
import styles from './Chevron.module.css'

type ChevronProps = {
  sort: SortState
  type: string
  setSort: (s: SortState) => void
}

export default function Chevron({ sort, type, setSort }: ChevronProps) {
  const chevronClicked = (): void => {
    if (sort.by === type) setSort({ by: sort.by, order: sort.order === 'down' ? 'up' : 'down' })
    else setSort({ by: type, order: 'down' })
  }

  const isActive = sort.by === type
  const classNameOrder = isActive ? sort.order : 'down'
  return (
    <i
      onClick={chevronClicked}
      className={`fa fa-chevron-${classNameOrder} ${styles.orderfactor} ${isActive ? styles.active : ''}`}></i>
  )
}
