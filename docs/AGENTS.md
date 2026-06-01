# AGENTS — SQLD 사이트 개발 에이전트 정의서

## 개요

이 프로젝트는 **9개의 전문 서브에이전트**로 분업한다. 각 에이전트는 소유 파일과 책임 범위가 명확히 구분되며, 의존 관계에 따라 순차 또는 병렬로 실행된다.

---

## 실행 단계 및 병렬성

```
Phase 0 ─────────────────────────────────────────── [Scaffold]
                        │
          ┌─────────────┴──────────────┐
Phase 1   │                            │  (병렬)
  [PDF Extract]                  [Foundation]    ← PDF 있을 때
  [Content]  ←────────────────── (PDF 없을 때, 대체 실행)
          │                            │
          └─────────────┬──────────────┘
                        │
Phase 2 ─────────────────────────────────────────── [Layout]
                        │
          ┌─────────────┴──────────────┐
Phase 3   │                            │  (병렬)
       [Quiz]                      [Theory]
          │                            │
          └─────────────┬──────────────┘
                        │
Phase 4 ─────────────────────────────────────────── [Dashboard]
                        │
Phase 5 ─────────────────────────────────────────── [QA]
                        │
Phase 6 ─────────────────────────────────────────── [Quest Mode 디자인 개편] (선택)
```

---

## 에이전트별 상세 정의

---

### Agent 0 — Orchestrator (오케스트레이터)

**한 줄 요약**: 전체 개발 흐름을 조율하고, 에이전트 간 출력물을 검증하며 다음 단계로 넘긴다.

**책임**
- 각 Phase 시작 전 선행 에이전트 산출물 완료 확인
- 에이전트 간 인터페이스(타입, 파일명 규약) 일관성 유지
- 빌드 오류 발생 시 원인 에이전트 식별 및 재실행 지시
- `CLAUDE.md`, `docs/` 문서 최신 상태 유지

**소유 파일**
```
CLAUDE.md
docs/AGENTS.md
docs/PRD.md
docs/ARCHITECTURE.md
```

**선행 조건**: 없음 (전 기간 상주)

**출력**: 각 Phase 완료 체크리스트 + 최종 배포 승인

---

### Agent 1 — Scaffold (스캐폴더)

**한 줄 요약**: 실행 가능한 빈 Next.js 프로젝트 골격을 만든다.

**책임**
- `npx create-next-app` 실행 및 옵션 설정
- 추가 패키지 설치: `react-markdown`, `rehype-highlight`, `rehype-raw`, `remark-gfm`
- Tailwind CSS 설정 (`tailwind.config.js`, `globals.css`)
- ESLint 규칙 설정 (`.eslintrc.json`)
- 디렉토리 구조 사전 생성 (`data/`, `context/`, `lib/`, `types/`)

**소유 파일**
```
package.json
tsconfig.json
next.config.js
tailwind.config.js
postcss.config.js
.eslintrc.json
styles/globals.css
pages/_app.tsx        ← Provider 연결 placeholder
pages/_document.tsx
```

**선행 조건**: 없음

**출력**: `npm run dev` 가 에러 없이 실행되는 빈 프로젝트

**검증 기준**
```bash
npm run dev    # 정상 실행
npm run lint   # 0 errors
```

---

### Agent 9 — PDF Extractor (PDF 기반 콘텐츠 추출)

**한 줄 요약**: `docs/contents/` 의 SQLD 원본 PDF를 읽어 이론 마크다운과 문제 JSON을 자동 생성한다.

**책임**
- 이론 PDF 5개를 `data/theory/*.md`로 변환 (구조 보존, SQL 코드블록, 출제포인트 섹션 포함)
- 예상문제 PDF 2개에서 문제를 추출하여 챕터별 `data/questions/*.json`으로 분배
- PDF 문항 부족 시 PDF 이론 내용을 바탕으로 유사 문제 직접 생성

**소유 파일**
```
data/theory/          ← content-writer와 동일 (대체 관계)
data/questions/       ← content-writer와 동일 (대체 관계)
```

