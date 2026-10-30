export type Random = () => number

export function takeRandom<T>(pool: T[], random: Random): T {
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Random values must be in [0, 1).')
  }
  const [picked] = pool.splice(Math.floor(value * pool.length), 1)
  if (picked === undefined) throw new Error('Cannot choose from an empty pool.')
  return picked
}

export function shuffle<T>(values: readonly T[], random: Random): T[] {
  const pool = [...values]
  const result: T[] = []
  while (pool.length > 0) result.push(takeRandom(pool, random))
  return result
}
