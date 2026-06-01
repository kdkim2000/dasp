import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="max-w-xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-xl">
          <h1 className="text-lg font-bold text-red-800 mb-2">오류가 발생했어요</h1>
          <p className="text-sm text-red-700 mb-4">
            페이지 렌더링 중 문제가 발생했습니다. 새로고침해도 같은 화면이 보이면 학습 데이터를 초기화해 보세요.
          </p>
          <pre className="text-xs text-red-900 bg-white border border-red-100 rounded p-3 overflow-x-auto whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button
            onClick={this.reset}
            className="mt-4 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
