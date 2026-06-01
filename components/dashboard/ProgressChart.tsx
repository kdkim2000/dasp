interface ProgressChartProps {
  correct: number
  total: number
  size?: number
}

export default function ProgressChart({ correct, total, size = 120 }: ProgressChartProps) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 absolute inset-0"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#3b82f6"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* 중앙 텍스트 (SVG rotate 영향 없음) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-primary-600 leading-none">{pct}%</span>
          <span className="text-xs text-gray-500 mt-0.5">정답률</span>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        {correct} / {total} 문항
      </p>
    </div>
  )
}
