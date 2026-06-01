import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Question, AnswerResult } from '@/types'

interface AnswerFeedbackProps {
  question: Question
  result: AnswerResult
  selectedOption: number
  onNext: () => void
  isBookmarked: boolean
  onToggleBookmark: () => void
  isLast?: boolean
}

export default function AnswerFeedback({
  question,
  result,
  selectedOption,
  onNext,
  isBookmarked,
  onToggleBookmark,
  isLast = false,
}: AnswerFeedbackProps) {
  const isCorrect = result === 'correct'

  return (
    <div
      className={`rounded-xl border-2 p-5 mt-4 ${
        isCorrect
          ? 'border-green-400 bg-green-50'
          : 'border-red-400 bg-red-50'
      }`}
    >
      {/* 정답/오답 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
          >
            {isCorrect ? '✓ 정답입니다!' : '✗ 오답입니다'}
          </span>
          {!isCorrect && (
            <span className="text-sm text-gray-600">
              (정답: {question.answer}번 - {question.options[question.answer - 1]})
            </span>
          )}
        </div>

        <button
          onClick={onToggleBookmark}
          aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
          className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            isBookmarked
              ? 'border-yellow-400 bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'border-gray-300 bg-white text-gray-500 hover:border-yellow-400 hover:text-yellow-600'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
          {isBookmarked ? '북마크 해제' : '북마크'}
        </button>
      </div>

      {/* 선택한 보기 (오답일 때) */}
      {!isCorrect && (
        <p className="text-sm text-red-600 mb-2">
          내 선택: {selectedOption}번 - {question.options[selectedOption - 1]}
        </p>
      )}

      {/* 해설 */}
      <div className="mt-2 pt-3 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          해설
        </p>
        <div className="prose-quiz text-sm text-gray-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {question.explanation}
          </ReactMarkdown>
        </div>
      </div>

      {/* 다음 문제 버튼 */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onNext}
          className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
            isLast
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLast ? '결과 보기' : '다음 문제'}
        </button>
      </div>
    </div>
  )
}
