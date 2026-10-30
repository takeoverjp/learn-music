export const MELODY_IDS = [
  'ode-to-joy',
  'fur-elise',
  'eine-kleine-nachtmusik',
  'spring',
  'minuet-in-g',
  'canon-in-d',
] as const

export type MelodyId = (typeof MELODY_IDS)[number]
export type MelodyLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export type MelodyAccidental = '' | '#' | 'b'
export type MelodyBeats = 0.5 | 1 | 2

export interface MelodyNote {
  readonly letter: MelodyLetter
  readonly accidental: MelodyAccidental
  readonly octave: 4 | 5
  readonly beats: MelodyBeats
}

export interface Melody {
  readonly id: MelodyId
  readonly title: string
  readonly composer: string
  readonly tempo: number
  readonly measures: readonly [readonly MelodyNote[], readonly MelodyNote[]]
}

function note(
  letter: MelodyLetter,
  octave: MelodyNote['octave'],
  beats: MelodyBeats = 1,
  accidental: MelodyAccidental = '',
): MelodyNote {
  return { letter, accidental, octave, beats }
}

export const MELODIES: readonly Melody[] = [
  {
    id: 'ode-to-joy',
    title: '交響曲第9番「歓喜の歌」',
    composer: 'ベートーヴェン',
    tempo: 108,
    measures: [
      [note('E', 4), note('E', 4), note('F', 4), note('G', 4)],
      [note('G', 4), note('F', 4), note('E', 4), note('D', 4)],
    ],
  },
  {
    id: 'fur-elise',
    title: 'エリーゼのために',
    composer: 'ベートーヴェン',
    tempo: 84,
    measures: [
      [
        note('E', 5, 0.5), note('D', 5, 0.5, '#'), note('E', 5, 0.5), note('D', 5, 0.5, '#'),
        note('E', 5, 0.5), note('B', 4, 0.5), note('D', 5, 0.5), note('C', 5, 0.5),
      ],
      [note('A', 4), note('C', 4), note('E', 4), note('A', 4)],
    ],
  },
  {
    id: 'eine-kleine-nachtmusik',
    title: 'アイネ・クライネ・ナハトムジーク',
    composer: 'モーツァルト',
    tempo: 132,
    measures: [
      [note('G', 4), note('D', 5), note('G', 5), note('D', 5)],
      [note('G', 5), note('B', 5), note('D', 5), note('C', 5)],
    ],
  },
  {
    id: 'spring',
    title: '「四季」より 春',
    composer: 'ヴィヴァルディ',
    tempo: 116,
    measures: [
      [
        note('E', 5, 0.5), note('E', 5, 0.5), note('E', 5, 0.5), note('F', 5, 0.5, '#'),
        note('G', 5, 0.5, '#'), note('G', 5, 0.5, '#'), note('F', 5, 0.5, '#'), note('E', 5, 0.5),
      ],
      [
        note('D', 5, 0.5, '#'), note('D', 5, 0.5, '#'), note('C', 5, 0.5, '#'), note('B', 4, 0.5),
        note('E', 5), note('E', 5),
      ],
    ],
  },
  {
    id: 'minuet-in-g',
    title: 'メヌエット ト長調',
    composer: 'ペツォールト',
    tempo: 104,
    measures: [
      [
        note('D', 5), note('G', 4, 0.5), note('A', 4, 0.5),
        note('B', 4, 0.5), note('C', 5, 0.5), note('D', 5),
      ],
      [note('G', 4), note('G', 4), note('E', 5), note('C', 5)],
    ],
  },
  {
    id: 'canon-in-d',
    title: 'カノン',
    composer: 'パッヘルベル',
    tempo: 92,
    measures: [
      [note('F', 5), note('E', 5), note('D', 5), note('C', 5, 1, '#')],
      [note('B', 4), note('A', 4), note('B', 4), note('C', 5, 1, '#')],
    ],
  },
]

export function melodyLabel(melody: Melody): string {
  return `${melody.title}（${melody.composer}）`
}

export function describeMelody(melody: Melody): string {
  const accidentals = { '': '', '#': 'シャープ', b: 'フラット' }
  return melody.measures
    .flat()
    .map(({ letter, accidental, octave }) => `${letter}${accidentals[accidental]}${octave}`)
    .join('、')
}