**PDF ↔ 출력 매핑**
```
Part_2_SQLD_Chapter_1_데이터모델링의이해.pdf  →  data/theory/part1_ch1.md
Part_2_SQLD_Chapter_2_데이터모델과성능.pdf    →  data/theory/part1_ch2.md
Part_2_SQLD_Chapter_3_SQL기본.pdf             →  data/theory/part2_ch1.md
Part_2_SQLD_Chapter_4_SQL활용.pdf             →  data/theory/part2_ch2.md
Part_2_SQLD_Chapter_5_SQL 최적화 기본 원리.pdf →  data/theory/part2_ch3.md
Part_3_SQLD출제예상문제_1회.pdf               →  data/questions/*.json (전 챕터 분배)
Part_3_SQLD출제예상문제_2회.pdf               →  data/questions/*.json (전 챕터 분배)
```

**선행 조건**: Agent 1 완료 (디렉토리 구조)

**출력**: 총 120문항 이상 + 5개 이론 챕터 파일 (PDF 원본 기반)

**검증 기준**
- 이론 파일: `## ` 섹션 3개 이상
- JSON: 유효한 형식, id 중복 없음, answer 0~3, explanation 50자 이상
- `/validate-data` 통과

> **content-writer와 관계**: `docs/contents/` PDF가 존재할 때는 Agent 9를 먼저 실행한다. PDF가 없거나 추가 보완이 필요할 때 Agent 2(content-writer)를 사용한다.

---

### Agent 2 — Content Writer (콘텐츠 작성)

**한 줄 요약**: SQLD 시험 범위에 맞는 이론 마크다운과 문제 JSON 데이터를 작성한다.

**책임**
- 1과목/2과목 전 챕터 이론 본문 작성 (마크다운, SQL 코드 블록 포함)
- 각 챕터별 예상 문제 JSON 작성 (챕터당 최소 20문항)
- 문제 ID 규칙 준수: `p{과목번호}c{챕터번호}_{3자리일련번호}` (예: `p2c1_001`)
- 해설은 반드시 포함, 태그(`tags`) 최소 1개 이상

**소유 파일**
```
data/theory/
  part1_ch1.md    ← 1과목 1장: 데이터 모델링의 이해
  part1_ch2.md    ← 1과목 2장: 데이터 모델과 SQL
  part2_ch1.md    ← 2과목 1장: SQL 기본
  part2_ch2.md    ← 2과목 2장: SQL 활용
  part2_ch3.md    ← 2과목 3장: 관리 구문

data/questions/
  part1_ch1.json  ← 1과목 1장 문제 (20문항 이상)
  part1_ch2.json  ← 1과목 2장 문제 (20문항 이상)
  part2_ch1.json  ← 2과목 1장 문제 (30문항 이상)
  part2_ch2.json  ← 2과목 2장 문제 (30문항 이상)
  part2_ch3.json  ← 2과목 3장 문제 (20문항 이상)
```

**선행 조건**: Agent 1 완료 (디렉토리 구조)

**출력**: 총 120문항 이상 + 5개 이론 챕터 파일

**검증 기준**
- JSON 파일이 유효한 JSON 형식
- 모든 문제에 `id`, `part`, `chapter`, `content`, `options`(4개), `answer`, `explanation` 포함
- `answer` 인덱스가 `options` 범위(0-3) 이내

---

### Agent 3 — Foundation Builder (기반 구축)

**한 줄 요약**: 모든 에이전트가 공유하는 타입, 유틸 함수, 전역 상태를 구현한다.

**책임**
- TypeScript 공통 인터페이스 정의
- `localStorage` 읽기/쓰기 유틸 (SSR 가드 포함)
- 문제 데이터 로드·필터 함수
- 이론 데이터 로드 함수
- `ProgressContext` 전역 상태 구현 (게이미피케이션 메서드 포함)

