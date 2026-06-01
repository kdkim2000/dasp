import type { Question } from '@/types'
import { CHAPTER_IDS } from '@/lib/chapters'
import part1ch1 from '@/data/questions/part1_ch1.json'
import part1ch2 from '@/data/questions/part1_ch2.json'
import part2ch1 from '@/data/questions/part2_ch1.json'
import part2ch2 from '@/data/questions/part2_ch2.json'
import part2ch3 from '@/data/questions/part2_ch3.json'
import exam1 from '@/data/mockexam/exam1.json'
import exam2 from '@/data/mockexam/exam2.json'

const CHAPTER_DATA: Record<string, Question[]> = {
  part1_ch1: part1ch1 as Question[],
  part1_ch2: part1ch2 as Question[],
  part2_ch1: part2ch1 as Question[],
  part2_ch2: part2ch2 as Question[],
  part2_ch3: part2ch3 as Question[],
}

export function getAllQuestions(): Question[] {
  return CHAPTER_IDS.flatMap((id) => CHAPTER_DATA[id] ?? [])
}

export function getQuestionsByChapter(chapterId: string): Question[] {
  return CHAPTER_DATA[chapterId] ?? []
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const all = getAllQuestions()
  const idSet = new Set(ids)
  return all.filter((q) => idSet.has(q.id))
}

export function sampleExamQuestions(): Question[] {
  const part1 = getAllQuestions().filter((q) => q.part === 1)
  const part2 = getAllQuestions().filter((q) => q.part === 2)

  const shuffle = <T>(arr: T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5)

  return [
    ...shuffle(part1).slice(0, 10),
    ...shuffle(part2).slice(0, 40),
  ]
}

export function getMockExamQuestions(examNum: 1 | 2): Question[] {
  return (examNum === 1 ? exam1 : exam2) as Question[]
}

export function getAllQuestionsFromAllSources(): Question[] {
  return [
    ...getAllQuestions(),
    ...(exam1 as Question[]),
    ...(exam2 as Question[]),
  ]
}

export function sampleMixedExam(): Question[] {
  const all = getAllQuestionsFromAllSources()
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

  const part1Pool = all.filter((q) => q.part === 1)
  const p2c1 = all.filter((q) => q.part === 2 && q.chapter === '1')
  const p2c2 = all.filter((q) => q.part === 2 && q.chapter === '2')
  const p2c3 = all.filter((q) => q.part === 2 && q.chapter === '3')

  const part2Sampled = [
    ...shuffle(p2c1).slice(0, 15),
    ...shuffle(p2c2).slice(0, 15),
    ...shuffle(p2c3).slice(0, 10),
  ]

  return [
    ...shuffle(part1Pool).slice(0, 10),
    ...shuffle(part2Sampled),
  ]
}

export { CHAPTER_IDS }

