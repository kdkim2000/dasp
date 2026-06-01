import Link from 'next/link'
import { useRouter } from 'next/router'
import { useProgress } from '@/context/ProgressContext'

interface NavItem {
  label: string
  href: string
  chapterId?: string
}

interface NavGroup {
  label: string
  icon: string
  items: NavItem[]
}

const THEORY_GROUPS: { part: string; items: NavItem[] }[] = [
  {
    part: '1과목 데이터모델링',
    items: [
      { label: '1장 데이터모델링의 이해', href: '/theory/part1_ch1', chapterId: 'part1_ch1' },
      { label: '2장 데이터 모델과 성능', href: '/theory/part1_ch2', chapterId: 'part1_ch2' },
    ],
  },
  {
    part: '2과목 SQL 기본및활용',
    items: [
      { label: '1장 SQL 기본',              href: '/theory/part2_ch1', chapterId: 'part2_ch1' },
      { label: '2장 SQL 활용',              href: '/theory/part2_ch2', chapterId: 'part2_ch2' },
      { label: '3장 SQL 최적화 기본 원리',   href: '/theory/part2_ch3', chapterId: 'part2_ch3' },
    ],
  },
]

const QUIZ_ITEMS: NavItem[] = [
  { label: '단원별 풀기',   href: '/quiz' },
  { label: '전체 모의고사', href: '/quiz/exam' },
  { label: '오답 다시풀기', href: '/quiz/wrong' },
  { label: '북마크 문제',   href: '/quiz/bookmarks' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter()
  const { stats } = useProgress()

  function isActive(href: string): boolean {
    if (href === '/quiz') {
      return router.pathname === '/quiz'
    }
    return router.pathname === href || router.pathname.startsWith(href + '/')
  }

  function chapterBadge(chapterId: string): string | null {
    const chapterStats = stats.byChapter[chapterId]
    if (!chapterStats || chapterStats.total === 0) return null
    return `${chapterStats.attempted}/${chapterStats.total}`
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 본체 */}
      <aside
        className={`
          fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64
          bg-white border-r border-gray-200
          overflow-y-auto z-20
          transition-transform duration-200
          md:translate-x-0 md:static md:top-0 md:h-full
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-3 flex flex-col gap-1">
          {/* 대시보드 */}
          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              router.pathname === '/'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span aria-hidden="true">&#127968;</span>
            대시보드
          </Link>

          {/* 이론 학습 섹션 */}
          <div className="mt-3">
            <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              이론 학습
            </p>
            {THEORY_GROUPS.map((group) => (
              <div key={group.part} className="mt-2">
                <p className="px-3 py-1 text-xs text-gray-500 font-medium">
                  {group.part}
                </p>
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  const badge = item.chapterId ? chapterBadge(item.chapterId) : null
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ml-2 ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span>{item.label}</span>
                      {badge && (
                        <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 ml-2 shrink-0">
                          {badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>

          {/* 문제 풀이 섹션 */}
          <div className="mt-3">
            <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              문제 풀이
            </p>
            {QUIZ_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}
