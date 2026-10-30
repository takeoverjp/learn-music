import { useReducer } from 'react'
import type { MelodyId } from '../music/melodies'
import { createMelodyQuestion, type MelodyQuestion } from './melodyQuestions'

interface Progress {
  readonly question: MelodyQuestion
  readonly correct: number
  readonly answered: number
}

export type MelodyQuizState = Progress & (
  | { readonly phase: 'asking' }
  | { readonly phase: 'answered'; readonly selected: MelodyId }
)

export type MelodyQuizAction =
  | { readonly type: 'answer'; readonly choice: MelodyId }
  | { readonly type: 'next'; readonly question: MelodyQuestion }

export function initialMelodyState(question: MelodyQuestion): MelodyQuizState {
  return { phase: 'asking', question, correct: 0, answered: 0 }
}

export function melodyQuizReducer(
  state: MelodyQuizState,
  action: MelodyQuizAction,
): MelodyQuizState {
  if (action.type === 'answer') {
    if (state.phase !== 'asking') return state
    if (!state.question.choices.includes(action.choice)) {
      throw new Error('The answer must be one of the displayed choices.')
    }
    return {
      ...state,
      phase: 'answered',
      selected: action.choice,
      correct: state.correct + Number(action.choice === state.question.melody.id),
      answered: state.answered + 1,
    }
  }
  if (state.phase !== 'answered') return state
  return {
    phase: 'asking',
    question: action.question,
    correct: state.correct,
    answered: state.answered,
  }
}

export function useMelodyQuiz(question: MelodyQuestion) {
  const [state, dispatch] = useReducer(melodyQuizReducer, question, initialMelodyState)
  return {
    state,
    answer: (choice: MelodyId) => dispatch({ type: 'answer', choice }),
    next: () => {
      if (state.phase === 'answered') {
        dispatch({
          type: 'next',
          question: createMelodyQuestion(state.question.melody.id),
        })
      }
    },
  }
}
