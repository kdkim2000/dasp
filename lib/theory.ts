import fs from 'fs'
import path from 'path'
import type { ChapterMeta } from '@/types'
import { CHAPTERS, getChapterById } from '@/lib/chapters'

export function getAllChapters(): ChapterMeta[] {
  return CHAPTERS
}

export function getChapterMeta(id: string): ChapterMeta | undefined {
  return getChapterById(id)
}

export function getChapterContent(id: string): string {
  const filePath = path.join(process.cwd(), 'data', 'theory', `${id}.md`)
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    const title = getChapterById(id)?.title ?? id
    return `# ${title}\n\n> 콘텐츠 준비 중입니다.`
  }
}
