# MCP & Skills 정의서 — SQLD 사이트

---

## 1. MCP (Model Context Protocol) 서버

### 1-1. IDE MCP — `mcp__ide` (기본 내장)

**목적**: VS Code와 통합하여 코드 실행·진단을 Claude Code 안에서 직접 수행

| 도구 | 용도 | 사용 시점 |
|------|------|---------|
| `mcp__ide__getDiagnostics` | TypeScript 타입 오류, ESLint 경고 실시간 확인 | Foundation Builder 작업 중 타입 정의 검증 |
| `mcp__ide__executeCode` | TypeScript 코드 즉시 실행 | `lib/progress.ts` 유틸 함수 단위 테스트 |

**설정**: 별도 설치 불필요 (Claude Code IDE 확장 연동 시 자동 활성화)

---

### 1-2. Playwright MCP — `@playwright/mcp` (설치 필요)

**목적**: 실제 브라우저에서 UI 흐름을 자동화 테스트하고 스크린샷을 캡처

**설치**
```bash
npm install -D @playwright/mcp playwright
npx playwright install chromium
```

**`.mcp.json` (프로젝트 루트) 설정**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp", "--browser", "chromium"]
    }
  }
}
```

**사용 시나리오**

| 에이전트 | 사용 목적 |
|---------|---------|
| Quiz Feature Builder (Agent 5) | QuestionCard 보기 선택 → 정답 피드백 흐름 확인 |
| Theory Feature Builder (Agent 6) | SQL 코드 블록 신택스 하이라이팅 렌더링 확인 |
| Dashboard Builder (Agent 7) | ProgressChart SVG 렌더링 확인 |
| QA Agent (Agent 8) | 모바일 뷰포트(375px) 반응형 레이아웃 스크린샷 |

**주요 활용 작업**
```
# 개발 서버 실행 후 브라우저 자동화
1. localhost:3000 접속
2. /quiz/chapter/part2_ch1 이동
3. 첫 번째 문제 보기 클릭
4. 정답/해설 표시 확인
5. localStorage 업데이트 확인
```

---

### 1-3. Figma MCP — `mcp__claude_ai_Figma` (선택, 필요 시)

**목적**: 디자인 시안이 생기면 Figma에서 컴포넌트 스펙을 직접 읽어 코드에 반영

**사용 시점**: UI 디자인 확정 후 Layout Builder, Quiz Feature Builder 작업 시
현재 Phase에서는 필수 아님 — 디자인 시안 없이 Tailwind로 직접 구현

---

## 2. 프로젝트 전용 Skills (`.claude/commands/`)

> 실행: `/skill명` 형태로 Claude Code 프롬프트에서 호출

### 2-1. `/build-check`

**파일**: `.claude/commands/build-check.md`

**목적**: 세 단계 빌드 파이프라인을 한 번에 실행하고 결과 리포트

```
tsc --noEmit  →  npm run lint  →  npm run build
```

**사용 시점**
- 각 에이전트 작업 완료 후 검증
- QA Agent (Agent 8) 최종 통합 검증
- Vercel 배포 전 로컬 사전 확인

---

### 2-2. `/validate-data`

**파일**: `.claude/commands/validate-data.md`

**목적**: `data/questions/*.json` 전체 스키마 및 일관성 검증

**검사 규칙**

| 항목 | 규칙 |
|------|------|
| id 형식 | `p{1\|2}c{1\|2\|3}_{3자리숫자}` |
| options 길이 | 정확히 4개 |
| answer 범위 | 0~3 정수 |
| id 중복 | 전체 파일 간 중복 금지 |
| 필수 필드 | content, explanation 비어있지 않음 |

**사용 시점**
- Content Writer (Agent 2) 작업 완료 직후
- `/add-question` 실행 후 자동 호출
- QA Agent 검증 단계

---

### 2-3. `/add-question [챕터ID]`

**파일**: `.claude/commands/add-question.md`

**목적**: 대화형으로 새 문제를 특정 챕터 JSON에 추가 (ID 자동 채번)

**흐름**
```
/add-question part2_ch1
→ 현재 문항 수 확인 (예: 30문항)
→ 새 ID 계산: p2c1_031
→ 문제 본문 입력
→ 보기 4개 입력
→ 정답 번호 입력
→ 해설 입력
→ JSON 파일 업데이트
→ /validate-data 자동 실행
```

**사용 시점**
- 시험 준비 중 새 기출문제 발견 시
- Content Writer 초기 작업 후 문항 추가 시

---

### 2-4. `/add-theory [챕터ID]`

**파일**: `.claude/commands/add-theory.md`

**목적**: 이론 마크다운 파일에 새 섹션 추가 또는 기존 내용 보완

**사용 시점**
- 시험 범위 중 누락된 개념 발견 시
- 오답률이 높은 챕터의 이론 보강 시

---

### 2-5. `/run-agent [번호]`

**파일**: `.claude/commands/run-agent.md`

**목적**: `docs/AGENTS.md` 기반으로 특정 에이전트 역할을 로드하고 작업 시작

**사용 예시**
```
/run-agent          → 전체 에이전트 현황 표 출력
/run-agent 1        → Scaffold Agent 시작
/run-agent 3        → Foundation Builder 시작
/run-agent 8        → QA Agent 시작
```

**선행 조건 자동 점검**: 실행 전 의존 파일 존재 여부를 확인하고, 미충족 시 필요한 에이전트를 먼저 안내

---

## 3. 설정 파일 업데이트 계획

### `.mcp.json` (MCP 서버 — 프로젝트 루트)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp", "--browser", "chromium"]
    }
  }
}
```

### `.claude/settings.local.json` (권한 설정)

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx tsc *)",
      "Bash(npx playwright *)",
      "Bash(npx create-next-app *)"
    ]
  }
}
```

> Playwright MCP는 Scaffold(Agent 1) 완료 후 `npm install -D @playwright/mcp playwright` 설치 후 `.mcp.json`의 `disabled: true`를 제거한다.

---

## 4. MCP · Skills 도입 효과 요약

| 도구 | 없을 때 | 있을 때 |
|------|---------|---------|
| IDE MCP | 빌드 후에야 타입 오류 발견 | 코드 작성 중 즉시 감지 |
| Playwright MCP | 수동으로 브라우저 열어 확인 | 에이전트가 UI 흐름 자동 검증 |
| `/build-check` | tsc·lint·build 명령을 따로 실행 | 한 번에 순서대로 실행 |
| `/validate-data` | JSON 오류를 빌드 시 발견 | 데이터 작성 즉시 검증 |
| `/add-question` | JSON 직접 편집 (ID 수동 계산) | 대화형 입력으로 안전하게 추가 |
| `/run-agent` | AGENTS.md 직접 읽고 해석 | 에이전트 역할·선행조건 자동 로드 |
