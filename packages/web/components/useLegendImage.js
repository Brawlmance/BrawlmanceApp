export function useLegendImage(legend) {
  let legendImage
  try {
    legendImage = require(`../assets/img/legends/${legend.legend_name_key}.png`)
  } catch (error) {}
  return legendImage
}
