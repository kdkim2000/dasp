import Link from 'next/link'
import type { ChapterMeta } from '@/types'

type ChapterStatMap = Record<string, { attempted: number; correct: number }>

interface ChapterProgressProps {
  chapters: ChapterMeta[]
  chapterStats: ChapterStatMap
}

export default function ChapterProgress({ chapters, chapterStats }: ChapterProgressProps) {
  return (
    <div className="space-y-3">
      {chapters.map((ch) => {
        const s = chapterStats[ch.id] ?? { attempted: 0, correct: 0 }
        // questionCount 가 0 이면 전체 문항 수를 표시할 수 없으므로 attempted 기준으로만 표시
        const attempted = s.attempted
        const correct = s.correct
        // 진행률: 전체 문항 수를 알 수 없으므로 풀이 여부(attempted > 0)로 표시
        const hasData = attempted > 0
        const correctPct = hasData ? Math.round((correct / attempted) * 100) : 0

        return (
          <div key={ch.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    ch.part === 1
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {ch.part}과목
                </span>
                <span className="text-sm font-medium text-gray-800 truncate">{ch.title}</span>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-xs text-gray-500 ml-2">
                {hasData ? (
                  <>
                    <span>{correct}/{attempted} 정답</span>
                    <span className="font-semibold text-primary-600">{correctPct}%</span>
                  </>
                ) : (
                  <span className="text-gray-400">미풀이</span>
                )}
              </div>
            </div>

            {/* 정답률 바 */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  ch.part === 1 ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: hasData ? `${correctPct}%` : '0%' }}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href={`/theory/${ch.id}`}
                className="text-xs text-gray-500 hover:text-primary-600 underline underline-offset-2"
              >
                이론 보기
              </Link>
              <Link
                href={`/quiz/chapter/${ch.id}`}
                className="text-xs text-primary-600 hover:text-primary-800 font-semibold underline underline-offset-2"
              >
                문제 풀기
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
