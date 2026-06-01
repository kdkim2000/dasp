/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // OPUS-X 기반 퍼플 주색 팔레트
        primary: {
          50:  '#F4F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7F56D9',
          600: '#6941C6',
          700: '#53389E',
          800: '#42307D',
          900: '#2D1E6B',
        },
        mint: {
          50:  '#ECFDF3',
          500: '#12B76A',
          600: '#039855',
        },
        coral:   { DEFAULT: '#FF6B6B', light: '#FFE4E4' },
        sun:     { DEFAULT: '#FFB627', light: '#FFF7ED' },
        ink: {
          DEFAULT: '#101828',
          muted:   '#475467',
          faint:   '#98A2B3',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft:    '#F9FAFB',
          canvas:  '#FBF9FF',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans:    ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono:    ['Roboto Mono', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            pre:  { backgroundColor: '#1C0F40' },
            code: { color: '#DDD6FE' },
          },
        },
      },
      borderRadius: {
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'q-xs': '0 1px 2px 0 rgba(16,24,40,.05)',
        'q-sm': '0 1px 3px 0 rgba(16,24,40,.10), 0 1px 2px 0 rgba(16,24,40,.06)',
        'q-md': '0 4px 8px -2px rgba(16,24,40,.10), 0 2px 4px -2px rgba(16,24,40,.06)',
        'q-lg': '0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
