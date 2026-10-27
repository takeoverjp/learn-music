import { useReducer } from 'react'
import type { ChordId } from '../music/chords'
import { createQuestion, type Question } from './questions'

interface Progress {
  readonly question: Question
  readonly correct: number
  readonly answered: number
}

export type QuizState = Progress & (
  | { readonly phase: 'asking' }
  | { readonly phase: 'answered'; readonly selected: ChordId }
)

export type QuizAction =
  | { readonly type: 'answer'; readonly choice: ChordId }
  | { readonly type: 'next'; readonly question: Question }

export function initialState(question: Question): QuizState {
  return { phase: 'asking', question, correct: 0, answered: 0 }
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  if (action.type === 'answer') {
    if (state.phase !== 'asking') return state
    if (!state.question.choices.includes(action.choice)) {
      throw new Error('The answer must be one of the displayed choices.')
    }
    return {
      ...state,
      phase: 'answered',
      selected: action.choice,
      correct: state.correct + Number(action.choice === state.question.chord.id),
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

export function useQuiz(question: Question) {
  const [state, dispatch] = useReducer(quizReducer, question, initialState)
  return {
    state,
    answer: (choice: ChordId) => dispatch({ type: 'answer', choice }),
    next: () => {
      if (state.phase === 'answered') {
        dispatch({ type: 'next', question: createQuestion(state.question.chord.id) })
      }
    },
  }
}
