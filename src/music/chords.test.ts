import { describe, expect, it } from 'vitest'
import { CHORDS, describeNotes, type Note } from './chords'

const expected = [
  ['C', 'C4 E4 G4'],
  ['Cm', 'C4 Eb4 G4'],
  ['D', 'D4 F#4 A4'],
  ['Dm', 'D4 F4 A4'],
  ['E', 'E4 G#4 B4'],
  ['Em', 'E4 G4 B4'],
  ['F', 'F4 A4 C5'],
  ['Fm', 'F4 Ab4 C5'],
  ['G', 'G4 B4 D5'],
  ['Gm', 'G4 Bb4 D5'],
  ['A', 'A4 C#5 E5'],
  ['Am', 'A4 C5 E5'],
  ['B', 'B4 D#5 F#5'],
  ['Bm', 'B4 D5 F#5'],
] as const

function pitch({ letter, octave, accidental }: Note): number {
  const natural = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const alteration = { '': 0, '#': 1, b: -1 }
  return octave * 12 + natural[letter] + alteration[accidental]
}

describe('chord catalogue', () => {
  it('contains exactly the agreed fourteen distinct chord names', () => {
    expect(CHORDS.map(({ id }) => id)).toEqual(expected.map(([id]) => id))
    expect(new Set(CHORDS.map(({ id }) => id)).size).toBe(14)
  })

  it.each(expected)('%s uses the correct spelling and octaves: %s', (id, notes) => {
    const chord = CHORDS.find((item) => item.id === id)
    expect(chord).toBeDefined()
    expect(chord?.notes.map((item) => `${item.letter}${item.accidental}${item.octave}`).join(' ')).toBe(notes)
  })

  it.each(CHORDS)('$id has root position and the correct triad intervals', (chord) => {
    const [root, third, fifth] = chord.notes.map(pitch)
    if (root === undefined || third === undefined || fifth === undefined) throw new Error('Missing triad note')
    expect(third - root).toBe(chord.quality === 'major' ? 4 : 3)
    expect(fifth - root).toBe(7)
    expect(chord.notes[0]).toEqual({ letter: chord.root, octave: 4, accidental: '' })
  })

  it('describes accidentals for assistive technology without revealing the chord name', () => {
    expect(describeNotes([
      { letter: 'C', octave: 4, accidental: '' },
      { letter: 'E', octave: 4, accidental: 'b' },
      { letter: 'G', octave: 4, accidental: '#' },
    ])).toBe('C4、Eフラット4、Gシャープ4')
  })
})
