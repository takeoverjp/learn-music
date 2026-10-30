import { useLayoutEffect, useRef } from 'react'
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow/bravura'
import { describeMelody, type Melody, type MelodyBeats } from '../music/melodies'

const DURATIONS: Record<MelodyBeats, string> = {
  0.5: '8',
  1: 'q',
  2: 'h',
}

export function MelodyStaff({ melody }: { melody: Melody }) {
  const container = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = container.current
    if (!element) throw new Error('The notation container is unavailable.')
    element.replaceChildren()

    const renderer = new Renderer(element, Renderer.Backends.SVG)
    renderer.resize(320, 260)
    const context = renderer.getContext()

    melody.measures.forEach((measure, index) => {
      const stave = new Stave(12, 20 + index * 115, 296).addClef('treble')
      if (index === 0) stave.addTimeSignature('4/4')
      stave.setContext(context).draw()

      const notes = measure.map((item) => {
        const note = new StaveNote({
          clef: 'treble',
          keys: [`${item.letter.toLowerCase()}/${item.octave}`],
          duration: DURATIONS[item.beats],
        })
        if (item.accidental) note.addModifier(new Accidental(item.accidental), 0)
        return note
      })
      const voice = new Voice({ numBeats: 4, beatValue: 4 }).addTickables(notes)
      new Formatter().joinVoices([voice]).formatToStave([voice], stave)
      voice.draw(context, stave)
    })

    const svg = element.querySelector('svg')
    if (!svg) throw new Error('The notation renderer did not create an SVG.')
    svg.setAttribute('viewBox', '0 0 320 260')
    svg.style.removeProperty('width')
    svg.style.removeProperty('height')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('focusable', 'false')
    return () => element.replaceChildren()
  }, [melody])

  return (
    <div
      role="img"
      aria-label={`ト音記号の2小節のメロディ。音は ${describeMelody(melody)}。`}
      className="staff mx-auto w-full max-w-sm rounded-2xl bg-white"
      ref={container}
    />
  )
}
