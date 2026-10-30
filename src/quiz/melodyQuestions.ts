import { MELODIES, type Melody, type MelodyId } from '../music/melodies'
import { shuffle, takeRandom, type Random } from './random'

export interface MelodyQuestion {
  readonly melody: Melody
  readonly choices: readonly MelodyId[]
}

export function createMelodyQuestion(
  previous?: MelodyId,
  random: Random = Math.random,
): MelodyQuestion {
  const melody = takeRandom(MELODIES.filter((item) => item.id !== previous), random)
  const distractors = [...MELODIES.filter((item) => item.id !== melody.id)]
  return {
    melody,
    choices: shuffle([
      melody.id,
      takeRandom(distractors, random).id,
      takeRandom(distractors, random).id,
      takeRandom(distractors, random).id,
    ], random),
  }
}
