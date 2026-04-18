function querySegment(q) {
  if (q === undefined) return null
  const v = Array.isArray(q) ? q[0] : q
  return v ? String(v) : null
}

/** @param {string} prefix e.g. brawlmance-legends */
export function brawlmanceCsvFilename(prefix, router) {
  if (!router || !router.query) return `${prefix}.csv`
  const patch = querySegment(router.query.patch)
  const tier = querySegment(router.query.tier)
  const tail = [patch, tier].filter(Boolean).join('-')
  return `${prefix}${tail ? `-${tail}` : ''}.csv`
}

function escapeCsvCell(val) {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** @param {string} filename @param {(string|number)[][]} rows First row is headers */
export function downloadCsv(filename, rows) {
  if (typeof window === 'undefined') return
  const content = rows.map(row => row.map(escapeCsvCell).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
