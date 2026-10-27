import { CHORDS, type Chord, type ChordId } from '../music/chords'

export interface Question {
  readonly chord: Chord
  readonly choices: readonly ChordId[]
}

type Random = () => number

function takeRandom<T>(pool: T[], random: Random): T {
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Random values must be in [0, 1).')
  }
  const [picked] = pool.splice(Math.floor(value * pool.length), 1)
  if (picked === undefined) throw new Error('Cannot choose from an empty pool.')
  return picked
}

function shuffle<T>(values: readonly T[], random: Random): T[] {
  const pool = [...values]
  const result: T[] = []
  while (pool.length > 0) result.push(takeRandom(pool, random))
  return result
}

export function createQuestion(previous?: ChordId, random: Random = Math.random): Question {
  const chord = takeRandom(CHORDS.filter((item) => item.id !== previous), random)
  const counterpart = CHORDS.find((item) => item.root === chord.root && item.id !== chord.id)
  if (!counterpart) throw new Error(`Missing chord counterpart: ${chord.id}`)
  const otherRoots = CHORDS.filter((item) => item.root !== chord.root)
  const distractors = [takeRandom(otherRoots, random), takeRandom(otherRoots, random)]
  return {
    chord,
    choices: shuffle([chord.id, counterpart.id, ...distractors.map((item) => item.id)], random),
  }
}