**소유 파일**
```
types/index.ts
  ├── Question
  ├── ProgressStore
  ├── ExamResult
  ├── ChapterMeta
  └── QuizMode ('chapter' | 'exam' | 'wrong' | 'bookmarks')

lib/questions.ts
  ├── getAllQuestions(): Question[]
  ├── getQuestionsByChapter(chapterId): Question[]
  ├── getQuestionsByIds(ids): Question[]
  └── sampleExamQuestions(): Question[]   ← 1과목 10 + 2과목 40 랜덤 샘플링

lib/theory.ts
  ├── getAllChapters(): ChapterMeta[]
  └── getChapterContent(id): string       ← .md 파일 읽기 (서버사이드 전용)

lib/progress.ts
  ├── loadProgress(): ProgressStore
  ├── saveProgress(store): void
  ├── markAnswer(id, result): void
  ├── toggleBookmark(id): void
  └── getStats(): Stats                   ← 챕터별·과목별 정답률 계산

context/ProgressContext.tsx
  ├── ProgressProvider
  ├── useProgress() hook
  ├── 초기 로드: useEffect → localStorage
  ├── getStreak() → number  (examHistory.length 기반, UI-only)
  ├── getXP() → number      (correct * 10, UI-only)
  ├── getGems() → number    (examHistory.length * 50, UI-only)
  └── getHearts() → number  (고정값 3, UI-only)
```

**선행 조건**: Agent 1 완료

**출력**: 다른 에이전트가 `import`할 수 있는 완성된 공유 레이어

**검증 기준**
```bash
npx tsc --noEmit   # 타입 오류 0개
```

---

### Agent 4 — Layout Builder (레이아웃)

**한 줄 요약**: TopBar 기반 단일 네비게이션 레이아웃과 게이미피케이션 배지를 구현한다.

**책임**
- TopBar 구현: 브랜드 로고, 상단 네비게이션 링크, 게이미피케이션 배지 (스트릭/보석/하트), 다크모드 토글
- `Layout.tsx`: TopBar + main 전체폭 구조 (사이드바 없음)
- `_app.tsx`에 `ProgressProvider` + `Layout` 래핑 연결
- OPUS-X 퍼플 팔레트 기반 Tailwind 공통 색상 확정
- CSS 변수 기반 다크모드 지원 (`[data-theme="dark"]` 선택자)

**소유 파일**
```
components/layout/
  Layout.tsx       ← TopBar + main 구조 (사이드바 제거)
  TopBar.tsx       ← 브랜드 + 네비 + 게이미피케이션 배지 + 다크모드 토글
  Sidebar.tsx      ← (레거시, 사용 안 함)
  Header.tsx       ← (레거시, 사용 안 함)

pages/_app.tsx     ← ProgressProvider + Layout 최종 연결
```

**선행 조건**: Agent 3 완료 (`ProgressContext` import)

**출력**: 어느 페이지든 `<Layout>`으로 감싸면 TopBar가 포함된 일관된 UI가 나오는 쉘

---

### Agent 5 — Quiz Feature Builder (문제풀이 기능)

**한 줄 요약**: 4가지 풀이 모드(단원별/모의고사/오답/북마크)와 퀴즈 결과 화면을 포함한 모든 컴포넌트를 구현한다.

**책임**

| 컴포넌트/페이지 | 주요 기능 |
|---|---|
| `QuestionCard` | 문제 본문(마크다운) + 4지선다 보기 렌더링, 선택 상태 표시 |
| `AnswerFeedback` | 정답/오답 결과 + 해설 공개, 북마크 토글 버튼 |
| `QuizNavigator` | 문제 번호 그리드, 풀이 상태 색상 표시 (미풀이/정답/오답) |
| `ExamTimer` | 90분 카운트다운, 10분 남으면 경고, 0초 시 자동 제출 |
| `quiz/index` | 4가지 모드 선택 메뉴, 챕터별 진도율 미리보기 |
| `quiz/chapter/[id]` | 단원별 순서 풀이, `getStaticPaths`로 SSG |
| `quiz/exam` | 랜덤 50문항 모의고사, 결과 저장 |
| `quiz/result` | 퀴즈 완료 결과 화면 (별/XP/보석 UI-only 표시) |
| `quiz/wrong` | localStorage 오답 목록 로드 후 재풀이 |
| `quiz/bookmarks` | localStorage 북마크 목록 로드 후 풀이 |

