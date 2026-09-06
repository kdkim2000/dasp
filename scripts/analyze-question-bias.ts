import fs from 'fs'
import path from 'path'

const QUESTIONS_DIR = path.join(process.cwd(), 'data', 'questions')

interface QuestionRaw {
  id: string
  options: string[]
  answer: number
}

function loadJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(dir, f))
}

function readQuestions(filePath: string): QuestionRaw[] {
  let raw = fs.readFileSync(filePath, 'utf-8')
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1)
  return JSON.parse(raw)
}

interface FileStats {
  file: string
  total: number
  positionCounts: number[] // index 0-3
  longestIsAnswer: number
  longestIsAnswerTies: number
  answerLenSum: number
  otherLenSum: number
  otherLenCount: number
}

function analyzeFile(filePath: string, data: QuestionRaw[]): FileStats {
  const stats: FileStats = {
    file: path.relative(process.cwd(), filePath),
    total: data.length,
    positionCounts: [0, 0, 0, 0],
    longestIsAnswer: 0,
    longestIsAnswerTies: 0,
    answerLenSum: 0,
    otherLenSum: 0,
    otherLenCount: 0,
  }

  for (const q of data) {
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.answer < 0 || q.answer > 3) continue
    stats.positionCounts[q.answer]++

    const lengths = q.options.map(o => (o || '').length)
    const answerLen = lengths[q.answer]
    const otherLens = lengths.filter((_, i) => i !== q.answer)
    const maxLen = Math.max(...lengths)
    const maxCount = lengths.filter(l => l === maxLen).length

    if (answerLen === maxLen) {
      stats.longestIsAnswerTies++
      if (maxCount === 1) stats.longestIsAnswer++
    }

    stats.answerLenSum += answerLen
    stats.otherLenSum += otherLens.reduce((a, b) => a + b, 0)
    stats.otherLenCount += otherLens.length
  }

  return stats
}

function fmtPct(n: number, total: number): string {
  if (total === 0) return '0.0%'
  return `${((n / total) * 100).toFixed(1)}%`
}

function printStats(stats: FileStats) {
  const { total, positionCounts } = stats
  const posStr = positionCounts.map((c, i) => `${i + 1}:${fmtPct(c, total)}`).join(' ')
  const longestPct = fmtPct(stats.longestIsAnswer, total)
  const longestTiesPct = fmtPct(stats.longestIsAnswerTies, total)
  const avgAnswerLen = total > 0 ? stats.answerLenSum / total : 0
  const avgOtherLen = stats.otherLenCount > 0 ? stats.otherLenSum / stats.otherLenCount : 0
  const ratio = avgOtherLen > 0 ? (avgAnswerLen / avgOtherLen).toFixed(2) : 'N/A'

  console.log(`\n${stats.file}  (n=${total})`)
  console.log(`  위치분포: ${posStr}`)
  console.log(`  정답=최장옵션(단독): ${longestPct}  (동률포함: ${longestTiesPct})`)
  console.log(`  평균길이: 정답 ${avgAnswerLen.toFixed(1)}자 / 오답 ${avgOtherLen.toFixed(1)}자  (비율 ${ratio})`)
}

function aggregate(all: FileStats[], label: string) {
  const total = all.reduce((s, f) => s + f.total, 0)
  const positionCounts = [0, 0, 0, 0]
  let longestIsAnswer = 0
  let longestIsAnswerTies = 0
  let answerLenSum = 0
  let otherLenSum = 0
  let otherLenCount = 0

  for (const f of all) {
    for (let i = 0; i < 4; i++) positionCounts[i] += f.positionCounts[i]
    longestIsAnswer += f.longestIsAnswer
    longestIsAnswerTies += f.longestIsAnswerTies
    answerLenSum += f.answerLenSum
    otherLenSum += f.otherLenSum
    otherLenCount += f.otherLenCount
  }

  printStats({
    file: `[집계] ${label}`,
    total,
    positionCounts,
    longestIsAnswer,
    longestIsAnswerTies,
    answerLenSum,
    otherLenSum,
    otherLenCount,
  })

  return { total, positionCounts, longestIsAnswer, longestIsAnswerTies, answerLenSum, otherLenSum, otherLenCount }
}

function checkThresholds(agg: ReturnType<typeof aggregate>, label: string): string[] {
  const problems: string[] = []
  const total = agg.total
  if (total === 0) return problems

  for (let i = 0; i < 4; i++) {
    const pct = (agg.positionCounts[i] / total) * 100
    if (pct < 22 || pct > 28) {
      problems.push(`${label}: 위치 ${i + 1}번 비율 ${pct.toFixed(1)}% (기준 22~28% 벗어남)`)
    }
  }

  // 단독 최장옵션(동률 없이 정답 하나만 가장 긴 경우)만 게이트로 사용한다.
  // 동률포함 비율은 오답 길이를 정답과 균형 있게 맞출수록 우연히 같은 글자수가 되는
  // 경우가 늘어나 자연히 높아지는 지표라 실제 악용 가능성과 무관하다(동률이면
  // "가장 긴 보기"를 찍어도 그 안에서 다시 추측해야 하므로 신호가 되지 않는다).
  const longestPct = (agg.longestIsAnswer / total) * 100
  if (longestPct < 20 || longestPct > 35) {
    problems.push(`${label}: 정답=최장옵션(단독) 비율 ${longestPct.toFixed(1)}% (기준 20~35% 벗어남)`)
  }

  const avgAnswerLen = agg.answerLenSum / total
  const avgOtherLen = agg.otherLenCount > 0 ? agg.otherLenSum / agg.otherLenCount : 0
  const ratio = avgOtherLen > 0 ? avgAnswerLen / avgOtherLen : 0
  if (ratio < 0.85 || ratio > 1.15) {
    problems.push(`${label}: 정답/오답 평균길이 비율 ${ratio.toFixed(2)} (기준 0.85~1.15 벗어남)`)
  }

  return problems
}

function main() {
  const mainFiles = loadJsonFiles(QUESTIONS_DIR)
  const mockDir = path.join(QUESTIONS_DIR, 'mockexam')
  const mockFiles = loadJsonFiles(mockDir)

  console.log('=== 챕터 문제은행 (part*.json) ===')
  const chapterStats: FileStats[] = []
  for (const f of mainFiles) {
    const data = readQuestions(f)
    const stats = analyzeFile(f, data)
    chapterStats.push(stats)
    printStats(stats)
  }
  const chapterAgg = aggregate(chapterStats, '챕터 전체')

  console.log('\n=== 모의고사 (mockexam/*.json) ===')
  const mockStats: FileStats[] = []
  for (const f of mockFiles) {
    const data = readQuestions(f)
    const stats = analyzeFile(f, data)
    mockStats.push(stats)
    printStats(stats)
  }
  const mockAgg = aggregate(mockStats, '모의고사 전체')

  console.log('\n=== 기준 충족 여부 ===')
  const problems = [
    ...checkThresholds(chapterAgg, '챕터 전체'),
    ...checkThresholds(mockAgg, '모의고사 전체'),
  ]

  if (problems.length === 0) {
    console.log('✓ 모든 집계 기준 통과')
    process.exit(0)
  } else {
    console.log(`✗ ${problems.length}건 기준 미달:`)
    problems.forEach(p => console.log(`  - ${p}`))
    process.exit(1)
  }
}

main()
