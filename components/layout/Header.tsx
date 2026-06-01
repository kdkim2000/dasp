import Link from 'next/link'
import { useRouter } from 'next/router'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()

  const navItems = [
    { label: '홈', href: '/' },
    { label: '이론', href: '/theory' },
    { label: '문제풀기', href: '/quiz' },
  ]

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* 햄버거 메뉴 버튼 (모바일) */}
      <button
        type="button"
        aria-label="메뉴 열기"
        onClick={onMenuClick}
        className="md:hidden flex flex-col gap-1.5 p-1.5 rounded hover:bg-gray-100"
      >
        <span className="block w-5 h-0.5 bg-gray-600" />
        <span className="block w-5 h-0.5 bg-gray-600" />
        <span className="block w-5 h-0.5 bg-gray-600" />
      </button>

      {/* 사이트명 */}
      <Link
        href="/"
        className="text-lg font-bold text-blue-700 tracking-tight shrink-0"
      >
        SQLD 합격길잡이
      </Link>

      {/* PC 네비게이션 */}
      <nav className="hidden md:flex items-center gap-1 ml-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? router.pathname === '/'
              : router.pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
