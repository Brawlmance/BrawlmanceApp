/** DOM id on `LegendCard` — must match the `#fragment` for scroll + highlight. */
export function legendCardDomId(legend: { legend_name_key: string }): string {
  return legend.legend_name_key
}

/** `/legends` with query string + hash to focus a legend card (e.g. back from detail page). */
export function legendsHrefWithCard(urlQueries: string, legend: { legend_name_key: string }): string {
  return `/legends${urlQueries}#${encodeURIComponent(legend.legend_name_key)}`
}
