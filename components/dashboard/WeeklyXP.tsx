interface WeeklyXPProps {
  totalXP: number
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function WeeklyXP({ totalXP }: WeeklyXPProps) {
  // Build 7-day labels ending today
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return {
      label: DAY_LABELS[d.getDay()],
      isToday: i === 6,
    }
  })

  // Distribute XP across 7 days (UI-only simulation)
  // Heavier weight on recent days
  const weights = [0.05, 0.08, 0.10, 0.12, 0.15, 0.20, 0.30]
  const dayXPs = weights.map((w) => Math.round(totalXP * w))

  const maxXP = Math.max(...dayXPs, 1)

  return (
    <div className="q-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold" style={{ color: 'var(--q-ink-2)' }}>
          주간 XP
        </h2>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: '#F4F3FF', color: '#6941C6' }}
        >
          총 {totalXP} XP
        </span>
      </div>

      <div className="flex items-end gap-1.5 h-24">
        {days.map((day, idx) => {
          const xp = dayXPs[idx]
          const heightPct = maxXP > 0 ? (xp / maxXP) * 100 : 0
          const minHeight = xp > 0 ? 8 : 4

          return (
            <div key={idx} className="flex flex-col items-center gap-1 flex-1">
              {/* Bar */}
              <div
                className="w-full rounded-t-md transition-all duration-700"
                style={{
                  height: `${Math.max(heightPct, minHeight)}%`,
                  background: day.isToday
                    ? 'linear-gradient(180deg, #A78BFA, #7F56D9)'
                    : '#DDD6FE',
                  minHeight: minHeight,
                  alignSelf: 'flex-end',
                }}
                title={`${day.label}: ${xp} XP`}
              />
              {/* Label */}
              <span
                className="text-xs"
                style={{
                  color: day.isToday ? '#7F56D9' : 'var(--q-ink-3)',
                  fontWeight: day.isToday ? 700 : 400,
                }}
              >
                {day.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
