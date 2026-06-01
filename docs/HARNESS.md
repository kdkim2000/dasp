# HARNESS — Claude Code 하네스 엔지니어링

## 개요

하네스(Harness)는 Claude Code가 이 프로젝트에서 **자율적으로 작동하는 방식**을 정의한다.  
에이전트 정의, 훅(자동화), 커스텀 스킬(슬래시 명령), MCP 서버 설정으로 구성된다.

---

## 파일 구조

```
.claude/
├── settings.json          ← 프로젝트 공유 훅 (git 추적)
├── settings.local.json    ← 로컬 전용 권한 설정 (git 제외)
├── agents/                ← 서브에이전트 정의 (8개)
│   ├── scaffold.md
│   ├── content-writer.md
│   ├── foundation-builder.md
│   ├── layout-builder.md
│   ├── quiz-builder.md
│   ├── theory-builder.md
│   ├── dashboard-builder.md
│   └── qa.md
└── commands/              ← 커스텀 슬래시 명령 (5개)
    ├── build-check.md
    ├── validate-data.md
    ├── add-question.md
    ├── add-theory.md
    └── run-agent.md

.mcp.json                  ← MCP 서버 설정 (Playwright)
scripts/
└── validate-questions.ts  ← QA 검증 스크립트
```

---

## 레이어 0: 계획 추적 (`docs/plans/`)

비자명한 구현 작업을 시작하기 전 반드시 `docs/plans/` 아래에 계획 마크다운을 생성한다.

| 규칙 | 내용 |
|------|------|
| **파일명** | `{NN}_{slug}.md` (예: `01_sql_practical_upgrade.md`) |
| **필수 섹션** | Context / Phase 별 진행 상황(상태 테이블) / 구현 세부 내용 / 의존 순서 |
| **상태 값** | `⬜ 대기` / `🔄 진행 중` / `✅ 완료` |
| **업데이트 시점** | 각 Phase 시작 전 `🔄`, 완료 후 `✅`로 갱신 |

---

## 레이어 1: 에이전트 (`.claude/agents/`)

Claude Code가 `/agent` 명령 또는 Agent 도구로 호출할 수 있는 전문 서브에이전트.  
각 에이전트는 **소유 파일**과 **허용 도구**가 제한되어 있다.

| 에이전트 | 모델 | 허용 도구 | 소유 파일 영역 |
|---------|------|---------|-------------|
| `scaffold` | Haiku | Bash, Write, Read, Edit, Glob | 설정 파일, pages/_app.tsx |
| `content-writer` | Sonnet | Write, Read, Edit, Glob | data/ |
| `foundation-builder` | Sonnet | Write, Read, Edit, Bash, Grep, Glob | types/, lib/, context/ |
| `layout-builder` | Sonnet | Write, Read, Edit, Grep, Glob | components/layout/, _app.tsx |
| `quiz-builder` | Sonnet | Write, Read, Edit, Grep, Glob | components/quiz/, pages/quiz/ |
| `theory-builder` | Sonnet | Write, Read, Edit, Grep, Glob | components/theory/, pages/theory/ |
| `dashboard-builder` | Sonnet | Write, Read, Edit, Grep, Glob | components/dashboard/, pages/index.tsx |
| `qa` | Sonnet | Read, Edit, Bash, Grep, Glob | 전체 버그 수정 (기능 추가 제외) |

### 에이전트 호출 방법

```
# 슬래시 명령으로 호출
/run-agent 1        → Scaffold Agent 시작
/run-agent 3        → Foundation Builder 시작

# 병렬 호출 (Phase 1)
/run-agent 2 와 /run-agent 3 을 동시에 실행 요청
```

---

## 레이어 2: 훅 (`.claude/settings.json`)

Claude Code가 도구를 실행할 때 **자동으로 실행**되는 사이드이펙트.

### 활성 훅

| 이벤트 | 조건 | 동작 |
|--------|------|------|
| `PostToolUse(Write)` | `data/questions/**` 파일 작성 시 | JSON 스키마 검증 + 문항 수 출력 |
| `PostToolUse(Write)` | `data/theory/**` 파일 작성 시 | 줄 수·섹션 수 출력 |
| `Stop` | Claude Code 응답 종료 시 | TypeScript 타입 오류 수 확인 |

### 훅 동작 방식

```
사용자: "part2_ch1.json 에 문제 추가해줘"
Claude: Write(data/questions/part2_ch1.json) 실행
  └→ [PostToolUse Hook 자동 실행]
       → "[JSON 검증] data/questions/part2_ch1.json — 31문항 유효"
Claude: 응답 완료
  └→ [Stop Hook 자동 실행]
       → "[타입 검사] 통과 — 오류 없음"
```

### JSON 훅이 exit 2 반환 시
`exit 2`는 Claude Code에 오류를 알려 자동으로 수정 시도를 유발한다.

---

## 레이어 3: 슬래시 명령 (`.claude/commands/`)

대화 중 `/명령어` 로 호출하는 작업 자동화.

| 명령어 | 설명 |
|--------|------|
| `/build-check` | tsc → lint → build 3단계 파이프라인 |
| `/validate-data` | 전체 questions JSON 스키마 검증 |
| `/add-question [챕터]` | 대화형 문제 추가 (ID 자동 채번) |
| `/add-theory [챕터]` | 이론 마크다운 섹션 추가 |
| `/run-agent [번호]` | 특정 에이전트 역할로 작업 시작 |

---

## 레이어 4: MCP 서버 (`.mcp.json`)

| 서버 | 상태 | 용도 |
|------|------|------|
| `ide` (내장) | 활성 | TypeScript 진단, 코드 실행 |
| `playwright` | 비활성 (disabled: true) | UI 자동화 테스트 |

### Playwright MCP 활성화 방법
```bash
# 1. Scaffold 완료 후 패키지 설치
npm install -D @playwright/mcp playwright
npx playwright install chromium

# 2. .mcp.json 에서 disabled 제거
```

---

## 레이어 5: 검증 스크립트 (`scripts/`)

| 스크립트 | 실행 방법 | 용도 |
|---------|---------|------|
| `validate-questions.ts` | `npx ts-node scripts/validate-questions.ts` | QA Agent가 사용하는 JSON 스키마 검증 |

---

## 전체 개발 흐름에서의 하네스 역할

```
개발자 → /run-agent 1 (Scaffold)
          └→ npm run dev 확인

개발자 → /run-agent 2, 3 동시 실행
          └→ Write(data/questions/*.json) 시 훅 자동 실행
          └→ Stop 시 타입 검사 자동 실행

개발자 → /run-agent 4 (Layout) → 5,6 병렬 → 7

개발자 → /run-agent 8 (QA)
          └→ /build-check 실행
          └→ /validate-data 실행
          └→ Playwright 흐름 테스트

배포 → git push → Vercel 자동 배포
```
