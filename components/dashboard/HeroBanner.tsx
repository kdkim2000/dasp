import Link from 'next/link'
import Mascot from '@/components/ui/Mascot'

interface HeroBannerProps {
  correctPct: number
  currentChapterHref: string
  theoryHref: string
}

export default function HeroBanner({ correctPct, currentChapterHref, theoryHref }: HeroBannerProps) {
  const expression = correctPct >= 70 ? 'excited' : correctPct > 0 ? 'happy' : 'thinking'

  return (
    <div
      className="rounded-4xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #7F56D9 0%, #6941C6 60%, #53389E 100%)',
        padding: '28px 32px',
      }}
    >
      {/* Background decoration circles */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '30%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
        {/* Mascot */}
        <div className="shrink-0">
          <Mascot size={96} expression={expression} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-sm font-semibold text-purple-200 mb-1">오늘의 퀘스트</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-tight">
            {correctPct === 0
              ? 'SQLD 정복을 시작하세요!'
              : correctPct >= 80
              ? '훌륭해요! 마스터에 가까워지고 있어요'
              : 'SQL 실력을 계속 키워나가요'}
          </h1>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-purple-200">전체 정답률</span>
              <span className="text-sm font-bold text-white">{correctPct}%</span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${correctPct}%`,
                  background: 'linear-gradient(90deg, #DDD6FE, #ffffff)',
                }}
              />
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <Link
              href={currentChapterHref}
              className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-2xl transition-all"
              style={{
                background: 'rgba(255,255,255,1)',
                color: '#6941C6',
              }}
            >
              이어서 풀기 →
            </Link>
            <Link
              href={theoryHref}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              이론 복습
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
