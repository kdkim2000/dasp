interface BadgeProps {
  type: 'streak' | 'gem' | 'heart' | 'xp'
  value: number
  size?: 'sm' | 'md'
}

const CONFIG = {
  streak: {
    icon: '🔥',
    label: '연속',
    bg: '#FFF7ED',
    text: '#C2410C',
    border: '#FED7AA',
  },
  gem: {
    icon: '💎',
    label: '젬',
    bg: '#F4F3FF',
    text: '#53389E',
    border: '#DDD6FE',
  },
  heart: {
    icon: '❤️',
    label: '하트',
    bg: '#FFF1F2',
    text: '#BE123C',
    border: '#FECDD3',
  },
  xp: {
    icon: '⚡',
    label: 'XP',
    bg: '#FFF7ED',
    text: '#92400E',
    border: '#FED7AA',
  },
} as const

export default function Badge({ type, value, size = 'md' }: BadgeProps) {
  const cfg = CONFIG[type]
  const padding = size === 'sm' ? '2px 8px' : '4px 12px'
  const fontSize = size === 'sm' ? '0.75rem' : '0.875rem'
  const iconSize = size === 'sm' ? '0.85rem' : '1rem'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        borderRadius: '9999px',
        padding,
        fontSize,
        fontWeight: 700,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: iconSize, lineHeight: 1 }}>{cfg.icon}</span>
      <span>{value}</span>
      {size === 'md' && (
        <span style={{ fontWeight: 400, opacity: 0.75, fontSize: '0.75rem' }}>{cfg.label}</span>
      )}
    </span>
  )
}
