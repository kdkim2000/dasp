import Link from 'next/link'
import { useProgress } from '@/context/ProgressContext'
import { CHAPTER_IDS, getChapterFullLabel } from '@/lib/chapters'

export default function QuizIndex() {
  const { stats, progress } = useProgress()

  const wrongCount = Object.values(progress.answers).filter((r) => r === 'wrong').length
  const bookmarkCount = progress.bookmarks.length

  return (
    <>
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">문제 풀기</h1>
        <p className="text-gray-500 mb-8 text-sm">
          전체 {stats.total}문제 중 {stats.attempted}문제 풀이 완료 (정답률{' '}
          {stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0}%)
        </p>

        {/* 학습 모드 카드 */}
        <div className="grid gap-4 mb-8">
          {/* 챕터별 문제풀기 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">챕터별 문제풀기</h2>
            <div className="space-y-2">
              {CHAPTER_IDS.map((id) => {
                return (
                  <Link
                    key={id}
                    href={`/quiz/chapter/${id}`}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                  >
                    <span className="font-medium text-gray-800 group-hover:text-blue-700">
                      {getChapterFullLabel(id)}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 특별 모드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/quiz/exam"
              className="flex flex-col items-center p-6 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-bold text-lg">모의고사</span>
              <span className="text-blue-200 text-sm mt-1">50문항 / 90분</span>
            </Link>

            <Link
              href="/quiz/wrong"
              className={`flex flex-col items-center p-6 rounded-xl shadow-sm transition-colors ${
                wrongCount > 0
                  ? 'bg-red-50 border-2 border-red-300 hover:bg-red-100'
                  : 'bg-gray-50 border-2 border-gray-200 cursor-not-allowed opacity-60'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-lg text-gray-800">오답 노트</span>
              <span className="text-gray-500 text-sm mt-1">{wrongCount}문제</span>
            </Link>

            <Link
              href="/quiz/bookmarks"
              className={`flex flex-col items-center p-6 rounded-xl shadow-sm transition-colors ${
                bookmarkCount > 0
                  ? 'bg-yellow-50 border-2 border-yellow-300 hover:bg-yellow-100'
                  : 'bg-gray-50 border-2 border-gray-200 cursor-not-allowed opacity-60'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              <span className="font-bold text-lg text-gray-800">북마크</span>
              <span className="text-gray-500 text-sm mt-1">{bookmarkCount}문제</span>
            </Link>
          </div>
        </div>

        {/* 최근 모의고사 기록 */}
        {progress.examHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">최근 모의고사 기록</h2>
            <div className="space-y-2">
              {progress.examHistory.slice(0, 5).map((exam) => (
                <div key={exam.date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{new Date(exam.date).toLocaleDateString('ko-KR')}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      1과목 {exam.part1Score}점 / 2과목 {exam.part2Score}점
                    </span>
                    <span
                      className={`font-bold ${
                        exam.score >= 60 && exam.part1Score >= 40 && exam.part2Score >= 40
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {exam.score}점
                      {exam.score >= 60 && exam.part1Score >= 40 && exam.part2Score >= 40
                        ? ' 합격'
                        : ' 불합격'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
