interface MascotProps {
  size?: number
  expression?: 'happy' | 'thinking' | 'excited'
  className?: string
}

export default function Mascot({ size = 80, expression = 'happy', className = '' }: MascotProps) {
  // Eye shapes per expression
  const eyes = {
    happy: (
      <>
        {/* Left eye - arc (happy closed) */}
        <path d="M30 34 Q33 30 36 34" stroke="#53389E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Right eye - arc */}
        <path d="M44 34 Q47 30 50 34" stroke="#53389E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
    thinking: (
      <>
        {/* Left eye - small circle */}
        <circle cx="33" cy="33" r="2.5" fill="#53389E" />
        {/* Right eye - small circle */}
        <circle cx="47" cy="33" r="2.5" fill="#53389E" />
        {/* Thinking brow */}
        <path d="M29 28 Q33 26 37 28" stroke="#53389E" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
    excited: (
      <>
        {/* Left eye - star shape via two lines */}
        <circle cx="33" cy="33" r="3.5" fill="#53389E" />
        <circle cx="33" cy="33" r="1.5" fill="#DDD6FE" />
        {/* Right eye */}
        <circle cx="47" cy="33" r="3.5" fill="#53389E" />
        <circle cx="47" cy="33" r="1.5" fill="#DDD6FE" />
      </>
    ),
  }

  // Mouth shapes per expression
  const mouths = {
    happy: <path d="M34 42 Q40 48 46 42" stroke="#53389E" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
    thinking: <path d="M35 43 Q40 43 45 43" stroke="#53389E" strokeWidth="2" fill="none" strokeLinecap="round" />,
    excited: <path d="M33 41 Q40 50 47 41" stroke="#53389E" strokeWidth="2.5" fill="#DDD6FE" strokeLinecap="round" />,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Shadow */}
      <ellipse cx="40" cy="75" rx="18" ry="4" fill="#53389E" opacity="0.12" />

      {/* Tail */}
      <path
        d="M58 55 Q72 50 70 40 Q68 32 62 38"
        stroke="#6941C6"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Left wing */}
      <path
        d="M22 42 Q8 34 10 22 Q18 28 24 36"
        fill="#A78BFA"
        stroke="#7F56D9"
        strokeWidth="1"
      />
      {/* Wing detail */}
      <path d="M16 26 Q20 32 24 36" stroke="#7F56D9" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

      {/* Body */}
      <ellipse cx="40" cy="55" rx="16" ry="14" fill="#7F56D9" />

      {/* Belly */}
      <ellipse cx="40" cy="57" rx="10" ry="9" fill="#DDD6FE" />

      {/* Head */}
      <circle cx="40" cy="32" r="20" fill="#7F56D9" />

      {/* Left horn */}
      <path d="M28 16 L23 5 L30 14" fill="#6941C6" stroke="#53389E" strokeWidth="0.5" />
      {/* Right horn */}
      <path d="M52 16 L57 5 L50 14" fill="#6941C6" stroke="#53389E" strokeWidth="0.5" />

      {/* Ear left */}
      <circle cx="22" cy="22" r="5" fill="#6941C6" />
      {/* Ear right */}
      <circle cx="58" cy="22" r="5" fill="#6941C6" />

      {/* Face highlight */}
      <circle cx="40" cy="32" r="16" fill="#8F66E4" opacity="0.3" />

      {/* Cheek blush left */}
      <ellipse cx="26" cy="39" rx="5" ry="3" fill="#F4A0C0" opacity="0.4" />
      {/* Cheek blush right */}
      <ellipse cx="54" cy="39" rx="5" ry="3" fill="#F4A0C0" opacity="0.4" />

      {/* Eyes */}
      {eyes[expression]}

      {/* Mouth */}
      {mouths[expression]}

      {/* Sparkle (excited only) */}
      {expression === 'excited' && (
        <>
          <path d="M62 18 L63.5 14 L65 18 L69 19.5 L65 21 L63.5 25 L62 21 L58 19.5 Z" fill="#FFB627" opacity="0.9" />
          <path d="M14 30 L15 27 L16 30 L19 31 L16 32 L15 35 L14 32 L11 31 Z" fill="#FFB627" opacity="0.7" />
        </>
      )}

      {/* Thinking bubble (thinking only) */}
      {expression === 'thinking' && (
        <>
          <circle cx="62" cy="18" r="3" fill="#DDD6FE" opacity="0.8" />
          <circle cx="67" cy="12" r="2" fill="#DDD6FE" opacity="0.6" />
          <circle cx="71" cy="7" r="1.5" fill="#DDD6FE" opacity="0.4" />
        </>
      )}
    </svg>
  )
}
