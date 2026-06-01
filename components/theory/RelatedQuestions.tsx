import Link from 'next/link'
import { useMemo } from 'react'
import { getQuestionsByChapter } from '@/lib/questions'

interface RelatedQuestionsProps {
  chapterId: string
  className?: string
}

const QUERYMON_TIPS = [
  '이 챕터 문제를 꼭 풀어보세요!',
  'SQL 개념을 문제로 확인해보세요.',
  '취약 개념을 집중 공략하세요!',
  '반복 풀이가 합격의 지름길!',
  '오답 노트도 꼭 확인하세요.',
]

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export default function RelatedQuestions({ chapterId, className = '' }: RelatedQuestionsProps) {
  const questions = useMemo(
    () => getQuestionsByChapter(chapterId).slice(0, 3),
    [chapterId]
  )

  const tip = useMemo(() => {
    const idx = Math.floor(Math.random() * QUERYMON_TIPS.length)
    return QUERYMON_TIPS[idx]
  }, [])

  return (
    <div className={`q-card space-y-4 ${className}`}>
      {/* Querymon 말풍선 */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ background: 'var(--q-primary)', color: '#fff' }}
        >
          Q
        </div>
        <div
          className="relative rounded-2xl rounded-tl-none px-3 py-2 text-xs leading-snug"
          style={{
            background: 'var(--q-surface-soft)',
            color: 'var(--q-ink-2)',
            border: '1px solid var(--q-border)',
          }}
        >
          {tip}
        </div>
      </div>

      {/* 섹션 제목 */}
      <p
        className="font-semibold text-xs uppercase tracking-wider"
        style={{ color: 'var(--q-ink-3)' }}
      >
        관련 문제 미리보기
      </p>

      {/* 문제 목록 */}
      {questions.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--q-ink-3)' }}>
          아직 문제가 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {questions.map((q, idx) => (
            <li
              key={q.id}
              className="flex items-start gap-2 rounded-xl p-2 text-xs"
              style={{
                background: 'var(--q-surface-soft)',
                border: '1px solid var(--q-border)',
              }}
            >
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]"
                style={{ background: 'var(--q-primary)', color: '#fff' }}
              >
                {idx + 1}
              </span>
              <span style={{ color: 'var(--q-ink-2)' }}>
                {truncate(q.content, 40)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      <Link
        href={`/quiz/chapter/${chapterId}`}
        className="block w-full text-center rounded-2xl py-2 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'var(--q-primary)', color: '#fff' }}
      >
        전체 문제 풀기
      </Link>
    </div>
  )
}
