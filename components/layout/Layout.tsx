import TopBar from '@/components/layout/TopBar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--q-bg)', color: 'var(--q-ink)' }} className="flex flex-col">
      <TopBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
