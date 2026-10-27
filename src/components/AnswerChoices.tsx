import type { ChordId } from '../music/chords'
import type { QuizState } from '../quiz/useQuiz'

export function AnswerChoices({
  state,
  onAnswer,
}: {
  state: QuizState
  onAnswer: (choice: ChordId) => void
}) {
  return (
    <fieldset className="min-w-0" disabled={state.phase === 'answered'}>
      <legend className="mb-3 text-sm font-medium text-slate-600">コード名を選んでください</legend>
      <div className="grid grid-cols-2 gap-3">
        {state.question.choices.map((choice) => {
          const revealed = state.phase === 'answered'
          const correct = revealed && choice === state.question.chord.id
          const selected = revealed && choice === state.selected
          return (
            <button
              key={choice}
              type="button"
              onClick={() => onAnswer(choice)}
              className={`min-h-16 rounded-xl border-2 px-3 py-3 text-xl font-bold transition-colors disabled:cursor-default ${
                correct
                  ? 'border-teal-700 bg-teal-50 text-teal-900'
                  : selected
                    ? 'border-rose-700 bg-rose-50 text-rose-900'
                    : 'border-slate-200 bg-white text-slate-800 enabled:hover:border-teal-600 enabled:hover:bg-teal-50'
              }`}
              aria-label={choice}
            >
              {choice}
              {correct && <span className="ml-2 text-xs font-medium" aria-hidden="true">正解</span>}
              {selected && !correct && <span className="ml-2 text-xs font-medium" aria-hidden="true">選択</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
