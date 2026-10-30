import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { prepareNotation } from './components/ChordStaff'
import { ErrorNotice } from './components/QuizErrorBoundary'
import { createMelodyQuestion } from './quiz/melodyQuestions'
import { createQuestion } from './quiz/questions'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('The application root is missing.')
const root = createRoot(container)
root.render(<p role="status" className="p-8 text-center">楽譜を読み込んでいます…</p>)

try {
  await prepareNotation()
  const initialQuestion = createQuestion()
  const initialMelodyQuestion = createMelodyQuestion()
  root.render(
    <StrictMode>
      <App initialQuestion={initialQuestion} initialMelodyQuestion={initialMelodyQuestion} />
    </StrictMode>,
  )
} catch (error) {
  console.error('Quiz initialization failed.', error)
  root.render(<ErrorNotice />)
}
