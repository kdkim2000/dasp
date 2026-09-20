import React, { useEffect, useRef, useState } from 'react'

interface MermaidDiagramProps {
  chart: string
}

function getIsDark(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.getAttribute('data-theme') === 'dark'
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)
  const id = React.useId().replace(/:/g, '')

  useEffect(() => {
    setIsDark(getIsDark())
    const observer = new MutationObserver(() => setIsDark(getIsDark()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaidModule = await import('mermaid')
        const mermaid = mermaidModule.default
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'strict',
        })
        const { svg } = await mermaid.render(`mermaid-${id}`, chart)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '다이어그램을 렌더링할 수 없습니다.')
        }
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [chart, isDark, id])

  if (error) {
    return (
      <div className="my-4">
        <p className="text-xs text-coral mb-2">다이어그램 렌더링 오류: {error}</p>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-xs whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram my-4 flex justify-center overflow-x-auto bg-surface rounded-xl border border-[var(--q-border)] p-4"
    >
      <span className="text-xs text-ink-faint">다이어그램 로딩 중...</span>
    </div>
  )
}
