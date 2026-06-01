import React, { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { sampleExamQuestions } from '@/lib/questions'
import { useProgress } from '@/context/ProgressContext'
import QuestionCard from '@/components/quiz/QuestionCard'
import AnswerFeedback from '@/components/quiz/AnswerFeedback'
import QuizNavigator from '@/components/quiz/QuizNavigator'
import ExamTimer from '@/components/quiz/ExamTimer'
import type { Question, AnswerResult, ExamResult } from '@/types'

type ExamPhase = 'intro' | 'exam' | 'result'

interface LocalAnswer {
  selectedIndex: number
  result: AnswerResult
}

const PART_TITLES: Record<number, string> = {
  1: '전사아키텍처 이해',
  2: '데이터 요건 분석',
  3: '데이터 표준화',
  4: '데이터 모델링',
  5: '데이터베이스 설계와 이용',
}

export default function ExamPage() {
  const router = useRouter()
  const { saveExamResult, toggleBookmark, isBookmarked } = useProgress()
  const [phase, setPhase] = useState<ExamPhase>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [localAnswers, setLocalAnswers] = useState<Record<number, LocalAnswer>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [timeUsed, setTimeUsed] = useState(0)
  const startTimeRef = useRef<number>(0)

  const EXAM_SECONDS = 7200 // 120분

  const startExam = () => {
    const qs = sampleExamQuestions()
    setQuestions(qs)
    setCurrentIndex(0)
    setLocalAnswers({})
    setShowFeedback(false)
    setSelectedOption(null)
    startTimeRef.current = Date.now()
    setPhase('exam')
  }

  const computeResult = useCallback((answers: Record<number, LocalAnswer>, qs: Question[], elapsed: number): ExamResult => {
    const partScores: Record<number, { correct: number; total: number }> = {
      1: { correct: 0, total: 0 },
      2: { correct: 0, total: 0 },
      3: { correct: 0, total: 0 },
      4: { correct: 0, total: 0 },
      5: { correct: 0, total: 0 },
    }

    qs.forEach((q, i) => {
      const a = answers[i]
      partScores[q.part].total++
      if (a?.result === 'correct') partScores[q.part].correct++
    })

    const toScore = (part: number) => {
      const p = partScores[part]
      if (p.total === 0) return 0
      return Math.round((p.correct / p.total) * 100)
    }

    const totalCorrect = Object.values(partScores).reduce((s, p) => s + p.correct, 0)
    const totalQ = qs.length || 1
    const totalScore = Math.round((totalCorrect / totalQ) * 100)

    const answersMap: Record<string, number> = {}
    qs.forEach((q, i) => {
      if (answers[i] !== undefined) answersMap[q.id] = answers[i].selectedIndex
    })

    return {
      date: new Date().toISOString(),
      score: totalScore,
      part1Score: toScore(1),
      part2Score: toScore(2),
      part3Score: toScore(3),
      part4Score: toScore(4),
      part5Score: toScore(5),
      totalTime: elapsed,
      answers: answersMap,
    }
  }, [])

  const finishExam = useCallback((answers: Record<number, LocalAnswer>, forced = false) => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    setTimeUsed(elapsed)
    const result = computeResult(answers, questions, elapsed)
    saveExamResult(result)
    setExamResult(result)
    setPhase('result')
  }, [questions, computeResult, saveExamResult])

  const handleTimeUp = useCallback(() => {
    finishExam(localAnswers, true)
  }, [finishExam, localAnswers])

  const handleAnswer = useCallback((optionIndex: number) => {
    if (showFeedback) return
    const currentQuestion = questions[currentIndex]
    setSelectedOption(optionIndex)
    const result: AnswerResult = optionIndex === currentQuestion.answer ? 'correct' : 'wrong'
    const newAnswers = { ...localAnswers, [currentIndex]: { selectedIndex: optionIndex, result } }
    setLocalAnswers(newAnswers)
    setShowFeedback(true)
  }, [showFeedback, questions, currentIndex, localAnswers])

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      finishExam(localAnswers)
      return
    }
    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)
    setShowFeedback(false)
    setSelectedOption(localAnswers[nextIndex]?.selectedIndex ?? null)
  }, [currentIndex, questions.length, localAnswers, finishExam])

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index)
    const prev = localAnswers[index]
    setSelectedOption(prev?.selectedIndex ?? null)
    setShowFeedback(prev !== undefined)
  }, [localAnswers])

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="q-card text-center space-y-6">
          <div className="text-5xl">📝</div>
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">DAsP 모의고사</h1>
            <p className="text-ink-muted text-sm mt-2">실전과 동일한 조건으로 실력을 확인해보세요.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="q-card bg-surface-soft text-center py-4">
              <div className="text-2xl font-bold text-primary-600">100</div>
              <div className="text-xs text-ink-muted mt-1">문항</div>
            </div>
            <div className="q-card bg-surface-soft text-center py-4">
              <div className="text-2xl font-bold text-primary-600">120</div>
              <div className="text-xs text-ink-muted mt-1">분</div>
            </div>
            <div className="q-card bg-surface-soft text-center py-4">
              <div className="text-2xl font-bold text-primary-600">5</div>
              <div className="text-xs text-ink-muted mt-1">과목</div>
            </div>
          </div>

          <div className="text-left bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-sm space-y-1">
            <div className="font-semibold text-primary-800 mb-2">합격 기준</div>
            <div className="text-primary-700">• 전체 평균 60점 이상</div>
            <div className="text-primary-700">• 각 과목별 40점 이상</div>
            <div className="text-primary-700">• 과목당 20문항 (5과목)</div>
          </div>

          <button
            onClick={startExam}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-base transition-colors shadow-q-md"
          >
            시험 시작
          </button>
        </div>
      </div>
    )
  }

  // Result screen
  if (phase === 'result' && examResult) {
    const passed =
      examResult.score >= 60 &&
      examResult.part1Score >= 40 &&
      examResult.part2Score >= 40 &&
      examResult.part3Score >= 40 &&
      examResult.part4Score >= 40 &&
      examResult.part5Score >= 40

    const partScores = [
      examResult.part1Score,
      examResult.part2Score,
      examResult.part3Score,
      examResult.part4Score,
      examResult.part5Score,
    ]

    const stars = examResult.score >= 80 ? 3 : examResult.score >= 60 ? 2 : 1

    const mins = Math.floor(timeUsed / 60)
    const secs = timeUsed % 60

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Result card */}
        <div className="q-card text-center space-y-4">
          <div className="text-5xl">{passed ? '🎉' : '😔'}</div>
          <h1 className="text-xl font-display font-bold text-ink">
            {passed ? '합격!' : '불합격'}
          </h1>
          <div className="flex justify-center gap-1 text-3xl">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i}>{i < stars ? '★' : '☆'}</span>
            ))}
          </div>

          <div className="text-5xl font-display font-bold text-primary-600">
            {examResult.score}점
          </div>

          <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
            passed ? 'bg-mint-50 text-mint-700 border border-mint-300' : 'bg-red-50 text-red-700 border border-red-300'
          }`}>
            {passed ? '합격' : '불합격'} (기준: 60점 이상 + 각 과목 40점 이상)
          </div>

          <div className="text-xs text-ink-muted">
            소요 시간: {mins}분 {secs}초
          </div>
        </div>

        {/* Part scores */}
        <div className="q-card space-y-3">
          <h2 className="font-semibold text-ink">과목별 점수</h2>
          {partScores.map((score, i) => {
            const partNum = i + 1
            const passed40 = score >= 40
            return (
              <div key={partNum} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">{partNum}과목 {PART_TITLES[partNum]}</span>
                  <span className={`font-bold ${passed40 ? 'text-mint-600' : 'text-red-500'}`}>
                    {score}점 {passed40 ? '✓' : '✗'}
                  </span>
                </div>
                <div className="h-2 bg-surface-soft rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${passed40 ? 'bg-mint-500' : 'bg-coral'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setPhase('intro')
              setExamResult(null)
              setLocalAnswers({})
            }}
            className="flex-1 py-2.5 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-colors"
          >
            다시 도전
          </button>
          <Link href="/quiz/wrong" className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors text-center">
            오답 노트
          </Link>
        </div>
      </div>
    )
  }

  // Exam screen
  const currentQuestion = questions[currentIndex]
  const navigatorAnswers: Record<number, AnswerResult | null> = Object.fromEntries(
    Object.entries(localAnswers).map(([k, v]) => [Number(k), v.result])
  )
  const bookmarkIndices = new Set(
    questions
      .map((q, i) => (isBookmarked(q.id) ? i : -1))
      .filter(i => i >= 0)
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Exam header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-ink">DAsP 모의고사</h1>
          <p className="text-xs text-ink-muted">
            {currentIndex + 1} / {questions.length}문항 · {currentQuestion?.part}과목
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExamTimer totalSeconds={EXAM_SECONDS} onTimeUp={handleTimeUp} />
          <button
            onClick={() => finishExam(localAnswers)}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            제출하기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {currentQuestion && (
            <>
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                selectedOption={selectedOption}
                showResult={showFeedback}
                onAnswer={handleAnswer}
                isBookmarked={isBookmarked(currentQuestion.id)}
                onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
              />
              {showFeedback && (
                <AnswerFeedback
                  question={currentQuestion}
                  selectedIndex={selectedOption}
                  onNext={handleNext}
                  isLast={currentIndex === questions.length - 1}
                />
              )}
            </>
          )}
        </div>

        {/* Navigator */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <QuizNavigator
              total={questions.length}
              current={currentIndex}
              answers={navigatorAnswers}
              onNavigate={handleNavigate}
              bookmarks={bookmarkIndices}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
