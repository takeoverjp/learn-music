import { MELODIES, melodyLabel, type MelodyId } from '../music/melodies'
import type { MelodyQuizState } from '../quiz/useMelodyQuiz'

const LABELS = new Map(MELODIES.map((melody) => [melody.id, melodyLabel(melody)]))

export function MelodyAnswerChoices({
  state,
  onAnswer,
}: {
  state: MelodyQuizState
  onAnswer: (choice: MelodyId) => void
}) {
  return (
    <fieldset className="min-w-0" disabled={state.phase === 'answered'}>
      <legend className="mb-3 text-sm font-medium text-slate-600">曲名を選んでください</legend>
      <div className="grid gap-3">
        {state.question.choices.map((choice) => {
          const revealed = state.phase === 'answered'
          const correct = revealed && choice === state.question.melody.id
          const selected = revealed && choice === state.selected
          const label = LABELS.get(choice)
          if (!label) throw new Error(`Missing melody label: ${choice}`)
          return (
            <button
              key={choice}
              type="button"
              onClick={() => onAnswer(choice)}
              className={`min-h-14 rounded-xl border-2 px-3 py-3 text-left font-bold transition-colors disabled:cursor-default ${
                correct
                  ? 'border-teal-700 bg-teal-50 text-teal-900'
                  : selected
                    ? 'border-rose-700 bg-rose-50 text-rose-900'
                    : 'border-slate-200 bg-white text-slate-800 enabled:hover:border-teal-600 enabled:hover:bg-teal-50'
              }`}
              aria-label={label}
            >
              {label}
              {correct && <span className="ml-2 text-xs font-medium" aria-hidden="true">正解</span>}
              {selected && !correct && <span className="ml-2 text-xs font-medium" aria-hidden="true">選択</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
