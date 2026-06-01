import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ChapterMeta } from '@/types'
import { getAllChapters, getChapterMeta, getChapterContent } from '@/lib/theory'
import TheoryContent from '@/components/theory/TheoryContent'
import TheoryTOC from '@/components/theory/TheoryTOC'
import RelatedQuestions from '@/components/theory/RelatedQuestions'

interface TheoryPageProps {
  chapter: ChapterMeta
  content: string
  prevChapter: ChapterMeta | null
  nextChapter: ChapterMeta | null
}

export default function TheoryPage({
  chapter,
  content,
  prevChapter,
  nextChapter,
}: TheoryPageProps) {
  const [tocOpen, setTocOpen] = useState(false)

  return (
    <>
      <Head>
        <title>{chapter.title} | SQLD 합격길잡이</title>
      </Head>

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* 챕터 헤더 */}
        <div className="mb-6">
          {/* 브레드크럼 */}
          <nav className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--q-ink-3)' }}>
            <Link href="/theory" className="hover:underline" style={{ color: 'var(--q-ink-2)' }}>
              이론 학습
            </Link>
            <span>/</span>
            <span>{chapter.part}과목</span>
            <span>/</span>
            <span style={{ color: 'var(--q-ink)' }}>{chapter.title}</span>
          </nav>

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--q-primary)',
                color: '#fff',
              }}
            >
              {chapter.part}과목 {chapter.chapter}장
            </span>
            <h1
              className="font-display font-bold text-2xl"
              style={{ color: 'var(--q-ink)' }}
            >
              {chapter.title}
            </h1>
          </div>

          {/* 탭 네비게이션 */}
          <div className="mt-4 flex gap-2">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: 'var(--q-primary)', color: '#fff' }}
            >
              이론
            </span>
            <Link
              href={`/quiz/chapter/${chapter.id}`}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors hover:opacity-80"
              style={{
                background: 'var(--q-surface-soft)',
                color: 'var(--q-ink-2)',
                border: '1px solid var(--q-border)',
              }}
            >
              문제 풀기
            </Link>
          </div>
        </div>

        {/* ── 데스크톱 3열 그리드 ── */}
        <div className="hidden md:grid grid-cols-[280px_1fr_280px] gap-6">
          {/* 왼쪽: TOC */}
          <aside className="q-card sticky top-20 h-fit">
            <TheoryTOC content={content} />
          </aside>

          {/* 중앙: 본문 */}
          <article className="q-card min-w-0">
            <TheoryContent content={content} />

            {/* 하단 챕터 네비게이션 */}
            <div className="mt-8 pt-6 flex justify-between" style={{ borderTop: '1px solid var(--q-border)' }}>
              {prevChapter ? (
                <Link
                  href={`/theory/${prevChapter.id}`}
                  className="flex items-center gap-1 text-sm rounded-xl px-3 py-2 transition-colors hover:opacity-80"
                  style={{
                    color: 'var(--q-ink-2)',
                    border: '1px solid var(--q-border)',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {prevChapter.title}
                </Link>
              ) : (
                <div />
              )}
              {nextChapter ? (
                <Link
                  href={`/theory/${nextChapter.id}`}
                  className="flex items-center gap-1 text-sm rounded-xl px-3 py-2 transition-colors hover:opacity-80"
                  style={{
                    color: 'var(--q-ink-2)',
                    border: '1px solid var(--q-border)',
                  }}
                >
                  {nextChapter.title}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </article>

          {/* 오른쪽: 관련 문제 */}
          <aside className="space-y-4">
            <RelatedQuestions chapterId={chapter.id} />
          </aside>
        </div>

        {/* ── 모바일 단일 컬럼 ── */}
        <div className="md:hidden space-y-4">
          {/* TOC 토글 */}
          <div className="q-card">
            <button
              type="button"
              onClick={() => setTocOpen((prev) => !prev)}
              className="flex items-center justify-between w-full text-sm font-semibold"
              style={{ color: 'var(--q-ink)' }}
            >
              <span>목차 보기</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transition-transform ${tocOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {tocOpen && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--q-border)' }}>
                <TheoryTOC content={content} />
              </div>
            )}
          </div>

          {/* 본문 */}
          <div className="q-card">
            <TheoryContent content={content} />
          </div>

          {/* 관련 문제 */}
          <RelatedQuestions chapterId={chapter.id} />

          {/* 하단 챕터 네비게이션 */}
          <div className="flex justify-between">
            {prevChapter ? (
              <Link
                href={`/theory/${prevChapter.id}`}
                className="flex items-center gap-1 text-sm rounded-xl px-3 py-2 transition-colors hover:opacity-80"
                style={{
                  color: 'var(--q-ink-2)',
                  border: '1px solid var(--q-border)',
                  background: 'var(--q-surface)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                이전
              </Link>
            ) : <div />}
            {nextChapter ? (
              <Link
                href={`/theory/${nextChapter.id}`}
                className="flex items-center gap-1 text-sm rounded-xl px-3 py-2 transition-colors hover:opacity-80"
                style={{
                  color: 'var(--q-ink-2)',
                  border: '1px solid var(--q-border)',
                  background: 'var(--q-surface)',
                }}
              >
                다음
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : <div />}
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const chapters = getAllChapters()
  const paths = chapters.map((c) => ({ params: { chapterId: c.id } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<TheoryPageProps> = async ({ params }) => {
  const chapterId = params?.chapterId as string
  const chapter = getChapterMeta(chapterId)

  if (!chapter) {
    return { notFound: true }
  }

  const content = getChapterContent(chapterId)
  const allChapters = getAllChapters()
  const currentIdx = allChapters.findIndex((c) => c.id === chapterId)
  const prevChapter = currentIdx > 0 ? allChapters[currentIdx - 1] : null
  const nextChapter = currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null

  return {
    props: {
      chapter,
      content,
      prevChapter: prevChapter ?? null,
      nextChapter: nextChapter ?? null,
    },
  }
}
