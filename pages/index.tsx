import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useProgress } from '@/context/ProgressContext'
import type { Stats } from '@/types'
import { CHAPTERS, CHAPTER_ID_PREFIX } from '@/lib/chapters'

// Dashboard components
import HeroBanner from '@/components/dashboard/HeroBanner'
import LearningPath from '@/components/dashboard/LearningPath'
import MascotCard from '@/components/dashboard/MascotCard'
import WeeklyXP from '@/components/dashboard/WeeklyXP'
import ChapterProgress from '@/components/dashboard/ChapterProgress'
import WeakChapters from '@/components/dashboard/WeakChapters'
import Badge from '@/components/ui/Badge'

// SSR-safe initial stats
const INITIAL_STATS: Stats = {
  total: 0,
  attempted: 0,
  correct: 0,
  byChapter: {},
  byPart: { 1: { total: 0, correct: 0, attempted: 0 }, 2: { total: 0, correct: 0, attempted: 0 } },
}

/** Compute per-chapter stats from raw answers using ID prefixes */
function computeChapterStats(
  answers: Record<string, string>
): Record<string, { attempted: number; correct: number }> {
  const result: Record<string, { attempted: number; correct: number }> = {}
  for (const chapterId of Object.keys(CHAPTER_ID_PREFIX)) {
    result[chapterId] = { attempted: 0, correct: 0 }
  }
  for (const [qId, verdict] of Object.entries(answers)) {
    if (verdict === 'skipped') continue
    for (const [chapterId, prefix] of Object.entries(CHAPTER_ID_PREFIX)) {
      if (qId.startsWith(prefix)) {
        result[chapterId].attempted++
        if (verdict === 'correct') result[chapterId].correct++
        break
      }
    }
  }
  return result
}

/** Find the first chapter that has not been fully completed */
function findCurrentChapterId(
  chapterStats: Record<string, { attempted: number; correct: number }>
): string {
  for (const ch of CHAPTERS) {
    const s = chapterStats[ch.id] ?? { attempted: 0, correct: 0 }
    const pct = s.attempted > 0 ? (s.correct / s.attempted) * 100 : 0
    if (s.attempted < 5 || pct < 60) return ch.id
  }
  return CHAPTERS[CHAPTERS.length - 1].id
}

export default function Home() {
  const { stats, progress, getXP, getStreak, getGems, getHearts } = useProgress()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hydration guard — use empty stats until client-side
  const displayStats: Stats = mounted ? stats : INITIAL_STATS

  // Chapter stats keyed by chapter ID
  const chapterStats = useMemo(
    () => (mounted ? computeChapterStats(progress.answers) : {}),
    [mounted, progress.answers]
  )

  // Derived values
  const correctPct =
    displayStats.attempted > 0
      ? Math.round((displayStats.correct / displayStats.attempted) * 100)
      : 0

  const xp = mounted ? getXP() : 0
  const streak = mounted ? getStreak() : 0
  const gems = mounted ? getGems() : 0
  const hearts = mounted ? getHearts() : 3

  const currentChapterId = mounted ? findCurrentChapterId(chapterStats) : CHAPTERS[0].id
  const currentChapterHref = `/quiz/chapter/${currentChapterId}`
  const theoryHref = `/theory/${currentChapterId}`

  return (
    <>
      <Head>
        <title>SQLD Quest — 대시보드</title>
        <meta name="description" content="SQLD 자격증 시험 이론 학습 및 예상문제 풀이" />
      </Head>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Gamification badges row */}
        {mounted && (
          <div className="flex flex-wrap gap-2 justify-end">
            <Badge type="streak" value={streak} size="sm" />
            <Badge type="gem" value={gems} size="sm" />
            <Badge type="heart" value={hearts} size="sm" />
            <Badge type="xp" value={xp} size="sm" />
          </div>
        )}

        {/* Hero Banner */}
        <HeroBanner
          correctPct={correctPct}
          currentChapterHref={currentChapterHref}
          theoryHref={theoryHref}
        />

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Learning Path */}
            {mounted ? (
              <LearningPath chapterStats={chapterStats} />
            ) : (
              <div className="q-card h-36 animate-pulse" style={{ background: 'var(--q-surface-soft)' }} />
            )}

            {/* Chapter Progress */}
            <section className="q-card">
              <h2
                className="text-sm font-bold mb-4"
                style={{ color: 'var(--q-ink-2)' }}
              >
                챕터별 진도
              </h2>
              <ChapterProgress chapters={CHAPTERS} chapterStats={chapterStats} />
            </section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Mascot / XP card */}
            {mounted ? (
              <MascotCard xp={xp} />
            ) : (
              <div className="q-card h-36 animate-pulse" style={{ background: 'var(--q-surface-soft)' }} />
            )}

            {/* Weekly XP chart */}
            {mounted ? (
              <WeeklyXP totalXP={xp} />
            ) : (
              <div className="q-card h-40 animate-pulse" style={{ background: 'var(--q-surface-soft)' }} />
            )}

            {/* Weak chapters */}
            <section className="q-card">
              <h2
                className="text-sm font-bold mb-4"
                style={{ color: 'var(--q-ink-2)' }}
              >
                취약 챕터 TOP 3
              </h2>
              <WeakChapters chapters={CHAPTERS} chapterStats={chapterStats} />
            </section>
          </div>
        </div>

        {/* First-visit guide */}
        {mounted && displayStats.attempted === 0 && (
          <div
            className="rounded-3xl p-6"
            style={{
              background: 'linear-gradient(135deg, #F4F3FF, #EDE9FE)',
              border: '1px solid #DDD6FE',
            }}
          >
            <h2 className="text-base font-bold mb-3" style={{ color: '#53389E' }}>
              학습 가이드
            </h2>
            <ol className="space-y-2 text-sm" style={{ color: '#6941C6' }}>
              <li className="flex items-start gap-2">
                <span className="font-bold shrink-0">1.</span>
                <span>
                  <Link href="/theory/part1_ch1" className="underline underline-offset-2 font-semibold">
                    이론 학습
                  </Link>
                  으로 개념을 먼저 익히세요.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold shrink-0">2.</span>
                <span>
                  <Link href="/quiz/chapter/part1_ch1" className="underline underline-offset-2 font-semibold">
                    챕터 문제 풀기
                  </Link>
                  로 이해도를 점검하세요.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold shrink-0">3.</span>
                <span>
                  취약 챕터를 집중 학습한 뒤{' '}
                  <Link href="/quiz/exam" className="underline underline-offset-2 font-semibold">
                    모의고사
                  </Link>
                  로 실전 감각을 키우세요.
                </span>
              </li>
            </ol>
            <div className="mt-4">
              <Link
                href="/theory/part1_ch1"
                className="inline-block text-sm font-bold px-6 py-2.5 rounded-2xl text-white transition-colors"
                style={{ background: '#7F56D9' }}
              >
                지금 시작하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
