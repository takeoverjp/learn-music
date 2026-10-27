import { StrictMode } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ChordStaff } from './components/ChordStaff'
import { createQuestion } from './quiz/questions'

// jsdom cannot measure SVG text; real notation is covered in Playwright.
vi.mock('./components/ChordStaff', () => ({ ChordStaff: vi.fn() }))

beforeEach(() => {
  vi.mocked(ChordStaff).mockImplementation(() => <div role="img" aria-label="楽譜" />)
})

function mountQuiz() {
  return render(<StrictMode><App initialQuestion={createQuestion(undefined, () => 0)} /></StrictMode>)
}

function expectScores(correct: number, answered: number) {
  const scores = within(screen.getByLabelText('成績'))
  expect(scores.getByText(/^正解数/)).toHaveTextContent(`正解数 ${correct}`)
  expect(scores.getByText(/^回答数/)).toHaveTextContent(`回答数 ${answered}`)
}

describe('quiz interaction', () => {
  it('shows notation and four enabled choices with no answer revealed', () => {
    mountQuiz()
    expect(screen.getByRole('img', { name: '楽譜' })).toBeInTheDocument()
    const choices = within(screen.getByRole('group')).getAllByRole('button')
    expect(choices).toHaveLength(4)
    choices.forEach((choice) => expect(choice).toBeEnabled())
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.queryByRole('button', { name: '次の問題' })).not.toBeInTheDocument()
    expectScores(0, 0)
  })

  it('immediately confirms a correct answer, updates scores and focuses next', async () => {
    const user = userEvent.setup()
    mountQuiz()
    await user.click(screen.getByRole('button', { name: 'C' }))
    expect(screen.getByRole('status')).toHaveTextContent('正解！')
    expect(screen.getByRole('status')).toHaveTextContent('正解のコード名：C')
    expect(screen.getByRole('button', { name: '次の問題' })).toHaveFocus()
    expectScores(1, 1)
  })

  it('shows the correct chord after an incorrect answer', async () => {
    const user = userEvent.setup()
    mountQuiz()
    await user.click(screen.getByRole('button', { name: 'Cm' }))
    expect(screen.getByRole('status')).toHaveTextContent('不正解')
    expect(screen.getByRole('status')).toHaveTextContent('正解のコード名：C')
    expectScores(0, 1)
  })

  it('disables every choice and prevents changing the answer', async () => {
    const user = userEvent.setup()
    mountQuiz()
    await user.click(screen.getByRole('button', { name: 'Cm' }))
    within(screen.getByRole('group')).getAllByRole('button').forEach((choice) => expect(choice).toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: 'C' }))
    expect(screen.getByRole('status')).toHaveTextContent('不正解')
    expectScores(0, 1)
  })

  it('does not advance until the user confirms the result', async () => {
    const user = userEvent.setup()
    mountQuiz()
    await user.click(screen.getByRole('button', { name: 'C' }))
    expect(screen.getByText('第1問')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('正解のコード名：C')
  })

  it('clears the result and moves focus to the next question', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    mountQuiz()
    await user.click(screen.getByRole('button', { name: 'C' }))
    await user.click(screen.getByRole('button', { name: '次の問題' }))
    expect(screen.getByText('第2問')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByRole('heading', { name: 'このコードは？' })).toHaveFocus()
    within(screen.getByRole('group')).getAllByRole('button').forEach((choice) => expect(choice).toBeEnabled())
    expectScores(1, 1)
    await user.click(screen.getByRole('button', { name: 'Cm' }))
    expect(screen.getByRole('status')).toHaveTextContent('正解！')
    expectScores(2, 2)
  })

  it('supports an entire answer and next cycle using the keyboard', async () => {
    const user = userEvent.setup()
    mountQuiz()
    await user.tab()
    expect(screen.getByRole('button', { name: 'C' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: '次の問題' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'このコードは？' })).toHaveFocus()
    expect(screen.getByText('第2問')).toBeInTheDocument()
  })

  it('starts fresh when the application is mounted again', async () => {
    const user = userEvent.setup()
    const app = mountQuiz()
    await user.click(screen.getByRole('button', { name: 'C' }))
    app.unmount()
    mountQuiz()
    expectScores(0, 0)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('announces results through a polite, atomic live region', async () => {
    const user = userEvent.setup()
    mountQuiz()
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true')
    await user.click(screen.getByRole('button', { name: 'Cm' }))
    expect(screen.getByRole('status')).toHaveTextContent('不正解')
  })

  it('reports notation rendering failures explicitly and removes answer controls', () => {
    const logging = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(ChordStaff).mockImplementation(() => { throw new Error('Notation failed') })
    mountQuiz()
    expect(screen.getByRole('alert')).toHaveTextContent('クイズを表示できませんでした')
    expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(logging).toHaveBeenCalledWith(
      'Quiz rendering failed.', expect.any(Error), expect.any(String),
    )
  })
})
