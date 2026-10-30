import { describe, expect, it } from 'vitest'
import { MELODIES, MELODY_IDS, melodyLabel } from './melodies'

describe('classical melody catalogue', () => {
  it('contains unique labelled melodies with two complete 4/4 measures', () => {
    expect(MELODIES.map(({ id }) => id)).toEqual(MELODY_IDS)
    expect(new Set(MELODIES.map(melodyLabel)).size).toBe(MELODIES.length)
    for (const melody of MELODIES) {
      expect(melody.measures).toHaveLength(2)
      for (const measure of melody.measures) {
        expect(measure.reduce((beats, note) => beats + note.beats, 0)).toBe(4)
      }
    }
  })

  it('keeps the characteristic opening notes of each excerpt', () => {
    expect(MELODIES.map((melody) => melody.measures[0][0])).toEqual([
      { letter: 'E', accidental: '', octave: 4, beats: 1 },
      { letter: 'E', accidental: '', octave: 5, beats: 0.5 },
      { letter: 'G', accidental: '', octave: 4, beats: 1 },
      { letter: 'E', accidental: '', octave: 5, beats: 0.5 },
      { letter: 'D', accidental: '', octave: 5, beats: 1 },
      { letter: 'F', accidental: '', octave: 5, beats: 1 },
    ])
  })
})
