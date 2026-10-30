import { describe, expect, it } from 'vitest'
import { MELODIES } from '../music/melodies'
import { createMelodyQuestion } from './melodyQuestions'

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

describe('melody question generation', () => {
  it('can select every melody as an initial question', () => {
    MELODIES.forEach((melody, index) => {
      expect(createMelodyQuestion(undefined, () => (index + 0.5) / MELODIES.length).melody.id)
        .toBe(melody.id)
    })
  })

  it('creates four unique choices and excludes the previous melody', () => {
    for (let seed = 0; seed < 100; seed++) {
      const random = seededRandom(seed)
      for (const previous of MELODIES) {
        const question = createMelodyQuestion(previous.id, random)
        expect(question.melody.id).not.toBe(previous.id)
        expect(question.choices).toHaveLength(4)
        expect(new Set(question.choices).size).toBe(4)
        expect(question.choices).toContain(question.melody.id)
      }
    }
  })

  it.each([-0.01, 1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid random value %s explicitly',
    (value) => {
      expect(() => createMelodyQuestion(undefined, () => value)).toThrow(RangeError)
    },
  )
})
