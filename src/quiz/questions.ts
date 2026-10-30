import { CHORDS, type Chord, type ChordId } from '../music/chords'
import { shuffle, takeRandom, type Random } from './random'

export interface Question {
  readonly chord: Chord
  readonly choices: readonly ChordId[]
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
