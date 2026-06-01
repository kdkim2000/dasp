import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ProgressStore, AnswerResult, Stats } from '@/types'
import {
  loadProgress,
  saveProgress,
  markAnswer as markAnswerUtil,
  toggleBookmark as toggleBookmarkUtil,
  getStats,
  resetProgress as resetProgressUtil,
} from '@/lib/progress'

interface ProgressContextValue {
  progress: ProgressStore
  stats: Stats
  isHydrated: boolean
  markAnswer: (id: string, result: AnswerResult) => void
  toggleBookmark: (id: string) => void
  resetProgress: () => void
  isBookmarked: (id: string) => boolean
  getStreak: () => number
  getXP: () => number
  getGems: () => number
  getHearts: () => number
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressStore>({
    answers: {},
    bookmarks: [],
    lastVisited: null,
    examHistory: [],
  })
  const [stats, setStats] = useState<Stats>({
    total: 0,
    attempted: 0,
    correct: 0,
    byChapter: {},
    byPart: { 1: { total: 0, correct: 0, attempted: 0 }, 2: { total: 0, correct: 0, attempted: 0 } },
  })
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = loadProgress()
    setProgress(stored)
    setStats(getStats())
    setIsHydrated(true)
  }, [])

  const refresh = useCallback(() => {
    setProgress(loadProgress())
    setStats(getStats())
  }, [])

  const markAnswer = useCallback((id: string, result: AnswerResult) => {
    markAnswerUtil(id, result)
    refresh()
  }, [refresh])

  const toggleBookmark = useCallback((id: string) => {
    toggleBookmarkUtil(id)
    refresh()
  }, [refresh])

  const resetProgress = useCallback(() => {
    resetProgressUtil()
    refresh()
  }, [refresh])

  const isBookmarked = useCallback(
    (id: string) => progress.bookmarks.includes(id),
    [progress.bookmarks]
  )

  // UI-only 게이미피케이션 계산값
  const getStreak = useCallback(
    () => Math.max(progress.examHistory.length, stats.attempted > 0 ? 1 : 0),
    [progress.examHistory.length, stats.attempted]
  )
  const getXP = useCallback(() => stats.correct * 10, [stats.correct])
  const getGems = useCallback(() => progress.examHistory.length * 50, [progress.examHistory.length])
  const getHearts = useCallback(() => 3, [])

  return (
    <ProgressContext.Provider value={{ progress, stats, isHydrated, markAnswer, toggleBookmark, resetProgress, isBookmarked, getStreak, getXP, getGems, getHearts }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
