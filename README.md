# SQLD 합격길잡이 🎓

SQLD(SQL Developer) 자격증 시험 준비를 위한 **웹 기반 학습 플랫폼**입니다.  
이론 학습 + 예상문제 풀이 + 모의고사를 한 곳에서 제공합니다.

**🔗 라이브 데모:** (배포 대기 중)

---

## 📖 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **용도** | SQLD 시험 준비 |
| **학습 범위** | 1과목(데이터모델링) + 2과목(SQL) |
| **총 문항** | 100문항 |
| **주요 기능** | 이론 학습, 단원별 풀이, 모의고사, 오답 재풀이, 북마크 |
| **진도 추적** | localStorage 기반 (로그인 불필요) |
| **배포 환경** | Vercel |

---

## 🚀 빠른 시작

### 설치
```bash
# 저장소 클론
git clone https://github.com/kdkim2000/sqld.git
cd sqld

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 접속
```
http://localhost:3000
```

### 빌드 & 배포
```bash
# 타입 검사 + ESLint + 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

---

## 🎯 주요 기능

### 📚 이론 학습
- **5개 챕터** — 데이터모델링 + SQL 기본·활용·최적화
- **마크다운 기반** — 표, 코드블록, 예시 포함
- **진도 추적** — 각 챕터 학습 이력 기록

```
1과목 데이터모델링
├─ 1장: 데이터모델링의 이해
└─ 2장: 데이터 모델과 성능

2과목 SQL
├─ 1장: SQL 기본
├─ 2장: SQL 활용
└─ 3장: SQL 최적화 기본 원리
```

### 🎯 문제 풀이
- **단원별 풀기** — 각 챕터별로 순차 풀이
- **모의고사** — 50문항 + 90분 타이머 (실제 시험과 동일)
- **오답 재풀이** — 틀린 문제만 모아서 학습
- **북마크** — 중요 문제 따로 정리

**채점 기준:**
```
합격 조건:
- 총점 60점 이상
- 1과목 40점 이상 (과락 방지)
- 2과목 40점 이상 (과락 방지)
```

### 📊 학습 대시보드
- **정답률** — 전체 정답률 원형 차트
- **과목별 진도** — 1과목/2과목 진도 바
- **취약 단원** — 정답률 낮은 상위 3개 챕터
- **학습 기록** — 모의고사 이력 (최근 10개)

### 🔖 학습 도구
- **숫자 단축키** — 선택지 1~4 빠르게 선택 (1키, 2키, 3키, 4키)
- **타이머** — 모의고사 시간 추적 (시간 초과 시 자동 제출)
- **문제 네비게이터** — 문제 번호 그리드로 풀이 상태 시각화

---

## 🛠 기술 스택

### 프론트엔드
- **Next.js 14** (Pages Router, SSG)
- **TypeScript** — 타입 안전성
- **Tailwind CSS** — 반응형 스타일링
- **React Context** — 전역 상태 관리

### 콘텐츠
- **Markdown** — 이론 콘텐츠
- **JSON** — 문제 데이터
- **react-markdown + rehype-highlight** — 마크다운 렌더링

### 저장소
- **localStorage** — 진도 추적 (서버/DB 불필요)
- **SSG** — 18개 정적 페이지 사전 생성

### 배포
- **Vercel** — Next.js 최적화 호스팅

---

## 📁 프로젝트 구조

```
sqld/
├── pages/
│   ├── _app.tsx              ← ProgressProvider + Layout 래핑
│   ├── _document.tsx
│   ├── index.tsx             ← 대시보드 홈
│   ├── theory/
│   │   ├── index.tsx         ← 이론 목차
│   │   └── [chapterId].tsx   ← 이론 본문 (SSG)
│   └── quiz/
│       ├── index.tsx         ← 문제풀기 허브
│       ├── chapter/[chapterId].tsx  ← 단원별 풀이 (SSG)
│       ├── exam.tsx          ← 모의고사 (90분)
│       ├── wrong.tsx         ← 오답 재풀이
│       └── bookmarks.tsx     ← 북마크 문제
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx        ← 상단 네비게이션
│   │   ├── Sidebar.tsx       ← 좌측 챕터 목록
│   │   └── Layout.tsx        ← 2컬럼 레이아웃
│   ├── theory/
│   │   └── TheoryContent.tsx ← 마크다운 렌더링
│   ├── quiz/
│   │   ├── QuestionCard.tsx  ← 문제 카드
│   │   ├── AnswerFeedback.tsx ← 정답/오답 피드백
│   │   ├── QuizNavigator.tsx ← 문제 그리드
│   │   └── ExamTimer.tsx     ← 타이머
│   └── dashboard/
│       ├── ProgressChart.tsx ← 정답률 원형 차트
│       ├── ChapterProgress.tsx ← 진도 바
│       └── WeakChapters.tsx  ← 취약 단원
│
├── lib/
│   ├── questions.ts          ← 문제 로드/필터링
│   ├── theory.ts             ← 이론 콘텐츠 로드
│   └── progress.ts           ← localStorage 진도 관리
│
├── context/
│   └── ProgressContext.tsx   ← useProgress 훅
│
├── types/
│   └── index.ts              ← TypeScript 인터페이스
│
├── data/
│   ├── questions/
│   │   ├── part1_ch1.json    ← 1과목 1장 (20문항)
│   │   ├── part1_ch2.json    ← 1과목 2장 (15문항)
│   │   ├── part2_ch1.json    ← 2과목 1장 (30문항)
│   │   ├── part2_ch2.json    ← 2과목 2장 (25문항)
│   │   └── part2_ch3.json    ← 2과목 3장 (10문항)
│   └── theory/
│       ├── part1_ch1.md      ← 이론 마크다운 (×5)
│       ├── part1_ch2.md
│       ├── part2_ch1.md
│       ├── part2_ch2.md
│       └── part2_ch3.md
│
├── styles/
│   └── globals.css           ← Tailwind + 커스텀 스타일
│
├── docs/
│   ├── WORKPLAN.md           ← 구축 계획
│   ├── AGENTS.md             ← AI 에이전트 역할
│   ├── ARCHITECTURE.md       ← 아키텍처 설명
│   └── journal/              ← 개발 기록
│
├── CLAUDE.md                 ← 개발자 가이드
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🔄 데이터 흐름

### 학습 진도 추적
```
사용자 선택지 선택
    ↓
