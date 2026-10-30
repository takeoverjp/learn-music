import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createMelodyQuestion } from './melodyQuestions'
import { initialMelodyState, melodyQuizReducer, useMelodyQuiz } from './useMelodyQuiz'

const firstQuestion = createMelodyQuestion(undefined, () => 0)
const secondQuestion = createMelodyQuestion('ode-to-joy', () => 0)

describe('melody quiz state transitions', () => {
  it('counts an answer once and locks the question', () => {
    const { result } = renderHook(() => useMelodyQuiz(firstQuestion))
    act(() => {
      result.current.answer('ode-to-joy')
      result.current.answer('fur-elise')
    })
    expect(result.current.state).toMatchObject({
      phase: 'answered',
      selected: 'ode-to-joy',
      correct: 1,
      answered: 1,
    })
  })

  it('rejects an answer that was not displayed', () => {
    expect(() => melodyQuizReducer(initialMelodyState(firstQuestion), {
      type: 'answer',
      choice: 'canon-in-d',
    })).toThrow('The answer must be one of the displayed choices.')
  })

  it('keeps scores and excludes the previous melody on next', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useMelodyQuiz(firstQuestion))
    act(() => result.current.answer('ode-to-joy'))
    act(() => result.current.next())
    expect(result.current.state).toMatchObject({
      phase: 'asking',
      correct: 1,
      answered: 1,
    })
    expect(result.current.state.question.melody.id).toBe(secondQuestion.melody.id)
  })
})
