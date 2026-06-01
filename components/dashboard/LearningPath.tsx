import Link from 'next/link'
import { CHAPTERS } from '@/lib/chapters'

type ChapterStatMap = Record<string, { attempted: number; correct: number }>

interface LearningPathProps {
  chapterStats: ChapterStatMap
}

interface PathNode {
  id: string
  label: string
  shortLabel: string
  href: string
  status: 'done' | 'current' | 'locked' | 'boss'
}

export default function LearningPath({ chapterStats }: LearningPathProps) {
  // Determine node status for each chapter
  const nodes: PathNode[] = CHAPTERS.map((ch, idx) => {
    const s = chapterStats[ch.id] ?? { attempted: 0, correct: 0 }
    // A chapter is "done" if answered >= 80% of total (using attempted as proxy since questionCount may be 0)
    // We treat "done" as: has attempted some questions AND correctPct >= 60
    const correctPct = s.attempted > 0 ? (s.correct / s.attempted) * 100 : 0
    const isDone = s.attempted >= 5 && correctPct >= 60

    // Determine which is the current node: first non-done chapter
    let status: PathNode['status'] = 'locked'
    if (isDone) {
      status = 'done'
    } else {
      // Check if all previous chapters are done
      const allPrevDone = CHAPTERS.slice(0, idx).every((prevCh) => {
        const ps = chapterStats[prevCh.id] ?? { attempted: 0, correct: 0 }
        const pPct = ps.attempted > 0 ? (ps.correct / ps.attempted) * 100 : 0
        return ps.attempted >= 5 && pPct >= 60
      })
      if (allPrevDone) {
        // If this node has been attempted at all, it's current (in progress)
        status = s.attempted > 0 ? 'current' : idx === 0 ? 'current' : 'locked'
      }
    }

    return {
      id: ch.id,
      label: ch.title,
      shortLabel: ch.title.length > 8 ? ch.title.slice(0, 7) + '…' : ch.title,
      href: `/quiz/chapter/${ch.id}`,
      status,
    }
  })

  // Boss node
  const allDone = nodes.every((n) => n.status === 'done')
  const bossNode: PathNode = {
    id: 'boss',
    label: '최종 모의고사',
    shortLabel: 'BOSS',
    href: '/quiz/exam',
    status: allDone ? 'current' : 'boss',
  }
  const allNodes = [...nodes, bossNode]

  // If no attempts at all, first node is current
  const hasAnyAttempt = nodes.some((n) => n.status !== 'locked' && n.status !== 'boss')
  if (!hasAnyAttempt) {
    allNodes[0].status = 'current'
  }

  return (
    <div className="q-card">
      <h2 className="text-sm font-bold mb-5" style={{ color: 'var(--q-ink-2)' }}>
        학습 경로
      </h2>

      {/* Path: horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-0 min-w-max mx-auto justify-center">
          {allNodes.map((node, idx) => (
            <div key={node.id} className="flex items-center">
              {/* Node */}
              <NodeBubble node={node} />

              {/* Connector line (not after last) */}
              {idx < allNodes.length - 1 && (
                <div
                  className="h-0.5 w-8 sm:w-12 shrink-0"
                  style={{
                    background:
                      allNodes[idx + 1].status !== 'locked' && allNodes[idx + 1].status !== 'boss'
                        ? '#12B76A'
                        : 'var(--q-border)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NodeBubble({ node }: { node: PathNode }) {
  const isDone = node.status === 'done'
  const isCurrent = node.status === 'current'
  const isLocked = node.status === 'locked'
  const isBoss = node.status === 'boss'

  // Sizing
  const size = isBoss ? 64 : 52
  const fontSize = isBoss ? '1.25rem' : '1rem'

  // Colors
  let bubbleBg: string
  let bubbleBorder: string
  let iconContent: string

  if (isDone) {
    bubbleBg = '#12B76A'
    bubbleBorder = '#039855'
    iconContent = '✓'
  } else if (isCurrent) {
    bubbleBg = '#7F56D9'
    bubbleBorder = '#6941C6'
    iconContent = node.id === 'boss' ? '👑' : '▶'
  } else if (isBoss) {
    bubbleBg = 'linear-gradient(135deg, #FF6B6B, #FFB627)'
    bubbleBorder = '#FF6B6B'
    iconContent = '👑'
  } else {
    // locked
    bubbleBg = 'var(--q-surface-soft)'
    bubbleBorder = 'var(--q-border)'
    iconContent = '🔒'
  }

  const inner = (
    <div className="flex flex-col items-center gap-1">
      <div
        className={isCurrent ? 'q-bounce' : ''}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: bubbleBg,
          border: `2.5px solid ${bubbleBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
          color: isLocked ? 'var(--q-ink-3)' : '#ffffff',
          fontWeight: 700,
          boxShadow: isCurrent ? '0 0 0 6px rgba(127,86,217,0.15)' : undefined,
          transition: 'box-shadow 0.2s',
          cursor: isLocked ? 'not-allowed' : 'pointer',
        }}
      >
        {iconContent}
      </div>
      <span
        className="text-center"
        style={{
          fontSize: '0.65rem',
          maxWidth: size + 16,
          color: isLocked ? 'var(--q-ink-3)' : isCurrent ? '#7F56D9' : 'var(--q-ink-2)',
          fontWeight: isCurrent ? 700 : 500,
          lineHeight: 1.3,
          textAlign: 'center',
        }}
      >
        {node.shortLabel}
      </span>
    </div>
  )

  if (isLocked) {
    return <div className="flex flex-col items-center px-1">{inner}</div>
  }

  return (
    <Link href={node.href} className="flex flex-col items-center px-1 hover:opacity-80 transition-opacity">
      {inner}
    </Link>
  )
}
