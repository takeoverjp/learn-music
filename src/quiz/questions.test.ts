import { describe, expect, it } from 'vitest'
import { CHORDS } from '../music/chords'
import { createQuestion } from './questions'

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

describe('question generation', () => {
  it('can select every chord as an initial question', () => {
    CHORDS.forEach((chord, index) => {
      expect(createQuestion(undefined, () => (index + 0.5) / 14).chord.id).toBe(chord.id)
    })
  })

  it('always supplies four unique choices including the answer and its counterpart', () => {
    for (let seed = 0; seed < 100; seed++) {
      const random = seededRandom(seed)
      for (const previous of CHORDS) {
        const { chord, choices } = createQuestion(previous.id, random)
        const counterpart = chord.quality === 'major' ? `${chord.root}m` : chord.root
        expect(chord.id).not.toBe(previous.id)
        expect(choices).toHaveLength(4)
        expect(new Set(choices).size).toBe(4)
        expect(choices.filter((choice) => choice === chord.id)).toHaveLength(1)
        expect(choices).toContain(counterpart)
        expect(choices.filter((choice) => !choice.startsWith(chord.root))).toHaveLength(2)
        expect(choices.every((choice) => CHORDS.some((item) => item.id === choice))).toBe(true)
      }
    }
  })

  it('does not fix the answer to one button position', () => {
    const positions = new Set<number>()
    for (let seed = 0; seed < 100; seed++) {
      const question = createQuestion(undefined, seededRandom(seed))
      positions.add(question.choices.indexOf(question.chord.id))
    }
    expect([...positions].sort()).toEqual([0, 1, 2, 3])
  })

  it('does not mutate the catalogue', () => {
    const before = structuredClone(CHORDS)
    createQuestion('C', seededRandom(42))
    expect(CHORDS).toEqual(before)
  })

  it.each([-0.01, 1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid random value %s explicitly', (value) => {
    expect(() => createQuestion(undefined, () => value)).toThrow(RangeError)
  })
})
