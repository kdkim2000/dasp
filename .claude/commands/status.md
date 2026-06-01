현재 SQLD 사이트 구축 진행 상황을 파일 시스템 기반으로 점검하고 다음 액션을 제시한다.

## 사용법
```
/status
```

## 실행 절차

각 Phase의 핵심 파일 존재 여부를 확인하여 완료 상태를 판정한다.

### Phase 0 (Scaffold)
- 확인 파일: `package.json`, `tsconfig.json`, `tailwind.config.js`, `pages/_app.tsx`
- 모두 존재 → ✓
- 일부 누락 → ⚠ 진행 중
- 모두 없음 → ✗ 미시작

### Phase 1 (Content + Foundation)
- Foundation: `types/index.ts`, `lib/questions.ts`, `lib/theory.ts`, `lib/progress.ts`, `context/ProgressContext.tsx`
- Content: `data/questions/*.json` 5개, `data/theory/*.md` 5개

### Phase 2 (Layout)
- 확인 파일: `components/layout/Layout.tsx`, `components/layout/Sidebar.tsx`

### Phase 3 (Quiz + Theory)
- Quiz: `components/quiz/QuestionCard.tsx`, `pages/quiz/exam.tsx`, `pages/quiz/chapter/[chapterId].tsx`
- Theory: `components/theory/TheoryContent.tsx`, `pages/theory/[chapterId].tsx`

### Phase 4 (Dashboard)
- 확인 파일: `pages/index.tsx`, `components/dashboard/ProgressChart.tsx`

### Phase 5 (QA)
- `npx tsc --noEmit` 통과 여부
- `npm run build` 성공 여부 (`.next/` 디렉토리 존재로 추정)

## 출력 형식

```
=== SQLD 사이트 구축 상태 ===

Phase 0  [Scaffold]            ✓ 완료
Phase 1  [Content + Foundation] ⚠ 진행 중 (Content 80%, Foundation ✓)
Phase 2  [Layout]              ✗ 미시작
Phase 3  [Quiz + Theory]       ✗ 미시작
Phase 4  [Dashboard]           ✗ 미시작
Phase 5  [QA]                  ✗ 미시작

다음 액션: Content Writer 작업 마무리 — `/run-agent 2` 재호출

데이터 현황:
  - 문제 JSON: 4/5 파일, 87문항
  - 이론 MD:   5/5 파일

저널 항목 수: 3개  |  세션 수: 12회

추천 명령:
  /run-agent 2     ← Content Writer 마무리
  /validate-data   ← 데이터 정합성 점검
==============================
```

## 추가 정보 출력 (선택)

- `docs/journal/JOURNAL.md`의 항목 수 카운트
- `docs/journal/.sessions` 의 줄 수로 세션 수 추정
- 직전 자동 마일스톤 항목의 타임스탬프
- TypeScript 오류 수 (tsconfig.json 존재 시)