**소유 파일**
```
components/quiz/
  QuestionCard.tsx
  AnswerFeedback.tsx
  QuizNavigator.tsx
  ExamTimer.tsx

pages/quiz/
  index.tsx
  chapter/[chapterId].tsx
  exam.tsx
  result.tsx              ← 퀴즈 완료 결과 화면 (별/XP/보석 UI-only)
  wrong.tsx
  bookmarks.tsx
```

**선행 조건**: Agent 3 (타입·유틸), Agent 4 (레이아웃)

**출력**: 6개 퀴즈 페이지가 모두 동작하는 문제풀이 기능

**검증 기준**
- 보기 선택 → 정답 여부 표시 → 해설 공개 흐름 동작
- `ProgressContext.markAnswer` 호출 후 localStorage에 반영
- 모의고사 타이머 종료 시 결과 저장 후 `result.tsx`로 이동

---

### Agent 6 — Theory Feature Builder (이론 학습 기능)

**한 줄 요약**: 챕터별 이론 본문 렌더링, 자동 목차, 관련 문제 미리보기를 포함한 3열 레이아웃을 구현한다.

**책임**
- 마크다운 → HTML 렌더링 (SQL 코드 블록 신택스 하이라이팅, 보라색 코드 블록 스타일 포함)
- 챕터 목차 페이지: 과목별 그룹핑, 진도율 배지 표시
- `TheoryTOC`: 마크다운 헤딩 파싱 기반 자동 목차 + 스크롤 스파이
- `RelatedQuestions`: 동일 챕터 관련 문제 미리보기 + Querymon 팁 표시
- `getStaticPaths` / `getStaticProps`로 SSG 빌드
- 챕터 페이지 3열 레이아웃: TOC(좌) + 본문(중) + 관련문제(우)

**소유 파일**
```
components/theory/
  TheoryContent.tsx      ← 헤딩 id 자동 부여, 보라색 코드 블록
  TheoryTOC.tsx          ← 자동 목차 + 스크롤 스파이
  RelatedQuestions.tsx   ← 관련 문제 미리보기 + Querymon 팁

pages/theory/
  index.tsx              ← 전체 목차 (과목별 그룹핑)
  [chapterId].tsx        ← 3열 레이아웃 (TOC + 본문 + 관련문제)
```

**선행 조건**: Agent 3 (유틸), Agent 4 (레이아웃), Agent 2 또는 9 (`.md` 파일)

**출력**: `/theory` 및 `/theory/[id]` 경로가 완전히 동작하는 이론 기능

**검증 기준**
- `npm run build` 시 `[chapterId]` SSG 경로 5개 생성 확인
- SQL 코드 블록에 신택스 하이라이팅 적용 확인
- 챕터 페이지에서 TOC 스크롤 스파이 동작 확인

---

### Agent 7 — Dashboard Builder (대시보드)

**한 줄 요약**: Quest Mode 메인 대시보드 — 히어로 배너, 마스코트, 학습 경로 버블, 주간 XP 차트를 구현한다.

**책임**
- Querymon SVG 마스코트 컴포넌트 (레벨별 표정/색상)
- 게이미피케이션 배지: 스트릭/보석/하트/XP (TopBar와 공유)
- 퍼플 그래디언트 히어로 배너 (마스코트 + 오늘의 퀘스트 메시지)
- 챕터 버블 경로 시각화 (완료/진행중/미시작 상태 색상 표시)
- 마스코트 카드 (현재 레벨 + 학습 팁)
- 주간 XP 막대 차트 (7일 기준)
- 기존 ProgressChart, WeakChapters, ChapterProgress 컴포넌트 유지

