export type QuestionType = 'concept' | 'result' | 'completion' | 'error'

export type QuestionSource = 'chapter' | 'mockexam1' | 'mockexam2'

export interface Question {
  id: string
  part: 1 | 2
  chapter: string
  content: string
  options: string[]
  answer: number
  explanation: string
  tags?: string[]
  difficulty?: '하' | '중' | '상'
  questionType?: QuestionType
  source?: QuestionSource
}

export type AnswerResult = 'correct' | 'wrong' | 'skipped'

export type QuizMode = 'chapter' | 'exam' | 'wrong' | 'bookmarks'

export interface ProgressStore {
  answers: Record<string, AnswerResult>
  bookmarks: string[]
  lastVisited: { type: 'theory' | 'quiz'; id: string } | null
  examHistory: ExamResult[]
}

export interface ExamResult {
  date: string
  score: number
  part1Score: number
  part2Score: number
  totalTime: number
  answers: Record<string, number>
}

export interface ChapterMeta {
  id: string
  part: 1 | 2
  chapter: number
  title: string
  questionCount: number
}

export interface Stats {
  total: number
  attempted: number
  correct: number
  byChapter: Record<string, { total: number; correct: number; attempted: number }>
  byPart: Record<number, { total: number; correct: number; attempted: number }>
}
