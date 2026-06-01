# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**DAsP Master** — DAsP(데이터아키텍처 준전문가) 자격증 시험 준비용 웹 사이트.
이론 학습 + 예상문제 풀이 + 모의고사.

## DAsP 시험 구조

| 과목 | 제목 | 문항 |
|------|------|------|
| 1과목 | 전사아키텍처 이해 | 20문항 |
| 2과목 | 데이터 요건 분석 | 20문항 |
| 3과목 | 데이터 표준화 | 20문항 |
| 4과목 | 데이터 모델링 | 20문항 |
| 5과목 | 데이터베이스 설계와 이용 | 20문항 |
| 합계 | | 100문항 / 120분 |

합격 기준: 전체 60점 이상 + 각 과목 40% 이상

## 기술 스택

- **Next.js 14** (Pages Router, TypeScript)
- **Tailwind CSS** — 인디고/블루 팔레트 (primary: #6366F1)
- **React Context + localStorage** — 진도 관리 (`dasp_progress` 키)
- **react-markdown + rehype-highlight** — 이론 렌더링
- **Vitest + jsdom** — 단위 테스트

## 핵심 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # SSG 빌드
npm run lint         # ESLint
npm run type-check   # TypeScript 검사 (tsc --noEmit)
npm run test         # Vitest (1회)
npm run test:watch   # Vitest (watch)
```

## 챕터 레지스트리 (lib/chapters.ts) — 17개

`CHAPTERS` 배열이 유일한 소스. SSG `getStaticPaths`, 네비게이션, 문제 필터 모두 이 배열 참조.

| 챕터 ID | 과목 | 공식 주요항목 제목 |
|---------|------|-----------------|
| `part1_ch1` | 1과목 | 전사아키텍처 개요 |
| `part1_ch2` | 1과목 | 전사아키텍처 구축 |
| `part1_ch3` | 1과목 | 전사아키텍처 관리 및 활용 |
| `part2_ch1` | 2과목 | 정보 요구 사항 개요 |
| `part2_ch2` | 2과목 | 정보 요구 사항 조사 |
| `part2_ch3` | 2과목 | 정보 요구 사항 분석 |
| `part2_ch4` | 2과목 | 정보 요구 검증 |
| `part3_ch1` | 3과목 | 데이터 표준화 개요 |
| `part3_ch2` | 3과목 | 데이터 표준 수립 |
| `part3_ch3` | 3과목 | 데이터 표준 관리 |
| `part4_ch1` | 4과목 | 데이터 모델링 이해 |
| `part4_ch2` | 4과목 | 개념 데이터 모델링 |
| `part4_ch3` | 4과목 | 논리 데이터 모델링 |
| `part4_ch4` | 4과목 | 물리 데이터 모델링 |
| `part5_ch1` | 5과목 | 데이터베이스 설계 |
| `part5_ch2` | 5과목 | 데이터베이스 이용 |
| `part5_ch3` | 5과목 | SQL 응용 |

## 핵심 구조

```
pages/
  index.tsx                    → 대시보드 홈
  theory/index.tsx             → 이론 목차 (5과목 그리드)
  theory/[chapterId].tsx       → 이론 본문 (SSG, 17개 경로)
  quiz/index.tsx               → 문제풀기 허브
  quiz/chapter/[chapterId].tsx → 단원별 풀이 (SSG, 17개 경로)
  quiz/exam.tsx                → 모의고사 (100문항, 120분)
  quiz/result.tsx              → 결과 (5과목별 점수)
  quiz/wrong.tsx               → 오답 노트
  quiz/bookmarks.tsx           → 북마크
components/
  layout/Layout.tsx, TopBar.tsx
  ui/Mascot.tsx, Badge.tsx
  quiz/QuestionCard, AnswerFeedback, QuizNavigator(100문항 그리드), ExamTimer(7200초)
  theory/TheoryContent, TheoryTOC, RelatedQuestions
  dashboard/HeroBanner, LearningPath, ChapterProgress, WeakChapters, WeeklyXP, ProgressChart
lib/
  chapters.ts   → CHAPTERS(17개), CHAPTER_IDS, PART_TITLES
  questions.ts  → getAllQuestions, sampleExamQuestions(100문항)
  theory.ts     → getChapterContent
  progress.ts   → loadProgress/saveProgress (dasp_progress)
context/ProgressContext.tsx    → useProgress hook
types/index.ts                 → Question(part: 1|2|3|4|5), ProgressStore, ExamResult, Stats
data/
  theory/part{1-5}_ch{1-4}.md       → 17개 이론 파일
  questions/part{1-5}_ch{1-4}.json  → 17개 문제 파일
  questions/mockexam/exam1.json     → 모의고사 1회 (100문항)
  questions/mockexam/exam2.json     → 모의고사 2회 (100문항)
scripts/validate-questions.ts       → JSON 스키마 검증 (p[1-5]c[1-4]_\d{3})
docs/plans/                         → 개선 계획 문서
```

## 핵심 데이터 패턴

- 이론·문제 페이지: `getStaticPaths` + `getStaticProps`로 SSG
- `localStorage` 접근 전 반드시 `typeof window !== 'undefined'` 가드
- **두 가지 ID 형식**:
  - 파일명/라우팅: `part2_ch4` (언더스코어)
  - 문제 JSON id: `p2c4_001` (`p{과목}c{챕터}_{3자리}`)
  - 모의고사 id: `exam1_001`, `exam2_001`
- `part: 1 | 2 | 3 | 4 | 5` (5과목 지원)
- `chapter: number` (1~4, 과목에 따라 다름)
- 모의고사: 100문항, ExamTimer 7200초(120분)
- 다크모드: CSS 변수(`--q-bg` 등) + `[data-theme="dark"]`, `localStorage('q-theme')`
