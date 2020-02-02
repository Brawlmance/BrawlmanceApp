import PropTypes from 'prop-types'

Chevron.propTypes = {
  sort: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  setSort: PropTypes.func.isRequired,
}
export default function Chevron({ sort, type, setSort }) {
  const chevronClicked = () => {
    if (sort.by === type) setSort({ by: sort.by, order: sort.order === 'down' ? 'up' : 'down' })
    else setSort({ by: type, order: 'down' })
  }

  const isActive = sort.by === type
  const classNameOrder = isActive ? sort.order : 'down'
  return (
    <i onClick={chevronClicked} className={`fa fa-chevron-${classNameOrder} orderfactor ${isActive && 'active'}`}></i>
  )
}
