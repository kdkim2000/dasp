import type { ProgressStore, AnswerResult, ExamResult, Stats } from '@/types'
import { getAllQuestions } from '@/lib/questions'

const STORAGE_KEY = 'sqld_progress'
const MAX_EXAM_HISTORY = 10

const isBrowser = typeof window !== 'undefined'

function defaultProgress(): ProgressStore {
  return {
    answers: {},
    bookmarks: [],
    lastVisited: null,
    examHistory: [],
  }
}

export function loadProgress(): ProgressStore {
  if (!isBrowser) return defaultProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    return JSON.parse(raw) as ProgressStore
  } catch (err) {
    console.warn('[progress] failed to parse stored progress, resetting', err)
    return defaultProgress()
  }
}

export function saveProgress(store: ProgressStore): void {
  if (!isBrowser) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function markAnswer(id: string, result: AnswerResult): void {
  const store = loadProgress()
  store.answers[id] = result
  saveProgress(store)
}

export function toggleBookmark(id: string): void {
  const store = loadProgress()
  const idx = store.bookmarks.indexOf(id)
  if (idx === -1) {
    store.bookmarks.push(id)
  } else {
    store.bookmarks.splice(idx, 1)
  }
  saveProgress(store)
}

export function saveExamResult(result: ExamResult): void {
  const store = loadProgress()
  store.examHistory = [result, ...store.examHistory].slice(0, MAX_EXAM_HISTORY)
  saveProgress(store)
}

export function resetProgress(): void {
  if (!isBrowser) return
  localStorage.removeItem(STORAGE_KEY)
}

export function getStats(): Stats {
  const store = loadProgress()
  const questions = getAllQuestions()

  const byChapter: Stats['byChapter'] = {}
  const byPart: Stats['byPart'] = {
    1: { total: 0, correct: 0, attempted: 0 },
    2: { total: 0, correct: 0, attempted: 0 },
  }

  for (const q of questions) {
    if (!byChapter[q.chapter]) {
      byChapter[q.chapter] = { total: 0, correct: 0, attempted: 0 }
    }
    byChapter[q.chapter].total++
    byPart[q.part].total++

    const result = store.answers[q.id]
    if (result && result !== 'skipped') {
      byChapter[q.chapter].attempted++
      byPart[q.part].attempted++
      if (result === 'correct') {
        byChapter[q.chapter].correct++
        byPart[q.part].correct++
      }
    }
  }

  const total = questions.length
  const attempted = Object.values(store.answers).filter((r) => r !== 'skipped').length
  const correct = Object.values(store.answers).filter((r) => r === 'correct').length

  return { total, attempted, correct, byChapter, byPart }
}
