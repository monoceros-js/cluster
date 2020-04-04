export const isInfinite = cluster => {
  return cluster === Infinity
}

export const isFunction = value => {
  return typeof value === 'function'
}

export const isArray = value => {
  return Array.isArray(value)
}
