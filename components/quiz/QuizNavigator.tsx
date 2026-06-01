import type { AnswerResult } from '@/types'

interface QuizNavigatorProps {
  total: number
  current: number
  answers: (AnswerResult | null)[]
  bookmarked?: boolean[]
  onJump: (index: number) => void
}

function getButtonStyle(index: number, current: number, result: AnswerResult | null, isBookmarked: boolean): string {
  const base = 'w-9 h-9 rounded-lg text-xs font-semibold transition-all duration-100 border-2'
  if (index === current)    return `${base} border-primary-500 bg-primary-500 text-white shadow-q-sm`
  if (result === 'correct') return `${base} border-mint-500 bg-mint-50 text-mint-600 hover:bg-mint-50`
  if (result === 'wrong')   return `${base} border-coral bg-coral-light text-red-700 hover:bg-coral-light`
  if (isBookmarked)         return `${base} border-sun bg-sun-light text-sun hover:bg-sun-light`
  return `${base} border-transparent hover:border-primary-200`
}

export default function QuizNavigator({ total, current, answers, bookmarked = [], onJump }: QuizNavigatorProps) {
  const correctCount  = answers.filter((a) => a === 'correct').length
  const wrongCount    = answers.filter((a) => a === 'wrong').length
  const attemptedCount = answers.filter((a) => a !== null).length

  return (
    <div className="q-card p-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--q-ink)' }}>문제 목록</h3>

      {/* 통계 */}
      <div className="flex gap-3 mb-4 text-xs" style={{ color: 'var(--q-ink-2)' }}>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-mint-500 inline-block" />
          정답 {correctCount}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-coral inline-block" />
          오답 {wrongCount}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: 'var(--q-border)' }} />
          미풀이 {total - attemptedCount}
        </span>
      </div>

      {/* 번호 그리드 */}
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            aria-label={`${i + 1}번 문제`}
            aria-current={i === current ? 'true' : undefined}
            className={getButtonStyle(i, current, answers[i] ?? null, bookmarked[i] ?? false)}
            style={i !== current && answers[i] === null && !bookmarked[i]
              ? { backgroundColor: 'var(--q-surface-soft)', color: 'var(--q-ink-3)' }
              : undefined}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-3 pt-3 border-t text-xs space-y-1" style={{ borderColor: 'var(--q-border)', color: 'var(--q-ink-3)' }}>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-primary-500 bg-primary-500 inline-block" />
          현재 문제
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-sun bg-sun-light inline-block" />
          북마크
        </div>
      </div>
    </div>
  )
}
