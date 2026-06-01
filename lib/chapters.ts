import type { ChapterMeta } from '@/types'

export interface ChapterDef extends ChapterMeta {
  idPrefix: string
}

export const CHAPTERS: ChapterDef[] = [
  { id: 'part1_ch1', part: 1, chapter: 1, title: '데이터 모델링의 이해',   idPrefix: 'p1c1_', questionCount: 0 },
  { id: 'part1_ch2', part: 1, chapter: 2, title: '데이터 모델과 성능',     idPrefix: 'p1c2_', questionCount: 0 },
  { id: 'part2_ch1', part: 2, chapter: 1, title: 'SQL 기본',               idPrefix: 'p2c1_', questionCount: 0 },
  { id: 'part2_ch2', part: 2, chapter: 2, title: 'SQL 활용',               idPrefix: 'p2c2_', questionCount: 0 },
  { id: 'part2_ch3', part: 2, chapter: 3, title: 'SQL 최적화 기본 원리',   idPrefix: 'p2c3_', questionCount: 0 },
]

export const CHAPTER_IDS = CHAPTERS.map((c) => c.id)

export const CHAPTER_BY_ID: Record<string, ChapterDef> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, c])
)

export const CHAPTER_ID_PREFIX: Record<string, string> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, c.idPrefix])
)

export function getChapterById(id: string): ChapterDef | undefined {
  return CHAPTER_BY_ID[id]
}

export function getChapterTitle(id: string): string {
  return CHAPTER_BY_ID[id]?.title ?? id
}

export function getChapterFullLabel(id: string): string {
  const c = CHAPTER_BY_ID[id]
  if (!c) return id
  return `${c.part}과목 ${c.chapter}장 - ${c.title}`
}

export function getChapterIdByQuestionId(questionId: string): string | undefined {
  return CHAPTERS.find((c) => questionId.startsWith(c.idPrefix))?.id
}