QuestionCard 컴포넌트 → handleAnswer 호출
    ↓
ProgressContext.markAnswer()
    ↓
lib/progress.ts → localStorage 저장
    ↓
getStats() 계산 (정답률, 진도 등)
    ↓
Dashboard에 반영
```

### 모의고사 플로우
```
시험 준비 화면 (90분 타이머 설정)
    ↓
문제 풀이 (50문항, 선택지 선택)
    ↓
제출 버튼
    ↓
채점 (정답/오답 계산)
    ↓
결과 화면 (합격/불합격, 과목별 점수, 이력 저장)
```

---

## 📊 통계

### 콘텐츠
| 항목 | 수량 |
|------|------|
| 총 문항 | 100개 |
| 1과목 문항 | 35개 |
| 2과목 문항 | 65개 |
| 이론 마크다운 | 5개 파일 (2,337줄) |
| 평균 문제 난이도 | 중(50%), 하(25%), 상(25%) |

### 기술
| 항목 | 수량 |
|------|------|
| React 컴포넌트 | 11개 |
| Next.js 페이지 | 9개 |
| SSG 경로 | 18개 |
| TypeScript 파일 | 20+ |
| 번들 크기 | 112 KB (공유) |
| First Load JS | 105~249 KB |

---

## 🧪 개발 명령어

```bash
# 개발 서버 (hot reload)
npm run dev

# 타입 검사
npx tsc --noEmit

# ESLint 검사
npm run lint

# 전체 빌드 (tsc + lint + next build)
npm run build

# 프로덕션 서버
npm run start

# 문제 데이터 검증
/validate-data

# 저널 기록
/log "작업 내용"
```

---

## 📱 반응형 디자인

### 모바일 (375px)
- 사이드바 고정 숨김 + 햄버거 메뉴
- 세로 스택 레이아웃
- 터치 친화적 버튼

### 태블릿 (768px)
- 사이드바 토글 지원
- 2단 그리드

### 데스크톱 (1440px)
- 사이드바 항상 표시 (256px fixed)
- 2컬럼 + 3열 그리드
- 최적의 가독성

---

## 🔐 데이터 보안

### localStorage 사용
- **장점**: 로그인 불필요, 즉시 시작
- **단점**: 기기별 독립적 저장 (동기화 불가)

### 향후 개선
```typescript
// 클라우드 동기화 (v2.0)
- Firebase / Supabase 인증
- 멀티탭 localStorage 동기화
- 모바일 앱 연동
```

---

## 🐛 알려진 제한사항

1. **기기별 독립 저장** — 다른 기기에서 진도 불러오기 불가
2. **브라우저 캐시 삭제 시** — 진도 초기화
3. **오프라인 미지원** — 네트워크 필요
4. **마크다운 수식** — LaTeX 미지원 (향후 추가 예정)

---

## 🎓 학습 팁

### 효과적인 학습 방법
1. **이론 먼저** — `/theory` 각 챕터 숙독
2. **단원별 풀이** — `/quiz` → 각 챕터별로 순차 진행
3. **오답 집중** — `/quiz/wrong` 에서 틀린 문제 반복
4. **모의고사** — `/quiz/exam` 으로 최종 점검
5. **북마크 활용** — 중요/어려운 문제 표시

### 합격 기준 달성
- **목표**: 총점 60점 이상 + 각 과목 40점 이상
- **소요 기간**: 일일 2~3시간 × 4주
- **추천 일정**: 주중 5일 학습 + 주말 모의고사

---

## 📞 지원

### 문제 발생 시
1. 이슈 생성: [GitHub Issues](https://github.com/kdkim2000/sqld/issues)
2. PR 제출: 개선 제안 환영

### 피드백
- 기능 요청
- UI/UX 개선
- 콘텐츠 오류 신고

---

## 📄 라이선스

MIT License — 자유로운 사용, 수정, 배포 가능

---

## 🙏 감사의 말

- SQLD 시험 범위 기반 문제 및 이론 구성
- Next.js, React, Tailwind 오픈소스 커뮤니티
- Claude AI로 코드 생성 및 검증

---

## 🔗 링크

- **GitHub**: https://github.com/kdkim2000/sqld
- **공식 SQLD**: https://www.ksda.or.kr/
- **Next.js 문서**: https://nextjs.org/docs

---

**마지막 업데이트**: 2026-05-05  
**버전**: 1.0.0  
**상태**: ✅ 배포 준비 완료
