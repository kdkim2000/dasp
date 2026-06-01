import { describe, it, expect } from 'vitest'
import {
  getAllQuestions,
  getQuestionsByChapter,
  getQuestionsByIds,
  sampleExamQuestions,
} from './questions'
import { CHAPTER_IDS } from './chapters'

describe('questions library', () => {
  it('getAllQuestions returns a non-empty union of all chapter files', () => {
    const all = getAllQuestions()
    expect(all.length).toBeGreaterThan(0)

    const sumByChapter = CHAPTER_IDS.reduce(
      (n, id) => n + getQuestionsByChapter(id).length,
      0
    )
    expect(all.length).toBe(sumByChapter)
  })

  it('every question id is unique', () => {
    const ids = getAllQuestions().map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every question has 4 options and answer in range 1..4', () => {
    for (const q of getAllQuestions()) {
      expect(q.options).toHaveLength(4)
      expect(q.answer).toBeGreaterThanOrEqual(1)
      expect(q.answer).toBeLessThanOrEqual(4)
    }
  })

  it('getQuestionsByIds returns subset matching the requested ids', () => {
    const ids = getAllQuestions().slice(0, 3).map((q) => q.id)
    const subset = getQuestionsByIds(ids)
    expect(subset.map((q) => q.id).sort()).toEqual([...ids].sort())
  })

  it('sampleExamQuestions returns 10 part-1 + 40 part-2 (or all available)', () => {
    const sample = sampleExamQuestions()
    const part1 = sample.filter((q) => q.part === 1)
    const part2 = sample.filter((q) => q.part === 2)

    const allP1 = getAllQuestions().filter((q) => q.part === 1).length
    const allP2 = getAllQuestions().filter((q) => q.part === 2).length

    expect(part1.length).toBe(Math.min(10, allP1))
    expect(part2.length).toBe(Math.min(40, allP2))
  })
})
