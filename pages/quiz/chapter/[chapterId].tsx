import { useState, useCallback, useEffect } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import QuestionCard from '@/components/quiz/QuestionCard'
import AnswerFeedback from '@/components/quiz/AnswerFeedback'
import QuizNavigator from '@/components/quiz/QuizNavigator'
import { getQuestionsByChapter } from '@/lib/questions'
import { CHAPTER_IDS, getChapterFullLabel } from '@/lib/chapters'
import { useProgress } from '@/context/ProgressContext'
import type { Question, AnswerResult, QuestionType } from '@/types'

interface Props {
  chapterId: string
  questions: Question[]
}

const TYPE_LABEL: Record<QuestionType | 'all', string> = {
  all:        '전체',
  concept:    '개념',
  result:     'SQL결과',
  completion: '구문완성',
  error:      '오류탐색',
}

export default function ChapterQuiz({ chapterId, questions }: Props) {
  const { markAnswer, toggleBookmark, isBookmarked } = useProgress()

  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all')

  const filteredQuestions = typeFilter === 'all'
    ? questions
    : questions.filter((q) => (q.questionType ?? 'concept') === typeFilter)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>(
    Array(filteredQuestions.length).fill(null)
  )
  const [sessionAnswers, setSessionAnswers] = useState<(AnswerResult | null)[]>(
    Array(filteredQuestions.length).fill(null)
  )
  const [completed, setCompleted] = useState(false)

  // 필터 변경 시 상태 리셋
  useEffect(() => {
    setCurrentIndex(0)
    setSelectedOptions(Array(filteredQuestions.length).fill(null))
    setSessionAnswers(Array(filteredQuestions.length).fill(null))
    setCompleted(false)
  // filteredQuestions.length 변화(= 필터 변화)에만 반응
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter])

  const currentQuestion = filteredQuestions[currentIndex]
  const currentAnswer   = sessionAnswers[currentIndex]
  const showResult      = currentAnswer !== null

  const handleAnswer = useCallback((result: AnswerResult, selectedIndex: number) => {
    setSelectedOptions((prev) => { const n = [...prev]; n[currentIndex] = selectedIndex; return n })
    setSessionAnswers((prev)  => { const n = [...prev]; n[currentIndex] = result;        return n })
    if (currentQuestion) markAnswer(currentQuestion.id, result)
  }, [currentIndex, currentQuestion, markAnswer])

  const handleNext = useCallback(() => {
    if (currentIndex < filteredQuestions.length - 1) setCurrentIndex((p) => p + 1)
    else setCompleted(true)
  }, [currentIndex, filteredQuestions.length])

  const handleToggleBookmark = useCallback(() => {
    if (currentQuestion) toggleBookmark(currentQuestion.id)
  }, [currentQuestion, toggleBookmark])

  const chapterLabel = getChapterFullLabel(chapterId)

  // 이 챕터에 실제로 존재하는 유형만 필터 버튼으로 표시
  const availableTypes = Array.from(
    new Set(questions.map((q) => q.questionType ?? 'concept'))
  ) as QuestionType[]
  const hasMultipleTypes = availableTypes.length > 1

  // 필터 UI 렌더링 헬퍼
  function FilterBar() {
    if (!hasMultipleTypes) return null
    return (
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {(['all', ...availableTypes] as (QuestionType | 'all')[]).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              typeFilter === type
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600'
            }`}
            style={typeFilter !== type ? { backgroundColor: 'var(--q-surface-soft)' } : undefined}
          >
            {TYPE_LABEL[type]}
            {type !== 'all' && (
              <span className="ml-1 opacity-70">
                ({questions.filter((q) => (q.questionType ?? 'concept') === type).length})
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  /* ── 완료 화면 ── */
  if (completed) {
    const correctCount   = sessionAnswers.filter((a) => a === 'correct').length
    const wrongCount     = sessionAnswers.filter((a) => a === 'wrong').length
    const total          = filteredQuestions.length
    const percentage     = Math.round((correctCount / total) * 100)
    const wrongQuestions = filteredQuestions.filter((_, i) => sessionAnswers[i] === 'wrong')

    const scoreColor =
      percentage >= 80 ? 'text-mint-500' : percentage >= 60 ? 'text-sun' : 'text-coral'

    return (
      <>
        <Head><title>{chapterLabel} 결과 | SQLD Quest</title></Head>
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
          {/* 점수 카드 */}
          <div className="q-card p-8 text-center">
            <div className={`text-6xl font-display font-bold mb-2 ${scoreColor}`}>{percentage}%</div>
            <p className="text-sm mb-1" style={{ color: 'var(--q-ink-2)' }}>
              {total}문제 중{' '}
              <span className="font-bold text-mint-500">{correctCount}문제</span> 정답 /{' '}
              <span className="font-bold text-coral">{wrongCount}문제</span> 오답
            </p>
            <p className="text-xs" style={{ color: 'var(--q-ink-3)' }}>
              {chapterLabel}{typeFilter !== 'all' && ` · ${TYPE_LABEL[typeFilter]}`}
            </p>
          </div>

          {/* 오답 목록 */}
          {wrongQuestions.length > 0 && (
            <div className="q-card">
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--q-ink)' }}>
                오답 문제 ({wrongQuestions.length}개)
              </h2>
              <div className="space-y-2">
                {wrongQuestions.map((q) => {
                  const qIndex = filteredQuestions.indexOf(q)
                  return (
                    <button
                      key={q.id}
                      onClick={() => { setCompleted(false); setCurrentIndex(qIndex) }}
                      className="w-full text-left px-4 py-3 rounded-xl border transition-colors"
                      style={{ borderColor: '#FECDD3', backgroundColor: '#FFF1F2' }}
                    >
                      <span className="text-xs font-bold text-coral mr-2">Q{qIndex + 1}.</span>
                      <span className="text-xs line-clamp-1" style={{ color: 'var(--q-ink-2)' }}>
                        {q.content.replace(/```[\s\S]*?```/g, '[SQL]').slice(0, 80)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0)
                setSelectedOptions(Array(filteredQuestions.length).fill(null))
                setSessionAnswers(Array(filteredQuestions.length).fill(null))
                setCompleted(false)
              }}
              className="px-6 py-2.5 rounded-xl border font-medium text-sm transition-colors hover:bg-surface-soft"
              style={{ borderColor: 'var(--q-border)', color: 'var(--q-ink-2)' }}
            >
              다시 풀기
            </button>
            <Link
              href="/quiz"
              className="px-6 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-medium text-sm transition-colors"
            >
              문제 목록으로
            </Link>
          </div>
        </div>
      </>
    )
  }

  /* ── 문제 없음 (필터 결과 0개) ── */
  if (filteredQuestions.length === 0) {
    return (
      <>
        <Head><title>{chapterLabel} | SQLD Quest</title></Head>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <Link href="/quiz" className="text-xs font-medium text-primary-600 hover:text-primary-700">
              ← 문제 목록
            </Link>
          </div>
          <FilterBar />
          <div className="q-card p-8 text-center text-sm" style={{ color: 'var(--q-ink-3)' }}>
            해당 유형의 문제가 없습니다.
          </div>
        </div>
      </>
    )
  }

  /* ── 풀이 화면 ── */
  const answeredCount = sessionAnswers.filter((a) => a !== null).length

  return (
    <>
      <Head><title>{chapterLabel} | SQLD Quest</title></Head>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <Link href="/quiz" className="text-xs font-medium text-primary-600 hover:text-primary-700">
              ← 문제 목록
            </Link>
            <h1 className="font-display font-bold text-xl mt-1" style={{ color: 'var(--q-ink)' }}>
              {chapterLabel}
            </h1>
          </div>
          {/* 진행 배지 */}
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full mt-1" style={{ backgroundColor: 'var(--q-surface-soft)', color: 'var(--q-ink-3)' }}>
            {answeredCount} / {filteredQuestions.length}
          </span>
        </div>

        {/* 문제 유형 필터 */}
        <FilterBar />

        <div className="flex gap-5">
          {/* 문제 + 피드백 */}
          <div className="flex-1 min-w-0">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={filteredQuestions.length}
              selectedOption={selectedOptions[currentIndex]}
              showResult={showResult}
              onAnswer={handleAnswer}
              isBookmarked={isBookmarked(currentQuestion.id)}
              onToggleBookmark={handleToggleBookmark}
            />
            {showResult && currentAnswer && (
              <AnswerFeedback
                question={currentQuestion}
                result={currentAnswer}
                selectedOption={selectedOptions[currentIndex] ?? 0}
                onNext={handleNext}
                isBookmarked={isBookmarked(currentQuestion.id)}
                onToggleBookmark={handleToggleBookmark}
                isLast={currentIndex === filteredQuestions.length - 1}
              />
            )}
          </div>

          {/* 네비게이터 */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <QuizNavigator
              total={filteredQuestions.length}
              current={currentIndex}
              answers={sessionAnswers}
              bookmarked={filteredQuestions.map((q) => isBookmarked(q.id))}
              onJump={setCurrentIndex}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: CHAPTER_IDS.map((id) => ({ params: { chapterId: id } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const chapterId = params?.chapterId as string
  const questions = getQuestionsByChapter(chapterId)
  if (!questions || questions.length === 0) return { notFound: true }
  return { props: { chapterId, questions } }
}
