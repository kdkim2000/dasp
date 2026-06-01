import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadProgress,
  saveProgress,
  markAnswer,
  toggleBookmark,
  saveExamResult,
  resetProgress,
  getStats,
} from './progress'
import { getAllQuestions } from './questions'

beforeEach(() => {
  localStorage.clear()
})

describe('progress: localStorage round-trip', () => {
  it('loads default when storage is empty', () => {
    const p = loadProgress()
    expect(p.answers).toEqual({})
    expect(p.bookmarks).toEqual([])
    expect(p.examHistory).toEqual([])
  })

  it('markAnswer persists and reloads', () => {
    markAnswer('p1c1_001', 'correct')
    markAnswer('p1c1_002', 'wrong')
    const p = loadProgress()
    expect(p.answers['p1c1_001']).toBe('correct')
    expect(p.answers['p1c1_002']).toBe('wrong')
  })

  it('toggleBookmark adds then removes', () => {
    toggleBookmark('p2c1_001')
    expect(loadProgress().bookmarks).toContain('p2c1_001')
    toggleBookmark('p2c1_001')
    expect(loadProgress().bookmarks).not.toContain('p2c1_001')
  })

  it('saveExamResult caps history at 10 entries', () => {
    for (let i = 0; i < 12; i++) {
      saveExamResult({
        date: `2026-05-0${(i % 9) + 1}`,
        score: i,
        part1Score: 0,
        part2Score: 0,
        totalTime: 0,
        answers: {},
      })
    }
    expect(loadProgress().examHistory).toHaveLength(10)
  })

  it('resetProgress clears storage', () => {
    markAnswer('p1c1_001', 'correct')
    expect(localStorage.getItem('sqld_progress')).not.toBeNull()
    resetProgress()
    const raw = localStorage.getItem('sqld_progress')
    expect(raw, `raw after reset: ${raw}`).toBeNull()
    expect(loadProgress().answers).toEqual({})
  })

  it('saveProgress writes the exact same shape that loadProgress returns', () => {
    const store = {
      answers: { p1c1_001: 'correct' as const },
      bookmarks: ['p1c1_002'],
      lastVisited: { type: 'theory' as const, id: 'part1_ch1' },
      examHistory: [],
    }
    saveProgress(store)
    expect(loadProgress()).toEqual(store)
  })
})

describe('getStats', () => {
  it('total matches the number of questions on disk', () => {
    expect(getStats().total).toBe(getAllQuestions().length)
  })

  it('attempted/correct count only non-skipped answers', () => {
    markAnswer('p1c1_001', 'correct')
    markAnswer('p1c1_002', 'wrong')
    markAnswer('p1c1_003', 'skipped')

    const s = getStats()
    expect(s.attempted).toBe(2)
    expect(s.correct).toBe(1)
  })

  it('byPart aggregates correctly across both subjects', () => {
    markAnswer('p1c1_001', 'correct')
    markAnswer('p2c1_001', 'correct')
    markAnswer('p2c1_002', 'wrong')

    const s = getStats()
    expect(s.byPart[1].correct).toBe(1)
    expect(s.byPart[1].attempted).toBe(1)
    expect(s.byPart[2].correct).toBe(1)
    expect(s.byPart[2].attempted).toBe(2)
  })
})
