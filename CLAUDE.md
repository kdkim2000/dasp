# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 처음 시작하기

**👉 [`docs/WORKPLAN.md`](docs/WORKPLAN.md) 부터 읽으세요.** 단일 진입점입니다.

전체 구축 흐름·검증 게이트·트러블슈팅이 정리되어 있습니다.  
빠른 상태 확인은 `/status` 명령으로.

---

## 프로젝트 개요

SQLD(SQL Developer) 자격증 시험 준비용 웹 사이트. 이론 학습 + 예상문제 풀이.

| 영역 | 문서 |
|------|------|
| 무엇을 만드는가 | `docs/PRD.md` |
| 어떻게 만드는가 | `docs/ARCHITECTURE.md` |
| 누가 만드는가 | `docs/AGENTS.md` |
| 어떻게 자동화하는가 | `docs/HARNESS.md`, `docs/MCP_SKILLS.md` |
| 단계별 실행 | `docs/WORKPLAN.md` ← **시작점** |
| 개발 기록 | `docs/journal/JOURNAL.md`, `docs/journal/LESSONS.md` |

## 기술 스택

- **Next.js 14** (Pages Router, TypeScript)
- **Tailwind CSS** — 스타일링
- **React Context + localStorage** — 학습 진도 관리 (서버/DB 없음)
- **react-markdown + rehype-highlight** — 이론 콘텐츠 렌더링
- **Vercel** — 배포

## 핵심 명령어

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # SSG 빌드
npm run lint     # ESLint
npx tsc --noEmit # 타입 검사
```

## 핵심 구조

```
pages/           → 라우팅
components/      → layout/, theory/, quiz/, dashboard/
lib/             → questions, theory, progress 유틸
context/         → ProgressContext (전역 진도)
types/           → 공통 TypeScript 인터페이스
data/
  questions/     → 챕터별 문제 JSON
  theory/        → 챕터별 이론 마크다운
docs/journal/    → 바이브 코딩 기록
```

## 핵심 데이터 패턴

- 이론·문제 페이지는 `getStaticPaths` + `getStaticProps`로 SSG
- `localStorage` 접근 전 반드시 `typeof window !== 'undefined'` 가드
- 문제 ID 형식: `p{과목}c{챕터}_{3자리번호}` (예: `p2c1_001`)

## 슬래시 명령 목록

| 명령 | 용도 |
|------|------|
| `/status` | 현재 Phase·진도 확인, 다음 액션 제시 |
| `/run-agent [N]` | N번 에이전트 역할로 작업 시작 (`docs/AGENTS.md` 참조) |
| `/build-check` | tsc + lint + build 통합 검증 |
| `/validate-data` | 문제 JSON 스키마 검증 |
| `/add-question [챕터]` | 대화형 문제 추가 |
| `/add-theory [챕터]` | 이론 섹션 추가 |
| `/log [내용]` | 개발 과정 저널 기록 |
| `/retrospect` | 전체 회고 → `LESSONS.md` 합성 |

## 자동 훅 (`.claude/settings.json`)

- **questions JSON 저장** → 스키마 검증
- **theory MD 저장** → 섹션 수 확인
- **핵심 파일 완성** → `JOURNAL.md` 마일스톤 자동 기록 (멱등성 보장)
- **응답 종료** → TypeScript 오류 수 표시

## 에이전트 (요약)

| 번호 | 이름 | 담당 영역 |
|------|------|---------|
| 1 | scaffold | 프로젝트 초기화 |
| **9** | **pdf-extractor** | **`data/` (PDF 원본 기반) — PDF 있을 때 Agent 2 대신 사용** |
| 2 | content-writer | `data/` (JSON·MD, 수동/AI 생성) |
| 3 | foundation-builder | `types/`, `lib/`, `context/` |
| 4 | layout-builder | `components/layout/`, `_app.tsx` |
| 5 | quiz-builder | `components/quiz/`, `pages/quiz/` |
| 6 | theory-builder | `components/theory/`, `pages/theory/` |
| 7 | dashboard-builder | `components/dashboard/`, `pages/index.tsx` |
| 8 | qa | 전체 검증·버그 수정 |
| chronicle | (특수) | 저널 기록·회고 합성 |

> 상세 명세는 `docs/AGENTS.md`, 시스템 프롬프트는 `.claude/agents/*.md` 참조.
