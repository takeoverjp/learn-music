import { Component, type ErrorInfo, type ReactNode } from 'react'

export function ErrorNotice() {
  return (
    <main className="mx-auto max-w-lg p-6">
      <div role="alert" className="rounded-2xl border border-rose-300 bg-white p-6">
        <h1 className="text-xl font-bold">クイズを表示できませんでした</h1>
        <p className="mt-3">楽譜の読み込みまたは描画に失敗しました。ページを再読み込みしてください。</p>
        <button
          type="button"
          className="mt-5 min-h-12 rounded-xl bg-teal-800 px-5 py-3 font-bold text-white"
          onClick={() => window.location.reload()}
        >
          再読み込み
        </button>
      </div>
    </main>
  )
}

export class QuizErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Quiz rendering failed.', error, info.componentStack)
  }

  render() {
    return this.state.failed ? <ErrorNotice /> : this.props.children
  }
}