**소유 파일**
```
components/ui/
  Mascot.tsx             ← Querymon SVG 마스코트
  Badge.tsx              ← 스트릭/보석/하트/XP 배지

components/dashboard/
  HeroBanner.tsx         ← 퍼플 그래디언트 히어로 배너
  LearningPath.tsx       ← 챕터 버블 경로 시각화
  MascotCard.tsx         ← 마스코트 카드 (레벨 + 팁)
  WeeklyXP.tsx           ← 주간 XP 막대 차트
  ProgressChart.tsx      ← (기존 유지) 과목별 정답률 시각화
  WeakChapters.tsx       ← (기존 유지) 취약 챕터 카드
  ChapterProgress.tsx    ← (기존 유지) 챕터 진도율

pages/index.tsx          ← Quest Mode 대시보드 메인
```

**선행 조건**: Agent 3 (`getStats()`, `getStreak()`, `getXP()`, `getGems()`, `getHearts()`), Agent 4 (레이아웃), Agent 5, 6 (전체 데이터 구조 확정 후)

**출력**: `/` 경로 Quest Mode 대시보드 페이지 완성

---

### Agent 8 — QA (품질보증)

**한 줄 요약**: 전체 빌드 검증, 타입 오류·린트 오류 해소, 주요 흐름 통합 점검을 수행한다.

**책임**
- `npm run build` 성공 확인 및 오류 수정
- `npx tsc --noEmit` 타입 오류 0개 확인
- `npm run lint` ESLint 오류 0개 확인
- `localStorage` SSR 가드 누락 점검
- 문제 JSON 스키마 일관성 검증 스크립트 실행
- `getStaticPaths`가 모든 챕터 경로를 올바르게 생성하는지 확인
- Quest Mode UI 요소 (배지, 배너, 버블 등) 렌더링 오류 점검

**소유 파일**
```
scripts/validate-questions.ts   ← JSON 스키마 검증 스크립트
```

**선행 조건**: 모든 에이전트(1~7) 완료

**출력**: `npm run build` 통과 + 이슈 없음 리포트

**검증 기준**
```bash
npx tsc --noEmit    # 0 errors
npm run lint        # 0 errors
npm run build       # 성공 (exit 0)
```

---

## 에이전트 간 계약 (인터페이스)

에이전트 경계에서 주고받는 핵심 약속:

| 제공자 | 수신자 | 계약 내용 |
|--------|--------|---------|
| Agent 1 (Scaffold) | 전체 | `npm run dev` 실행 가능한 프로젝트 골격 |
| Agent 9 (PDF Extractor) | Agent 6 (Theory), Agent 5 (Quiz) | `data/` 파일 존재 + ID 규칙 준수 (PDF 기반) |
| Agent 2 (Content) | Agent 6 (Theory), Agent 5 (Quiz) | `data/` 파일 존재 + ID 규칙 준수 (수동 생성, Agent 9 대체) |
| Agent 3 (Foundation) | Agent 4, 5, 6, 7 | `types/index.ts` export 타입, `useProgress()` hook, 게이미피케이션 메서드 |
| Agent 4 (Layout) | Agent 5, 6, 7 | `<Layout>` 컴포넌트 (TopBar 포함), `_app.tsx` Provider 연결 완료 |
| Agent 5 (Quiz) | Agent 7 (Dashboard) | `QuizMode` 타입, `ProgressContext` 상태 구조 확정 |
| Agent 6 (Theory) | Agent 7 (Dashboard) | `ChapterMeta` 타입, 챕터 목록 확정 |
| Agent 7 (Dashboard) | Agent 4 (Layout/TopBar) | `Badge.tsx`, `Mascot.tsx` 공유 컴포넌트 (`components/ui/`) |

---

## 에이전트 프롬프트 작성 원칙

각 에이전트를 Claude Code로 실행할 때 프롬프트에 반드시 포함해야 할 항목:

1. **역할 선언**: "당신은 [에이전트명] 입니다. 담당 파일만 수정하세요."
2. **참조 문서**: `docs/ARCHITECTURE.md`, `docs/PRD.md` 경로 명시
3. **소유 파일 목록**: 수정 가능한 파일 명시적 열거
4. **금지 파일**: 다른 에이전트 소유 파일 수정 금지
5. **검증 기준**: 완료 조건 명시 (빌드 성공, 타입 오류 0 등)
6. **선행 산출물**: 의존하는 파일/타입이 이미 존재한다고 가정
