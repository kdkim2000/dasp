import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { CHAPTERS } from '@/lib/chapters'

interface ResultData {
  correct: number
  total: number
  chapterId: string
}

function StarIcon({ delay }: { delay: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={`w-10 h-10 transition-all duration-500 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
      fill={visible ? '#FFB627' : 'none'}
      stroke="#FFB627"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  )
}

function getStarCount(pct: number): number {
  if (pct >= 80) return 3
  if (pct >= 60) return 2
  return 1
}

function getGradeLabel(pct: number): string {
  if (pct === 100) return '완벽!'
  if (pct >= 80) return '훌륭해요!'
  if (pct >= 60) return '잘했어요!'
  return '더 연습해요!'
}

export default function QuizResultPage() {
  const router = useRouter()
  const [data, setData] = useState<ResultData | null>(null)
  const [xpAnimated, setXpAnimated] = useState(false)

  useEffect(() => {
    if (!router.isReady) return

    const correct = parseInt(String(router.query.correct ?? '0'), 10)
    const total = parseInt(String(router.query.total ?? '0'), 10)
    const chapterId = String(router.query.chapterId ?? '')

    if (!isNaN(correct) && !isNaN(total) && chapterId) {
      setData({ correct, total, chapterId })
      const timer = setTimeout(() => setXpAnimated(true), 800)
      return () => clearTimeout(timer)
    }
  }, [router.isReady, router.query])

  if (!data) {
    return (
      <>
        <Head>
          <title>결과 | SQLD 합격길잡이</title>
        </Head>
        <div
          className="min-h-[calc(100vh-56px)] flex items-center justify-center"
          style={{ background: 'var(--q-bg)' }}
        >
          <p style={{ color: 'var(--q-ink-2)' }}>결과를 불러오는 중...</p>
        </div>
      </>
    )
  }

  const { correct, total, chapterId } = data
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const xp = correct * 10
  const gems = Math.floor(correct / 5) * 5
  const stars = getStarCount(pct)
  const grade = getGradeLabel(pct)

  const allChapters = CHAPTERS
  const currentIdx = allChapters.findIndex((c) => c.id === chapterId)
  const nextChapter = currentIdx >= 0 && currentIdx < allChapters.length - 1
    ? allChapters[currentIdx + 1]
    : null
  const currentChapter = currentIdx >= 0 ? allChapters[currentIdx] : null

  return (
    <>
      <Head>
        <title>퀴즈 결과 | SQLD 합격길잡이</title>
      </Head>

      {/* 배경: 퍼플 그래디언트 */}
      <div
        className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #53389E 0%, #7F56D9 50%, #9E77ED 100%)',
        }}
      >
        {/* 결과 카드 */}
        <div
          className="w-full max-w-md rounded-4xl p-8 shadow-q-lg flex flex-col items-center gap-6"
          style={{ background: 'var(--q-surface)' }}
        >
          {/* 헤더 */}
          <div className="text-center">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: 'var(--q-ink-3)' }}
            >
              {currentChapter
                ? `${currentChapter.part}과목 ${currentChapter.chapter}장`
                : '퀴즈'}
            </p>
            <h1
              className="font-display font-bold text-2xl"
              style={{ color: 'var(--q-ink)' }}
            >
              미션 완료!
            </h1>
          </div>

          {/* 별 애니메이션 */}
          <div className="flex items-center gap-3">
            <StarIcon delay={200} />
            <StarIcon delay={500} />
            {stars >= 3 ? (
              <StarIcon delay={800} />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-10 h-10 opacity-30"
                fill="none"
                stroke="#FFB627"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            )}
          </div>

          {/* 등급 라벨 */}
          <p
            className="font-display font-bold text-xl"
            style={{ color: 'var(--q-primary)' }}
          >
            {grade}
          </p>

          {/* XP / 보석 리워드 */}
          <div className="flex items-center gap-6">
            <div
              className={`flex flex-col items-center transition-all duration-700 ${
                xpAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span
                className="font-display font-bold text-3xl"
                style={{ color: 'var(--q-primary)' }}
              >
                +{xp}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--q-ink-3)' }}>
                XP
              </span>
            </div>

            <div
              className="w-px h-10"
              style={{ background: 'var(--q-border)' }}
            />

            <div
              className={`flex flex-col items-center transition-all duration-700 delay-200 ${
                xpAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span
                className="font-display font-bold text-3xl"
                style={{ color: '#12B76A' }}
              >
                +{gems}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--q-ink-3)' }}>
                보석
              </span>
            </div>
          </div>

          {/* 정답률 바 */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--q-ink-2)' }}>
              <span>정답률</span>
              <span style={{ color: 'var(--q-ink)' }}>
                {correct}/{total} ({pct}%)
              </span>
            </div>
            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: 'var(--q-border)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${pct}%`,
                  background:
                    pct >= 80
                      ? 'var(--q-mint)'
                      : pct >= 60
                      ? 'var(--q-sun)'
                      : 'var(--q-coral)',
                  transitionDelay: '300ms',
                }}
              />
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="w-full space-y-2.5">
            {nextChapter && (
              <Link
                href={`/theory/${nextChapter.id}`}
                className="block w-full text-center rounded-2xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'var(--q-primary)', color: '#fff' }}
              >
                다음 챕터: {nextChapter.title}
              </Link>
            )}

            <Link
              href={`/quiz/chapter/${chapterId}`}
              className="block w-full text-center rounded-2xl py-3 text-sm font-semibold transition-colors hover:opacity-80"
              style={{
                background: 'var(--q-surface-soft)',
                color: 'var(--q-ink-2)',
                border: '1px solid var(--q-border)',
              }}
            >
              오답 복습
            </Link>

            <Link
              href="/"
              className="block w-full text-center rounded-2xl py-3 text-sm font-semibold transition-colors hover:opacity-80"
              style={{
                color: 'var(--q-ink-3)',
              }}
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>

        {/* 하단 안내 */}
        <p className="mt-6 text-xs text-white/60">
          획득한 XP와 보석은 대시보드에서 확인하세요.
        </p>
      </div>
    </>
  )
}
