import Mascot from '@/components/ui/Mascot'

const TIPS = [
  'JOIN을 마스터하면 강해져요!',
  '인덱스 원리를 이해하면 최적화가 보여요.',
  'NULL 처리에 주의하세요. 함정이 숨어있어요!',
  'GROUP BY와 HAVING의 차이를 기억하세요.',
  '서브쿼리 vs JOIN, 상황에 따라 선택해요.',
]

interface MascotCardProps {
  xp: number
}

export default function MascotCard({ xp }: MascotCardProps) {
  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100
  const xpToNext = 100
  const xpPct = Math.min((xpInLevel / xpToNext) * 100, 100)

  // Pick a tip deterministically based on level
  const tip = TIPS[(level - 1) % TIPS.length]

  const expression = xp === 0 ? 'thinking' : xpPct > 70 ? 'excited' : 'happy'

  return (
    <div className="q-card">
      <div className="flex items-start gap-4">
        {/* Mascot */}
        <div className="shrink-0">
          <Mascot size={72} expression={expression} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: '#F4F3FF',
                color: '#6941C6',
                border: '1px solid #DDD6FE',
              }}
            >
              Lv.{level}
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--q-ink)' }}>
              Querymon
            </span>
          </div>

          <p
            className="text-xs mb-3 leading-relaxed"
            style={{ color: 'var(--q-ink-2)' }}
          >
            &ldquo;{tip}&rdquo;
          </p>

          {/* XP bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--q-ink-3)' }}>
                XP
              </span>
              <span className="text-xs font-bold" style={{ color: '#7F56D9' }}>
                {xpInLevel} / {xpToNext}
              </span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{ background: '#EDE9FE' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${xpPct}%`,
                  background: 'linear-gradient(90deg, #A78BFA, #7F56D9)',
                }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--q-ink-3)' }}>
              총 {xp} XP 획득
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
