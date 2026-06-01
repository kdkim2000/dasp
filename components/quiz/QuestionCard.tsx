import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Question, AnswerResult, QuestionType } from '@/types'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedOption: number | null
  showResult: boolean
  onAnswer: (result: AnswerResult, selectedIndex: number) => void
  isBookmarked: boolean
  onToggleBookmark: () => void
}

const DIFFICULTY_LABEL: Record<string, string> = { '하': '쉬움', '중': '보통', '상': '어려움' }
const DIFFICULTY_COLOR: Record<string, string> = {
  '하': 'bg-mint-50 text-mint-600',
  '중': 'bg-sun-light text-sun',
  '상': 'bg-coral-light text-coral',
}

const TYPE_LABEL: Record<QuestionType, string> = {
  concept:    '개념',
  result:     'SQL결과',
  completion: '구문완성',
  error:      '오류탐색',
}
const TYPE_COLOR: Record<QuestionType, string> = {
  concept:    'bg-primary-50 text-primary-700',
  result:     'bg-blue-50 text-blue-700',
  completion: 'bg-amber-50 text-amber-700',
  error:      'bg-red-50 text-red-600',
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  showResult,
  onAnswer,
  isBookmarked,
  onToggleBookmark,
}: QuestionCardProps) {
  useEffect(() => {
    if (showResult) return
    const handleKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 4) handleSelect(num)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, question.id])

  function handleSelect(optionIndex: number) {
    if (showResult) return
    const result: AnswerResult = optionIndex === question.answer ? 'correct' : 'wrong'
    onAnswer(result, optionIndex)
  }

  function getOptionStyle(optionIndex: number): string {
    const base = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 text-sm leading-relaxed'
    if (!showResult) {
      if (selectedOption === optionIndex)
        return `${base} border-primary-500 bg-primary-50 text-primary-900`
      return `${base} border-transparent hover:border-primary-200 hover:bg-primary-50 cursor-pointer`
    }
    if (optionIndex === question.answer)
      return `${base} border-mint-500 bg-mint-50 text-mint-600`
    if (selectedOption === optionIndex && optionIndex !== question.answer)
      return `${base} border-coral bg-coral-light text-red-700`
    return `${base} border-transparent opacity-50`
  }

  const difficulty = question.difficulty ?? '중'

  return (
    <div className="q-card p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700">
            {questionNumber} / {totalQuestions}
          </span>
          {question.difficulty && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[difficulty] ?? 'bg-surface-soft text-ink-muted'}`}>
              {DIFFICULTY_LABEL[difficulty] ?? difficulty}
            </span>
          )}
          {question.questionType && question.questionType !== 'concept' && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLOR[question.questionType]}`}>
              {TYPE_LABEL[question.questionType]}
            </span>
          )}
          {question.source && question.source !== 'chapter' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
              {question.source === 'mockexam1' ? '예상1회' : '예상2회'}
            </span>
          )}
          {question.tags && question.tags.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--q-surface-soft)', color: 'var(--q-ink-3)' }}>
              {question.tags[0]}
            </span>
          )}
        </div>
        <button
          onClick={onToggleBookmark}
          aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
          className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? 'text-sun' : 'hover:text-sun'}`}
          style={!isBookmarked ? { color: 'var(--q-ink-3)' } : undefined}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </div>

      {/* 문제 본문 */}
      <div className="prose-quiz font-medium mb-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {question.content}
        </ReactMarkdown>
      </div>

      {/* 선택지 */}
      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const optionIndex = idx + 1
          return (
            <button
              key={optionIndex}
              onClick={() => handleSelect(optionIndex)}
              disabled={showResult}
              className={getOptionStyle(optionIndex)}
              style={{ backgroundColor: !showResult && selectedOption !== optionIndex ? 'var(--q-surface-soft)' : undefined, color: !showResult ? 'var(--q-ink)' : undefined }}
            >
              <span className="font-semibold mr-2 text-primary-500">{optionIndex}.</span>
              {option}
              {showResult && optionIndex === question.answer && <span className="ml-2 text-mint-500 font-bold">✓</span>}
              {showResult && selectedOption === optionIndex && optionIndex !== question.answer && <span className="ml-2 text-coral font-bold">✗</span>}
            </button>
          )
        })}
      </div>

      {!showResult && (
        <p className="mt-4 text-xs text-right" style={{ color: 'var(--q-ink-3)' }}>
          키보드 1~4 키로 선택 가능
        </p>
      )}
    </div>
  )
}
