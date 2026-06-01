import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import {
  CHAPTERS,
  CHAPTER_IDS,
  CHAPTER_ID_PREFIX,
  getChapterById,
  getChapterFullLabel,
  getChapterIdByQuestionId,
} from './chapters'

describe('CHAPTERS metadata', () => {
  it('exposes 5 chapters covering both parts', () => {
    expect(CHAPTERS).toHaveLength(5)
    expect(CHAPTERS.filter((c) => c.part === 1)).toHaveLength(2)
    expect(CHAPTERS.filter((c) => c.part === 2)).toHaveLength(3)
  })

  it('every chapter id has a matching JSON and MD data file', () => {
    for (const id of CHAPTER_IDS) {
      const json = path.join(process.cwd(), 'data', 'questions', `${id}.json`)
      const md = path.join(process.cwd(), 'data', 'theory', `${id}.md`)
      expect(fs.existsSync(json), `missing ${json}`).toBe(true)
      expect(fs.existsSync(md), `missing ${md}`).toBe(true)
    }
  })

  it('id prefix maps round-trip with question ids', () => {
    for (const c of CHAPTERS) {
      expect(CHAPTER_ID_PREFIX[c.id]).toBe(c.idPrefix)
      const sampleQid = `${c.idPrefix}001`
      expect(getChapterIdByQuestionId(sampleQid)).toBe(c.id)
    }
  })

  it('full label includes part·chapter·title', () => {
    expect(getChapterFullLabel('part1_ch1')).toBe('1과목 1장 - 데이터 모델링의 이해')
    expect(getChapterFullLabel('part2_ch3')).toBe('2과목 3장 - SQL 최적화 기본 원리')
    expect(getChapterFullLabel('unknown')).toBe('unknown')
  })

  it('getChapterById returns undefined for unknown id', () => {
    expect(getChapterById('part9_ch9')).toBeUndefined()
    expect(getChapterById('part1_ch1')?.title).toBe('데이터 모델링의 이해')
  })
})
