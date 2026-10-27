export const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export type Root = (typeof ROOTS)[number]
export type Quality = 'major' | 'minor'
export type ChordId = `${Root}${'' | 'm'}`

export interface Note {
  readonly letter: Root
  readonly octave: 4 | 5
  readonly accidental: '' | '#' | 'b'
}

export interface Chord {
  readonly id: ChordId
  readonly root: Root
  readonly quality: Quality
  readonly notes: readonly [Note, Note, Note]
}

function note(letter: Root, octave: 4 | 5, accidental: Note['accidental'] = ''): Note {
  return { letter, octave, accidental }
}

function chord(root: Root, quality: Quality, notes: Chord['notes']): Chord {
  return { id: `${root}${quality === 'minor' ? 'm' : ''}`, root, quality, notes }
}

export const CHORDS: readonly Chord[] = [
  chord('C', 'major', [note('C', 4), note('E', 4), note('G', 4)]),
  chord('C', 'minor', [note('C', 4), note('E', 4, 'b'), note('G', 4)]),
  chord('D', 'major', [note('D', 4), note('F', 4, '#'), note('A', 4)]),
  chord('D', 'minor', [note('D', 4), note('F', 4), note('A', 4)]),
  chord('E', 'major', [note('E', 4), note('G', 4, '#'), note('B', 4)]),
  chord('E', 'minor', [note('E', 4), note('G', 4), note('B', 4)]),
  chord('F', 'major', [note('F', 4), note('A', 4), note('C', 5)]),
  chord('F', 'minor', [note('F', 4), note('A', 4, 'b'), note('C', 5)]),
  chord('G', 'major', [note('G', 4), note('B', 4), note('D', 5)]),
  chord('G', 'minor', [note('G', 4), note('B', 4, 'b'), note('D', 5)]),
  chord('A', 'major', [note('A', 4), note('C', 5, '#'), note('E', 5)]),
  chord('A', 'minor', [note('A', 4), note('C', 5), note('E', 5)]),
  chord('B', 'major', [note('B', 4), note('D', 5, '#'), note('F', 5, '#')]),
  chord('B', 'minor', [note('B', 4), note('D', 5), note('F', 5, '#')]),
]

export function describeNotes(notes: Chord['notes']): string {
  const accidentals = { '': '', '#': 'シャープ', b: 'フラット' }
  return notes
    .map(({ letter, accidental, octave }) => `${letter}${accidentals[accidental]}${octave}`)
    .join('、')
}
