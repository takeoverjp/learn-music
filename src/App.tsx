import { useEffect, useRef, useState } from 'react'
import { AnswerChoices } from './components/AnswerChoices'
import { ChordStaff } from './components/ChordStaff'
import { MelodyAnswerChoices } from './components/MelodyAnswerChoices'
import { MelodyPlayerButton } from './components/MelodyPlayerButton'
import { MelodyStaff } from './components/MelodyStaff'
import { QuizErrorBoundary } from './components/QuizErrorBoundary'
import { melodyLabel } from './music/melodies'
import type { MelodyQuestion } from './quiz/melodyQuestions'
import type { Question } from './quiz/questions'
import { useMelodyQuiz } from './quiz/useMelodyQuiz'
import { useQuiz } from './quiz/useQuiz'

type QuizMode = 'chords' | 'melodies'

function Score({ correct, answered }: { correct: number; answered: number }) {
  return (
    <div aria-label="成績" className="mt-5 flex justify-center gap-8 text-sm">
      <p>正解数 <strong className="ml-1 text-lg text-teal-900">{correct}</strong></p>
      <p>回答数 <strong className="ml-1 text-lg">{answered}</strong></p>
    </div>
  )
}

function ChordQuiz({
  quiz,
}: {
  quiz: ReturnType<typeof useQuiz>
}) {
  const { state, answer, next } = quiz
  const title = useRef<HTMLHeadingElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const answered = state.phase === 'answered'
  const correct = answered && state.selected === state.question.chord.id

  useEffect(() => {
    if (state.phase === 'answered') nextButton.current?.focus()
    else title.current?.focus()
  }, [state.phase])

  return (
    <>
      <section aria-labelledby="question-title" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 id="question-title" ref={title} tabIndex={-1} className="rounded text-lg font-bold">
            このコードは？
          </h2>
          <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
            第{state.answered + (answered ? 0 : 1)}問
          </span>
        </div>
        <p className="text-xs text-slate-500">ト音記号 · 基本形 · メジャー / マイナー</p>
        <ChordStaff chord={state.question.chord} />
        <AnswerChoices state={state} onAnswer={answer} />

        <div role="status" aria-live="polite" aria-atomic="true" className="mt-5">
          {answered && (
            <div className={`rounded-xl p-4 ${correct ? 'bg-teal-50 text-teal-950' : 'bg-rose-50 text-rose-950'}`}>
              <p className="font-bold">{correct ? '正解！' : '不正解'}</p>
              <p className="mt-1 text-sm">正解のコード名：<strong className="text-lg">{state.question.chord.id}</strong></p>
            </div>
          )}
        </div>
        {answered ? (
          <button
            type="button"
            ref={nextButton}
            onClick={next}
            className="mt-4 min-h-12 w-full rounded-xl bg-teal-800 px-4 py-3 font-bold text-white hover:bg-teal-900"
          >
            次の問題
          </button>
        ) : (
          <p className="text-center text-xs text-slate-500">選ぶとすぐに答えがわかります</p>
        )}
      </section>

      <Score correct={state.correct} answered={state.answered} />
      <footer className="mt-6 text-center text-xs leading-relaxed text-slate-600">
        C・D・E・F・G・A・B の14コードを練習<br />
        成績は保存されません。自分のペースでどうぞ。
      </footer>
    </>
  )
}

function MelodyQuiz({
  quiz,
}: {
  quiz: ReturnType<typeof useMelodyQuiz>
}) {
  const { state, answer, next } = quiz
  const title = useRef<HTMLHeadingElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const answered = state.phase === 'answered'
  const correct = answered && state.selected === state.question.melody.id
  const answerLabel = melodyLabel(state.question.melody)

  useEffect(() => {
    if (state.phase === 'answered') nextButton.current?.focus()
    else title.current?.focus()
  }, [state.phase])

  return (
    <>
      <section aria-labelledby="melody-question-title" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 id="melody-question-title" ref={title} tabIndex={-1} className="rounded text-lg font-bold">
            この曲は？
          </h2>
          <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
            第{state.answered + (answered ? 0 : 1)}問
          </span>
        </div>
        <p className="text-xs text-slate-500">ト音記号 · 2小節 · 再生できます</p>
        <MelodyStaff melody={state.question.melody} />
        <MelodyPlayerButton key={state.question.melody.id} melody={state.question.melody} />
        <MelodyAnswerChoices state={state} onAnswer={answer} />

        <div role="status" aria-live="polite" aria-atomic="true" className="mt-5">
          {answered && (
            <div className={`rounded-xl p-4 ${correct ? 'bg-teal-50 text-teal-950' : 'bg-rose-50 text-rose-950'}`}>
              <p className="font-bold">{correct ? '正解！' : '不正解'}</p>
              <p className="mt-1 text-sm">正解：<strong>{answerLabel}</strong></p>
            </div>
          )}
        </div>
        {answered ? (
          <button
            type="button"
            ref={nextButton}
            onClick={next}
            className="mt-4 min-h-12 w-full rounded-xl bg-teal-800 px-4 py-3 font-bold text-white hover:bg-teal-900"
          >
            次の問題
          </button>
        ) : (
          <p className="text-center text-xs text-slate-500">楽譜を見たり、音を聴いたりして選びましょう</p>
        )}
      </section>

      <Score correct={state.correct} answered={state.answered} />
      <footer className="mt-6 text-center text-xs leading-relaxed text-slate-600">
        パブリックドメインのクラシック名曲6曲から出題<br />
        成績は保存されません。自分のペースでどうぞ。
      </footer>
    </>
  )
}

function Quiz({
  initialQuestion,
  initialMelodyQuestion,
}: {
  initialQuestion: Question
  initialMelodyQuestion: MelodyQuestion
}) {
  const [mode, setMode] = useState<QuizMode>('chords')
  const chordQuiz = useQuiz(initialQuestion)
  const melodyQuiz = useMelodyQuiz(initialMelodyQuestion)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6 sm:py-10">
      <header className="mb-5">
        <p className="text-xs font-bold tracking-widest text-teal-800">LEARN MUSIC</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">音楽クイズ</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          楽譜を読んで、コードやクラシックの名曲を当てよう。
        </p>
        <nav aria-label="クイズの種類" className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-200 p-1">
          <button
            type="button"
            aria-current={mode === 'chords' ? 'page' : undefined}
            onClick={() => setMode('chords')}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-bold ${
              mode === 'chords' ? 'bg-white text-teal-900 shadow-sm' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            コード
          </button>
          <button
            type="button"
            aria-current={mode === 'melodies' ? 'page' : undefined}
            onClick={() => setMode('melodies')}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-bold ${
              mode === 'melodies' ? 'bg-white text-teal-900 shadow-sm' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            名曲メロディ
          </button>
        </nav>
      </header>

      {mode === 'chords'
        ? <ChordQuiz quiz={chordQuiz} />
        : <MelodyQuiz quiz={melodyQuiz} />}
    </main>
  )
}

export default function App({
  initialQuestion,
  initialMelodyQuestion,
}: {
  initialQuestion: Question
  initialMelodyQuestion: MelodyQuestion
}) {
  return (
    <QuizErrorBoundary>
      <Quiz initialQuestion={initialQuestion} initialMelodyQuestion={initialMelodyQuestion} />
    </QuizErrorBoundary>
  )
}
