import { useLayoutEffect, useRef } from 'react'
import { Accidental, Formatter, Renderer, Stave, StaveNote } from 'vexflow/bravura'
import { describeNotes, type Chord } from '../music/chords'

export async function prepareNotation(): Promise<void> {
  const faces = await Promise.all([
    document.fonts.load('40px Bravura'),
    document.fonts.load('16px Academico'),
  ])
  if (faces.some((family) => family.length === 0 || family.some((face) => face.status !== 'loaded'))) {
    throw new Error('The bundled music fonts could not be loaded.')
  }
}

export function ChordStaff({ chord }: { chord: Chord }) {
  const container = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = container.current
    if (!element) throw new Error('The notation container is unavailable.')
    element.replaceChildren()

    const renderer = new Renderer(element, Renderer.Backends.SVG)
    renderer.resize(320, 180)
    const context = renderer.getContext()
    const stave = new Stave(12, 35, 296).addClef('treble')
    stave.setContext(context).draw()
    const note = new StaveNote({
      clef: 'treble',
      keys: chord.notes.map(({ letter, octave }) => `${letter.toLowerCase()}/${octave}`),
      duration: 'w',
      alignCenter: true,
    })
    chord.notes.forEach(({ accidental }, index) => {
      if (accidental) note.addModifier(new Accidental(accidental), index)
    })
    Formatter.FormatAndDraw(context, stave, [note])
    const svg = element.querySelector('svg')
    if (!svg) throw new Error('The notation renderer did not create an SVG.')
    svg.setAttribute('viewBox', '0 0 320 180')
    // VexFlow's inline dimensions would override the responsive stylesheet.
    svg.style.removeProperty('width')
    svg.style.removeProperty('height')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('focusable', 'false')
    return () => element.replaceChildren()
  }, [chord])

  return (
    <div
      role="img"
      aria-label={`ト音記号の五線譜。下から ${describeNotes(chord.notes)}。`}
      className="staff mx-auto w-full max-w-sm rounded-2xl bg-white"
      ref={container}
    />
  )
}
