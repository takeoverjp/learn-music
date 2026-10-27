import { useEffect, useRef } from 'react'
import { AnswerChoices } from './components/AnswerChoices'
import { ChordStaff } from './components/ChordStaff'
import { QuizErrorBoundary } from './components/QuizErrorBoundary'
import type { Question } from './quiz/questions'
import { useQuiz } from './quiz/useQuiz'

function Quiz({ initialQuestion }: { initialQuestion: Question }) {
  const { state, answer, next } = useQuiz(initialQuestion)
  const title = useRef<HTMLHeadingElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const answered = state.phase === 'answered'
  const correct = answered && state.selected === state.question.chord.id

  useEffect(() => {
    if (state.phase === 'answered') nextButton.current?.focus()
    else title.current?.focus()
  }, [state.phase])

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6 sm:py-10">
      <header className="mb-5">
        <p className="text-xs font-bold tracking-widest text-teal-800">LEARN MUSIC</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">三和音クイズ</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">五線譜を読んで、コード名を当てよう。</p>
      </header>

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

      <div aria-label="成績" className="mt-5 flex justify-center gap-8 text-sm">
        <p>正解数 <strong className="ml-1 text-lg text-teal-900">{state.correct}</strong></p>
        <p>回答数 <strong className="ml-1 text-lg">{state.answered}</strong></p>
      </div>
      <footer className="mt-6 text-center text-xs leading-relaxed text-slate-600">
        C・D・E・F・G・A・B の14コードを練習<br />
        成績は保存されません。自分のペースでどうぞ。
      </footer>
    </main>
  )
}

export default function App({ initialQuestion }: { initialQuestion: Question }) {
  return <QuizErrorBoundary><Quiz initialQuestion={initialQuestion} /></QuizErrorBoundary>
}
