import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import QuestionCard from '@/components/quiz/QuestionCard'
import AnswerFeedback from '@/components/quiz/AnswerFeedback'
import QuizNavigator from '@/components/quiz/QuizNavigator'
import { getQuestionsByIds } from '@/lib/questions'
import { useProgress } from '@/context/ProgressContext'
import type { Question, AnswerResult } from '@/types'

export default function BookmarksPage() {
  const { progress, isHydrated, markAnswer, toggleBookmark, isBookmarked } = useProgress()

  const [questions, setQuestions] = useState<Question[]>([])
  const [loaded, setLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>([])
  const [sessionAnswers, setSessionAnswers] = useState<(AnswerResult | null)[]>([])
  const [completed, setCompleted] = useState(false)

  // isHydrated가 true가 된 최초 1회만 세션을 초기화
  // progress.bookmarks를 의존성에서 제거하여 markAnswer 호출 시 재초기화 방지
  useEffect(() => {
    if (!isHydrated) return
    const qs = getQuestionsByIds(progress.bookmarks)
    setQuestions(qs)
    setSelectedOptions(Array(qs.length).fill(null))
    setSessionAnswers(Array(qs.length).fill(null))
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated])

  const handleAnswer = useCallback(
    (result: AnswerResult, selectedIndex: number) => {
      setSelectedOptions((prev) => {
        const next = [...prev]
        next[currentIndex] = selectedIndex
        return next
      })
      setSessionAnswers((prev) => {
        const next = [...prev]
        next[currentIndex] = result
        return next
      })
      markAnswer(questions[currentIndex].id, result)
    },
    [currentIndex, questions, markAnswer]
  )

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setCompleted(true)
    }
  }, [currentIndex, questions.length])

  const handleToggleBookmark = useCallback(() => {
    if (questions[currentIndex]) {
      toggleBookmark(questions[currentIndex].id)
    }
  }, [currentIndex, questions, toggleBookmark])

  // 로딩 중
  if (!loaded) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">불러오는 중...</p>
        </div>
      </>
    )
  }

  // 북마크 없음
  if (questions.length === 0) {
    return (
      <>
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">북마크한 문제가 없습니다</h1>
          <p className="text-gray-500 mb-6">
            문제를 풀면서 북마크 버튼을 눌러 나중에 다시 풀 문제를 저장해보세요.
          </p>
          <Link
            href="/quiz"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            문제 목록으로
          </Link>
        </div>
      </>
    )
  }

  // 완료 화면
  if (completed) {
    const correctCount = sessionAnswers.filter((a) => a === 'correct').length
    const total = questions.length
    const percentage = Math.round((correctCount / total) * 100)

    return (
      <>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h1 className="text-xl font-bold text-gray-800 mb-4">북마크 문제 완료</h1>
            <div
              className={`text-5xl font-bold mb-2 ${
                percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}
            >
              {percentage}%
            </div>
            <p className="text-gray-600">
              {total}문제 중 <span className="text-green-600 font-bold">{correctCount}문제</span> 정답
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCurrentIndex(0)
                setSelectedOptions(Array(questions.length).fill(null))
                setSessionAnswers(Array(questions.length).fill(null))
                setCompleted(false)
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            >
              다시 풀기
            </button>
            <Link href="/quiz" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              문제 목록으로
            </Link>
          </div>
        </div>
      </>
    )
  }

  const currentQuestion = questions[currentIndex]
  const currentAnswer = sessionAnswers[currentIndex]
  const showResult = currentAnswer !== null

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/quiz" className="text-sm text-blue-600 hover:underline">
              &larr; 문제 목록
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              북마크 문제
              <span className="ml-2 text-sm font-normal text-yellow-600">
                {questions.length}문제
              </span>
            </h1>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
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
                isLast={currentIndex === questions.length - 1}
              />
            )}
          </div>

          <div className="hidden lg:block w-52 flex-shrink-0">
            <QuizNavigator
              total={questions.length}
              current={currentIndex}
              answers={sessionAnswers}
              bookmarked={questions.map((q) => isBookmarked(q.id))}
              onJump={setCurrentIndex}
            />
          </div>
        </div>
      </div>
    </>
  )
}
