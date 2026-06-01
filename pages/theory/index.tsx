import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import type { ChapterMeta } from '@/types'
import { getAllChapters } from '@/lib/theory'

interface TheoryIndexProps {
  chapters: ChapterMeta[]
}

const PART_META: Record<number, { label: string; icon: string; color: string }> = {
  1: { label: '1과목 데이터 모델링의 이해', icon: '🗂️', color: 'text-primary-600' },
  2: { label: '2과목 SQL 기본 및 활용',    icon: '🛢️', color: 'text-mint-500' },
}

export default function TheoryIndex({ chapters }: TheoryIndexProps) {
  const part1 = chapters.filter((c) => c.part === 1)
  const part2 = chapters.filter((c) => c.part === 2)

  return (
    <>
      <Head>
        <title>이론 학습 | SQLD Quest</title>
      </Head>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-1" style={{ color: 'var(--q-ink)' }}>
            이론 학습
          </h1>
          <p className="text-sm" style={{ color: 'var(--q-ink-3)' }}>
            챕터를 선택해 개념을 학습하세요
          </p>
        </div>

        {/* 과목별 섹션 */}
        {[{ part: 1, items: part1 }, { part: 2, items: part2 }].map(({ part, items }) => {
          const meta = PART_META[part]
          return (
            <section key={part} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{meta.icon}</span>
                <h2 className="font-display font-bold text-base md:text-lg" style={{ color: 'var(--q-ink)' }}>
                  {meta.label}
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/theory/${chapter.id}`}
                    className="group q-card hover:border-primary-300 hover:shadow-q-md transition-all"
                  >
                    <p className={`text-xs font-semibold mb-1.5 ${meta.color}`}>
                      {part}과목 · {chapter.chapter}장
                    </p>
                    <p className="font-medium text-sm group-hover:text-primary-700 transition-colors" style={{ color: 'var(--q-ink)' }}>
                      {chapter.title}
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--q-ink-3)' }}>
                      문제 {chapter.questionCount}개 →
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<TheoryIndexProps> = async () => {
  const chapters = getAllChapters()
  return { props: { chapters } }
}
