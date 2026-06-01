import { useEffect, useRef, useState } from 'react'

interface ExamTimerProps {
  totalSeconds: number
  onTimeUp: () => void
}

export default function ExamTimer({ totalSeconds, onTimeUp }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onTimeUpRef = useRef(onTimeUp)
  const calledRef = useRef(false)

  // onTimeUp이 바뀌어도 최신 함수를 참조
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    if (remaining <= 0) {
      if (!calledRef.current) {
        calledRef.current = true
        onTimeUpRef.current()
      }
      return
    }

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          if (!calledRef.current) {
            calledRef.current = true
            onTimeUpRef.current()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
    // remaining을 의존성에서 제외: 최초 마운트 시 한 번만 인터벌 시작
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const isWarning = remaining <= 600 // 10분 이하
  const isCritical = remaining <= 60  // 1분 이하

  const colorClass = isCritical
    ? 'text-red-600 animate-pulse'
    : isWarning
    ? 'text-red-500'
    : 'text-gray-800'

  const bgClass = isCritical
    ? 'bg-red-100 border-red-400'
    : isWarning
    ? 'bg-orange-50 border-orange-300'
    : 'bg-white border-gray-200'

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${bgClass}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={`w-4 h-4 ${colorClass}`}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className={`font-mono text-lg font-bold tabular-nums ${colorClass}`}>
        {timeStr}
      </span>
      {isWarning && (
        <span className={`text-xs font-medium ${colorClass}`}>
          {isCritical ? '시간 부족!' : '10분 이하'}
        </span>
      )}
    </div>
  )
}
