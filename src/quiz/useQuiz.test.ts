import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createQuestion } from './questions'
import { initialState, quizReducer, useQuiz } from './useQuiz'

const firstQuestion = createQuestion(undefined, () => 0)
const secondQuestion = createQuestion('C', () => 0)

describe('quiz state transitions', () => {
  it('initializes without answering anything', () => {
    expect(initialState(firstQuestion)).toEqual({
      phase: 'asking', question: firstQuestion, correct: 0, answered: 0,
    })
  })

  it('counts a correct answer once, even with queued repeated actions', () => {
    const { result } = renderHook(() => useQuiz(firstQuestion))
    act(() => {
      result.current.answer('C')
      result.current.answer('C')
      result.current.answer('Cm')
    })
    expect(result.current.state).toMatchObject({
      phase: 'answered', selected: 'C', correct: 1, answered: 1,
    })
  })

  it('keeps an incorrect answer locked', () => {
    const wrong = quizReducer(initialState(firstQuestion), { type: 'answer', choice: 'Cm' })
    expect(wrong).toMatchObject({ selected: 'Cm', correct: 0, answered: 1 })
    expect(quizReducer(wrong, { type: 'answer', choice: 'C' })).toBe(wrong)
  })

  it('rejects answers that were not displayed', () => {
    expect(() => quizReducer(initialState(firstQuestion), { type: 'answer', choice: 'B' }))
      .toThrow('The answer must be one of the displayed choices.')
  })

  it('ignores next before an answer and does not consume random values', () => {
    const random = vi.spyOn(Math, 'random')
    const { result } = renderHook(() => useQuiz(firstQuestion))
    act(() => result.current.next())
    expect(result.current.state).toEqual(initialState(firstQuestion))
    expect(random).not.toHaveBeenCalled()
  })

  it('keeps scores while clearing the selected answer for the next question', () => {
    const answered = quizReducer(initialState(firstQuestion), { type: 'answer', choice: 'C' })
    const next = quizReducer(answered, { type: 'next', question: secondQuestion })
    expect(next).toEqual({
      phase: 'asking', question: secondQuestion, correct: 1, answered: 1,
    })
    expect(quizReducer(next, { type: 'next', question: firstQuestion })).toBe(next)
  })

  it('does not skip a question on queued double next actions', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useQuiz(firstQuestion))
    act(() => result.current.answer('C'))
    act(() => {
      result.current.next()
      result.current.next()
    })
    expect(result.current.state.question.chord.id).toBe('Cm')
    expect(result.current.state).toMatchObject({ phase: 'asking', correct: 1, answered: 1 })
  })
})
