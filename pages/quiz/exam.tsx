import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import QuestionCard from '@/components/quiz/QuestionCard'
import QuizNavigator from '@/components/quiz/QuizNavigator'
import ExamTimer from '@/components/quiz/ExamTimer'
import { useProgress } from '@/context/ProgressContext'
import { saveExamResult } from '@/lib/progress'
import { sampleExamQuestions, sampleMixedExam, getMockExamQuestions } from '@/lib/questions'
import type { Question, AnswerResult, ExamResult } from '@/types'

const EXAM_DURATION = 90 * 60

type ExamPhase = 'ready' | 'ongoing' | 'result'
type ExamSource = 'mixed' | 'chapter' | 'exam1' | 'exam2'

const SOURCE_OPTIONS: { value: ExamSource; label: string; desc: string }[] = [
  { value: 'mixed',   label: '혼합 랜덤',   desc: '챕터+모의고사 전체 ~215문에서 무작위' },
  { value: 'chapter', label: '챕터 문제',   desc: '단원별 학습 문제만 (115문 풀)' },
  { value: 'exam1',   label: '모의고사 1회', desc: '출제예상 1회 50문 순서대로' },
  { value: 'exam2',   label: '모의고사 2회', desc: '출제예상 2회 50문 순서대로' },
]

export default function ExamPage() {
  const { markAnswer, toggleBookmark, isBookmarked } = useProgress()

  const [phase, setPhase]                 = useState<ExamPhase>('ready')
  const [selectedSource, setSelectedSource] = useState<ExamSource>('mixed')
  const [questions, setQuestions]         = useState<Question[]>([])
  const [currentIndex, setCurrentIndex]   = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [sessionAnswers, setSessionAnswers]   = useState<(AnswerResult | null)[]>([])
  const [examResult, setExamResult]       = useState<ExamResult | null>(null)
  const startTimeRef  = useRef<number>(0)
  const timedOutRef   = useRef(false)

  useEffect(() => {
    if (phase === 'ongoing' && questions.length === 0) {
      let qs: Question[]
      if (selectedSource === 'chapter')  qs = sampleExamQuestions()
      else if (selectedSource === 'exam1') qs = getMockExamQuestions(1)
      else if (selectedSource === 'exam2') qs = getMockExamQuestions(2)
      else                                 qs = sampleMixedExam()
      setQuestions(qs)
      setSelectedOptions(Array(qs.length).fill(0))
      setSessionAnswers(Array(qs.length).fill(null))
    }
  }, [phase, questions.length, selectedSource])

  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now()
    timedOutRef.current  = false
    setPhase('ongoing')
  }, [])

  const handleAnswer = useCallback((_result: AnswerResult, selectedIndex: number) => {
    setSelectedOptions((prev) => { const n = [...prev]; n[currentIndex] = selectedIndex; return n })
  }, [currentIndex])

  const gradeExam = useCallback((timeTaken: number) => {
    if (questions.length === 0) return
    const part1Qs = questions.filter((q) => q.part === 1)
    const part2Qs = questions.filter((q) => q.part === 2)
    let p1correct = 0, p2correct = 0
    const answersRecord: Record<string, number> = {}
    const newSessionAnswers: AnswerResult[] = []

    questions.forEach((q, i) => {
      const selected = selectedOptions[i] ?? 0
      answersRecord[q.id] = selected
      const res: AnswerResult = selected === q.answer ? 'correct' : selected === 0 ? 'skipped' : 'wrong'
      newSessionAnswers.push(res)
      markAnswer(q.id, res)
      if (res === 'correct') { if (q.part === 1) p1correct++; else p2correct++ }
    })

    setSessionAnswers(newSessionAnswers)
    const part1Score = part1Qs.length > 0 ? Math.round((p1correct / part1Qs.length) * 100) : 0
    const part2Score = part2Qs.length > 0 ? Math.round((p2correct / part2Qs.length) * 100) : 0
    const totalScore = Math.round(((p1correct + p2correct) / questions.length) * 100)

    const result: ExamResult = {
      date: new Date().toISOString(),
      score: totalScore, part1Score, part2Score, totalTime: timeTaken,
      answers: answersRecord,
    }
    saveExamResult(result)
    setExamResult(result)
    setPhase('result')
  }, [questions, selectedOptions, markAnswer])

  const handleSubmit  = useCallback(() => gradeExam(Math.floor((Date.now() - startTimeRef.current) / 1000)), [gradeExam])
  const handleTimeUp  = useCallback(() => { if (timedOutRef.current) return; timedOutRef.current = true; gradeExam(EXAM_DURATION) }, [gradeExam])

  /* ── 준비 화면 ── */
  if (phase === 'ready') {
    return (
      <>
        <Head><title>모의고사 | SQLD Quest</title></Head>
        <div className="p-4 md:p-6 max-w-lg mx-auto">
          <div className="q-card p-8">
            {/* 헤더 */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--q-ink)' }}>SQLD 모의고사</h1>
              <p className="text-sm" style={{ color: 'var(--q-ink-2)' }}>1과목 10문항 + 2과목 40문항 · 90분</p>
            </div>

            {/* 출제 방식 선택 */}
            <div className="mb-5">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--q-ink-3)' }}>출제 방식 선택</p>
              <div className="space-y-2">
                {SOURCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedSource(opt.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                      selectedSource === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-transparent hover:border-primary-200'
                    }`}
                    style={selectedSource !== opt.value ? { backgroundColor: 'var(--q-surface-soft)' } : undefined}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      selectedSource === opt.value ? 'border-primary-600' : 'border-gray-300'
                    }`}>
                      {selectedSource === opt.value && (
                        <span className="w-2 h-2 rounded-full bg-primary-600" />
                      )}
                    </span>
                    <span>
                      <span className="text-sm font-semibold block" style={{ color: 'var(--q-ink)' }}>{opt.label}</span>
                      <span className="text-xs" style={{ color: 'var(--q-ink-3)' }}>{opt.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 합격 기준 */}
            <div className="rounded-2xl p-4 mb-5 text-left bg-primary-50">
              <h2 className="font-semibold text-primary-800 mb-2 text-sm">합격 기준</h2>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>• 총점 60점 이상</li>
                <li>• 1과목 40점 이상 (과락 없어야 함)</li>
                <li>• 2과목 40점 이상 (과락 없어야 함)</li>
              </ul>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base transition-colors"
            >
              시험 시작
            </button>
            <Link href="/quiz" className="block mt-3 text-sm text-center hover:underline" style={{ color: 'var(--q-ink-3)' }}>
              돌아가기
            </Link>
          </div>
        </div>
      </>
    )
  }

  /* ── 결과 화면 ── */
  if (phase === 'result' && examResult) {
    const passed = examResult.score >= 60 && examResult.part1Score >= 40 && examResult.part2Score >= 40
    const mins   = Math.floor(examResult.totalTime / 60)
    const secs   = examResult.totalTime % 60
    const correctCount  = sessionAnswers.filter((a) => a === 'correct').length
    const wrongCount    = sessionAnswers.filter((a) => a === 'wrong').length
    const skippedCount  = sessionAnswers.filter((a) => a === 'skipped').length

    return (
      <>
        <Head><title>모의고사 결과 | SQLD Quest</title></Head>
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
          {/* 합격/불합격 헤더 */}
          <div
            className="q-card p-8 text-center border-2"
            style={{
              borderColor: passed ? '#12B76A' : '#FF6B6B',
              background:  passed ? '#ECFDF3'  : '#FFF1F2',
            }}
          >
            <p className="font-display font-black text-4xl mb-1" style={{ color: passed ? '#039855' : '#BE123C' }}>
              {passed ? '합격 🎉' : '불합격'}
            </p>
            <p className="font-bold text-5xl mb-2" style={{ color: 'var(--q-ink)' }}>{examResult.score}점</p>
            <p className="text-sm" style={{ color: 'var(--q-ink-3)' }}>소요 시간: {mins}분 {secs}초</p>
          </div>

          {/* 과목별 점수 */}
          <div className="q-card">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--q-ink)' }}>과목별 점수</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '1과목 (데이터 모델링)', score: examResult.part1Score },
                { label: '2과목 (SQL 기본·활용)',  score: examResult.part2Score },
              ].map(({ label, score }) => (
                <div key={label} className="text-center p-4 rounded-2xl" style={{ backgroundColor: 'var(--q-surface-soft)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--q-ink-3)' }}>{label}</p>
                  <p className={`text-3xl font-bold ${score >= 40 ? 'text-mint-500' : 'text-coral'}`}>{score}점</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--q-ink-3)' }}>
                    {score >= 40 ? '✓ 과락 없음' : '✗ 과락'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 풀이 통계 */}
          <div className="q-card">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--q-ink)' }}>풀이 통계</h2>
            <div className="flex justify-around text-center">
              <div><p className="text-2xl font-bold text-mint-500">{correctCount}</p><p className="text-xs" style={{ color: 'var(--q-ink-3)' }}>정답</p></div>
              <div><p className="text-2xl font-bold text-coral">{wrongCount}</p><p className="text-xs" style={{ color: 'var(--q-ink-3)' }}>오답</p></div>
              <div><p className="text-2xl font-bold" style={{ color: 'var(--q-ink-3)' }}>{skippedCount}</p><p className="text-xs" style={{ color: 'var(--q-ink-3)' }}>미응답</p></div>
            </div>
          </div>

          {/* 문제별 결과 */}
          <div className="q-card">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--q-ink)' }}>문제별 결과</h2>
            <div className="grid grid-cols-10 gap-1.5">
              {questions.map((q, i) => {
                const res = sessionAnswers[i]
                const bg  = res === 'correct' ? '#ECFDF3' : res === 'wrong' ? '#FFF1F2' : undefined
                const fg  = res === 'correct' ? '#039855'  : res === 'wrong' ? '#BE123C'  : undefined
                return (
                  <div
                    key={q.id}
                    className="h-8 w-full rounded-lg text-xs font-bold flex items-center justify-center"
                    style={{ backgroundColor: bg ?? 'var(--q-surface-soft)', color: fg ?? 'var(--q-ink-3)' }}
                    title={`Q${i + 1}: ${res ?? '미응답'}`}
                  >
                    {i + 1}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-1">
            <button
              onClick={() => { setPhase('ready'); setQuestions([]); setCurrentIndex(0); setSelectedOptions([]); setSessionAnswers([]); setExamResult(null); timedOutRef.current = false }}
              className="px-6 py-2.5 rounded-xl border font-medium text-sm transition-colors hover:bg-surface-soft"
              style={{ borderColor: 'var(--q-border)', color: 'var(--q-ink-2)' }}
            >
              다시 보기
            </button>
            <Link href="/quiz" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors">
              문제 목록으로
            </Link>
          </div>
        </div>
      </>
    )
  }

  /* ── 로딩 ── */
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--q-ink-3)' }}>문제를 불러오는 중...</p>
      </div>
    )
  }

  /* ── 시험 진행 ── */
  const currentQuestion  = questions[currentIndex]
  const currentSelected  = selectedOptions[currentIndex] ?? 0
  const answeredCount    = selectedOptions.filter((s) => s > 0).length

  return (
    <>
      <Head><title>모의고사 진행 중 | SQLD Quest</title></Head>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-xl" style={{ color: 'var(--q-ink)' }}>SQLD 모의고사</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--q-ink-3)' }}>
              {answeredCount}/{questions.length} 문항 응답 완료
            </p>
          </div>
          <ExamTimer totalSeconds={EXAM_DURATION} onTimeUp={handleTimeUp} />
        </div>

        <div className="flex gap-5">
          {/* 문제 영역 */}
          <div className="flex-1 min-w-0">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedOption={currentSelected > 0 ? currentSelected : null}
              showResult={false}
              onAnswer={handleAnswer}
              isBookmarked={isBookmarked(currentQuestion.id)}
              onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
            />

            {/* 이전/다음 */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2 rounded-xl border font-medium text-sm transition-colors disabled:opacity-40 hover:bg-surface-soft"
                style={{ borderColor: 'var(--q-border)', color: 'var(--q-ink-2)' }}
              >
                이전 문제
              </button>
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((p) => p + 1)}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors"
                >
                  다음 문제
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-sm transition-colors"
                >
                  답안 제출
                </button>
              )}
            </div>

            {currentIndex < questions.length - 1 && (
              <div className="mt-3 text-right">
                <button onClick={handleSubmit} className="text-sm text-primary-600 hover:text-primary-800 underline">
                  지금 바로 제출하기
                </button>
              </div>
            )}
          </div>

          {/* 네비게이터 */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <QuizNavigator
              total={questions.length}
              current={currentIndex}
              answers={selectedOptions.map((s) => s > 0 ? ('skipped' as AnswerResult) : null)}
              bookmarked={questions.map((q) => isBookmarked(q.id))}
              onJump={setCurrentIndex}
            />
          </div>
        </div>
      </div>
    </>
  )
}
