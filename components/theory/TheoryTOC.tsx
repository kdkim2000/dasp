import { useEffect, useRef, useState } from 'react'

interface Heading {
  level: 2 | 3
  text: string
  id: string
}

interface TheoryTOCProps {
  content: string
  className?: string
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\wㄱ-힣가-힣-]/g, '')
}

function parseHeadings(content: string): Heading[] {
  const lines = content.split('\n')
  const headings: Heading[] = []
  const idCount: Record<string, number> = {}

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/)
    const h3Match = line.match(/^###\s+(.+)$/)

    if (h2Match && !line.startsWith('###')) {
      const text = h2Match[1].trim()
      let id = slugify(text)
      if (idCount[id] !== undefined) {
        idCount[id] += 1
        id = `${id}-${idCount[id]}`
      } else {
        idCount[id] = 0
      }
      headings.push({ level: 2, text, id })
    } else if (h3Match) {
      const text = h3Match[1].trim()
      let id = slugify(text)
      if (idCount[id] !== undefined) {
        idCount[id] += 1
        id = `${id}-${idCount[id]}`
      } else {
        idCount[id] = 0
      }
      headings.push({ level: 3, text, id })
    }
  }

  return headings
}

export default function TheoryTOC({ content, className = '' }: TheoryTOCProps) {
  const [headings] = useState<Heading[]>(() => parseHeadings(content))
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      }
    }

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    })

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [headings])

  if (headings.length === 0) return null

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  return (
    <nav className={`text-sm ${className}`} aria-label="목차">
      <p
        className="font-semibold text-xs uppercase tracking-wider mb-3"
        style={{ color: 'var(--q-ink-3)' }}
      >
        목차
      </p>
      <ul className="space-y-1">
        {headings.map((heading) => {
          const isActive = activeId === heading.id
          return (
            <li key={heading.id}>
              <button
                type="button"
                onClick={() => handleClick(heading.id)}
                className={`w-full text-left rounded-lg px-2 py-1 transition-colors leading-snug
                  ${heading.level === 3 ? 'pl-5' : ''}
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'hover:bg-surface-soft'
                  }
                `}
                style={isActive ? {} : { color: 'var(--q-ink-2)' }}
              >
                {heading.text}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
