import type { Melody, MelodyNote } from './melodies'

export interface MelodyPlayback {
  readonly durationMs: number
  stop: () => void
}

const SEMITONES: Record<MelodyNote['letter'], number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

function frequency(note: MelodyNote): number {
  const accidental = note.accidental === '#' ? 1 : note.accidental === 'b' ? -1 : 0
  const midi = (note.octave + 1) * 12 + SEMITONES[note.letter] + accidental
  return 440 * 2 ** ((midi - 69) / 12)
}

export async function playMelody(melody: Melody): Promise<MelodyPlayback> {
  const context = new AudioContext()
  if (context.state === 'suspended') await context.resume()

  const secondsPerBeat = 60 / melody.tempo
  const start = context.currentTime + 0.04
  let cursor = start
  const oscillators: OscillatorNode[] = []

  for (const note of melody.measures.flat()) {
    const duration = note.beats * secondsPerBeat
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency(note), cursor)
    gain.gain.setValueAtTime(0.0001, cursor)
    gain.gain.exponentialRampToValueAtTime(0.22, cursor + Math.min(0.02, duration / 4))
    gain.gain.setValueAtTime(0.22, Math.max(cursor + 0.02, cursor + duration - 0.04))
    gain.gain.exponentialRampToValueAtTime(0.0001, cursor + duration)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(cursor)
    oscillator.stop(cursor + duration)
    oscillators.push(oscillator)
    cursor += duration
  }

  let stopped = false
  return {
    durationMs: (cursor - start) * 1000 + 80,
    stop: () => {
      if (stopped) return
      stopped = true
      const now = context.currentTime
      for (const oscillator of oscillators) {
        if (now < cursor) oscillator.stop(now)
      }
      void context.close().catch((error: unknown) => {
        console.error('Audio context cleanup failed.', error)
      })
    },
  }
}
