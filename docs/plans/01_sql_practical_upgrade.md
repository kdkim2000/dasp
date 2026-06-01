# 계획 01: SQLD 2과목 문제 전면 개편 (실전 SQL 중심)

> 상태: 실행 중 | 시작일: 2026-05-31 | 브랜치: 01_contents_upgrade

## Context

2026-05-31 실제 SQLD 시험 응시 결과, 2과목의 상당 비중이 SQL 실행 결과 예측·구문 완성·오류 탐색 유형이었다.
현행 `data/questions/part2_ch1~ch3.json`은 이론 지식 확인 위주로 구성되어 있어 실제 시험 패턴과 괴리가 크다.
`docs/contents/`에 모의고사 PDF 2개(1,2회)가 이미 존재하므로 이를 pdf-extractor 에이전트로 즉시 활용한다.

**핵심 제약**: `ProgressStore` localStorage 스키마 변경 없음, 문제 ID `p{N}c{N}_{3자리}` 유지, Next.js 14 스택 고정.

---

## 현재 상태 (탐색 완료)

| 항목 | 현황 |
|------|------|
| `answer` 필드 | **1-based** (optionIndex = idx+1 과 직접 비교) |
| `pdf-extractor.md` 프롬프트 | **버그**: `answer: 0-based`로 잘못 명시 → Phase 1에서 수정 |
| react-markdown / rehype-highlight | 설치 완료, QuestionCard에서 **미사용** |
| highlight.js CSS import | `_app.tsx`에 **없음** → Phase 3에서 추가 |
| `.prose-sqld` CSS | `globals.css`에 이미 정의 → `.prose-quiz`로 재활용 |

---

## Phase 별 진행 상황

| Phase | 작업 | 상태 |
|-------|------|------|
| 1 | pdf-extractor 프롬프트 수정 (answer 1-based + questionType) | ✅ 완료 |
| 2 | `types/index.ts` — QuestionType 추가 | ✅ 완료 |
| 3 | QuestionCard / AnswerFeedback 마크다운 렌더링 | ✅ 완료 |
| 4 | pdf-extractor 에이전트 실행 (2과목 문제 전면 교체) | ✅ 완료 |
| 5 | 챕터 퀴즈 페이지 문제 유형 필터 UI | ✅ 완료 |
| 6 | QA (`/build-check` + `/validate-data`) | ✅ 완료 |

---

## 구현 세부 내용

### Phase 1 — pdf-extractor 프롬프트 수정

**파일**: `.claude/agents/pdf-extractor.md`

1. `answer: 0-based` → `answer: 1-based (PDF의 ① = 1, ② = 2, ③ = 3, ④ = 4)`
2. JSON 스키마에 `questionType` 필드 추가: `"concept" | "result" | "completion" | "error"`
3. 2과목 유형별 문제 작성 가이드 추가:
   - `result`: 마크다운 테이블(초기 데이터) + ` ```sql ` 블록 → 결과 예측
   - `completion`: ` ```sql ` 블록 내 `______` 빈칸
   - `error`: 잘못된 SQL ` ```sql ` 블록 → 오류 위치 탐색
4. 목표 문항 수 및 유형 배분:

   | 파일 | 목표 | concept | result | completion | error |
   |------|------|---------|--------|------------|-------|
   | part2_ch1.json | 30 | 10 | 10 | 7 | 3 |
   | part2_ch2.json | 30 | 8 | 12 | 7 | 3 |
   | part2_ch3.json | 20 | 12 | 3 | 2 | 3 |

5. 완료 기준의 `answer: 0~3` → `answer: 1~4`

### Phase 2 — Question 타입 확장

**파일**: `types/index.ts`

```typescript
export type QuestionType = 'concept' | 'result' | 'completion' | 'error'

export interface Question {
  // 기존 필드 유지 ...
  questionType?: QuestionType   // optional (기존 JSON 하위 호환)
}
```

### Phase 3 — 마크다운 렌더링

**파일 3개**:

- `pages/_app.tsx`: `import 'highlight.js/styles/github-dark.css'` 추가
- `styles/globals.css`: `.prose-quiz` 클래스 추가 (`.prose-sqld` 패턴 참고)
- `components/quiz/QuestionCard.tsx`: line 100 `<p>` → `<div className="prose-quiz"><ReactMarkdown>` + questionType 배지
- `components/quiz/AnswerFeedback.tsx`: line 86 `<p>` → `<div className="prose-quiz"><ReactMarkdown>`

> options 버튼 내부는 plain text 유지 (버튼 내 ReactMarkdown은 클릭 영역 충돌)

### Phase 4 — 에이전트 실행 (문제 교체)

`/run-agent 9` 실행.
- 교체 대상: `part2_ch1.json`(30문) / `part2_ch2.json`(30문) / `part2_ch3.json`(20문)
- 1과목 파일 변경 없음
- 실행 전 기존 파일 백업: `data/questions/backup/`

### Phase 5 — 문제 유형 필터 UI

**파일**: `pages/quiz/chapter/[chapterId].tsx`

- `typeFilter: QuestionType | 'all'` 상태 추가
- filteredQuestions 기준으로 currentIndex / selectedOptions / sessionAnswers 초기화
- 필터 변경 시 `setCurrentIndex(0)` 리셋
- 존재하는 유형만 버튼으로 표시

### Phase 6 — QA

```
/build-check    # tsc + lint + next build
/validate-data  # JSON 스키마 검증 (answer 1-4 범위, explanation 50자 이상)
```

---

## 의존 순서

```
Phase 1 ─┐
Phase 2 ─┤ 병렬 가능
          ↓
        Phase 3
          ↓
        Phase 4
          ↓
        Phase 5
          ↓
        Phase 6
```
