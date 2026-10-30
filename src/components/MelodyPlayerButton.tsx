import { useEffect, useRef, useState } from 'react'
import type { Melody } from '../music/melodies'
import { playMelody, type MelodyPlayback } from '../music/playMelody'

export function MelodyPlayerButton({ melody }: { melody: Melody }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'error'>('idle')
  const playback = useRef<MelodyPlayback>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const mounted = useRef(true)
  const busy = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      busy.current = false
      if (timer.current) clearTimeout(timer.current)
      playback.current?.stop()
    }
  }, [])

  async function play() {
    if (busy.current) return
    busy.current = true
    setStatus('playing')
    try {
      playback.current?.stop()
      const current = await playMelody(melody)
      if (!mounted.current) {
        current.stop()
        return
      }
      playback.current = current
      timer.current = setTimeout(() => {
        current.stop()
        if (playback.current === current) {
          playback.current = null
          busy.current = false
          setStatus('idle')
        }
      }, current.durationMs)
    } catch (error) {
      console.error('Melody playback failed.', error)
      busy.current = false
      if (mounted.current) setStatus('error')
    }
  }

  return (
    <div className="mb-5 text-center">
      <button
        type="button"
        onClick={() => void play()}
        disabled={status === 'playing'}
        className="min-h-12 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800 disabled:cursor-default disabled:bg-sky-500"
      >
        {status === 'playing' ? '再生中…' : '▶ メロディを再生'}
      </button>
      {status === 'error' && (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-800">
          メロディを再生できませんでした。ブラウザの音声設定を確認してください。
        </p>
      )}
    </div>
  )
}
