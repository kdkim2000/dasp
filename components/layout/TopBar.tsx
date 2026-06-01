import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useProgress } from '@/context/ProgressContext'

const NAV_ITEMS = [
  { label: '홈', href: '/' },
  { label: '이론', href: '/theory' },
  { label: '문제풀기', href: '/quiz' },
]

export default function TopBar() {
  const router = useRouter()
  const { getStreak, getXP, getGems, getHearts } = useProgress()
  const [dark, setDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('q-theme')
    if (stored === 'dark') {
      setDark(true)
      document.documentElement.dataset.theme = 'dark'
    }
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    if (typeof window !== 'undefined') {
      localStorage.setItem('q-theme', next ? 'dark' : 'light')
    }
  }

  function isActive(href: string) {
    return href === '/' ? router.pathname === '/' : router.pathname.startsWith(href)
  }

  return (
    <header
      style={{ backgroundColor: 'var(--q-surface)', borderBottomColor: 'var(--q-border)' }}
      className="h-14 border-b sticky top-0 z-30 flex items-center px-4 gap-4"
    >
      {/* 브랜드 */}
      <Link href="/" className="font-display font-bold text-primary-600 text-lg shrink-0 tracking-tight">
        SQLD Quest
      </Link>

      {/* PC 네비게이션 */}
      <nav className="hidden md:flex items-center gap-1 ml-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-primary-50 text-primary-700'
                : 'hover:bg-surface-soft'
            }`}
            style={!isActive(item.href) ? { color: 'var(--q-ink-2)' } : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      {/* 게이미피케이션 배지 */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
          🔥 {getStreak()}
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
          💎 {getGems()}
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
          ❤️ {getHearts()}
        </span>
      </div>

      {/* 다크모드 토글 */}
      <button
        onClick={toggleTheme}
        aria-label="다크모드 전환"
        style={{ color: 'var(--q-ink-3)' }}
        className="p-2 rounded-lg hover:bg-surface-soft transition-colors text-base"
      >
        {dark ? '☀️' : '🌙'}
      </button>

      {/* 모바일 햄버거 */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-surface-soft transition-colors"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="메뉴"
        aria-expanded={mobileOpen}
      >
        <span style={{ color: 'var(--q-ink-2)' }} className="text-xl leading-none">
          {mobileOpen ? '✕' : '☰'}
        </span>
      </button>

      {/* 모바일 드롭다운 */}
      {mobileOpen && (
        <div
          style={{ backgroundColor: 'var(--q-surface)', borderBottomColor: 'var(--q-border)' }}
          className="absolute top-14 left-0 right-0 border-b shadow-q-md py-2 md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-surface-soft'
              }`}
              style={!isActive(item.href) ? { color: 'var(--q-ink-2)' } : undefined}
            >
              {item.label}
            </Link>
          ))}
          <div
            className="flex items-center gap-2 px-4 py-2.5 mt-1 border-t"
            style={{ borderColor: 'var(--q-border)' }}
          >
            <span className="text-xs font-bold text-[#C2410C]">🔥 {getStreak()}</span>
            <span className="text-xs font-bold text-primary-700">💎 {getGems()}</span>
            <span className="text-xs font-bold text-[#BE123C]">❤️ {getHearts()}</span>
          </div>
        </div>
      )}
    </header>
  )
}
