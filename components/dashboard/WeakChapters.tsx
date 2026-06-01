import Link from 'next/link'
import type { ChapterMeta } from '@/types'

type ChapterStatMap = Record<string, { attempted: number; correct: number }>

interface WeakChaptersProps {
  chapters: ChapterMeta[]
  chapterStats: ChapterStatMap
}

export default function WeakChapters({ chapters, chapterStats }: WeakChaptersProps) {
  // 시도한 챕터만 필터링 후 정답률 오름차순 정렬, 상위 3개
  const ranked = chapters
    .map((ch) => {
      const s = chapterStats[ch.id] ?? { attempted: 0, correct: 0 }
      const correctPct = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : null
      return { ch, s, correctPct }
    })
    .filter((item) => item.correctPct !== null)
    .sort((a, b) => (a.correctPct as number) - (b.correctPct as number))
    .slice(0, 3)

  if (ranked.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-3 select-none">--</div>
        <p className="text-sm font-medium">아직 풀이한 문제가 없습니다.</p>
        <p className="text-xs mt-1">문제를 풀면 취약 챕터가 자동으로 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {ranked.map(({ ch, s, correctPct }, idx) => {
        const pct = correctPct as number
        const barColor =
          pct < 40 ? 'bg-red-500' : pct < 60 ? 'bg-yellow-500' : 'bg-green-500'
        const badgeColor =
          pct < 40
            ? 'bg-red-100 text-red-700'
            : pct < 60
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-green-100 text-green-700'

        return (
          <div
            key={ch.id}
            className="flex items-center gap-3 bg-gray-50 rounded-lg border border-gray-200 p-3"
          >
            {/* 순위 번호 */}
            <span className="text-lg font-bold text-gray-300 w-6 text-center shrink-0">
              {idx + 1}
            </span>

            {/* 챕터 정보 + 바 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded ${
                    ch.part === 1 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {ch.part}과목
                </span>
                <span className="text-sm font-medium text-gray-800 truncate">{ch.title}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {s.correct} / {s.attempted} 정답
              </p>
            </div>

            {/* 정답률 배지 + 풀기 링크 */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                {pct}%
              </span>
              <Link
                href={`/quiz/chapter/${ch.id}`}
                className="text-xs text-primary-600 hover:text-primary-800 font-semibold"
              >
                풀기 →
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
