# 계획 02: 모의고사·챕터 문제 혼합 랜덤 출제 구조 개편

> 상태: 실행 중 | 시작일: 2026-06-01 | 브랜치: 01_contents_upgrade

## Context

출제예상 PDF 2종(1회·2회, 각 50문)을 `data/mockexam/` 디렉터리에 독립 파일로 저장하고,
챕터(115문) + 모의고사 통합 풀에서 과목·챕터 비율을 유지한 채 랜덤 혼합 출제하는 기능을 추가한다.
현행 `sampleExamQuestions()`는 변경 없이 유지하며 새 함수·UI를 추가하는 방식으로 하위 호환 보장.

요구사항 문서: `요구사항정의서_SQLD_혼합랜덤출제_20260601.md`

---

## Phase 별 진행 상황

| Phase | 작업 | 상태 |
|-------|------|------|
| 0 | pdf-to-markdown 스킬 + Python PDF 가용성 확인 | ✅ 완료 |
| 1 | `data/mockexam/exam1.json`, `exam2.json` 생성 (각 50문) | ✅ 완료 |
| 2 | `types/index.ts` — `QuestionSource` 타입 추가 | ✅ 완료 |
| 3 | `lib/questions.ts` — 혼합 샘플링 함수 3개 추가 | ✅ 완료 |
| 4 | `pages/quiz/exam.tsx` — 소스 선택 UI + 분기 로직 | ✅ 완료 |
| 5 | `components/quiz/QuestionCard.tsx` — source 배지 | ✅ 완료 |
| 6 | QA (`/build-check`) — tsc + lint + build 모두 통과 | ✅ 완료 |

---

## 구현 세부 내용

### Phase 0 — pdf-to-markdown 스킬 + Python 확인

1. Bash로 `pdfplumber` / `PyMuPDF` 가용성 확인
2. `C:\Users\kdkim2000\.claude\skills\pdf-to-markdown\SKILL.md` 생성
3. `scripts/pdf_to_text.py` 생성

### Phase 1 — mockexam JSON 파일 생성

**파일**: `data/mockexam/exam1.json`, `data/mockexam/exam2.json` (각 50문)

문항 구성 (각 파일):
- 1과목 10문: Part1/ch1 5문 + Part1/ch2 5문
- 2과목 40문: Part2/ch1 15문 + Part2/ch2 15문 + Part2/ch3 10문

ID 형식: `me1c1_001` (exam1) / `me2c1_001` (exam2)
source 필드: `"mockexam1"` / `"mockexam2"`

### Phase 2 — types/index.ts 확장

```typescript
export type QuestionSource = 'chapter' | 'mockexam1' | 'mockexam2'
// Question 인터페이스에 source?: QuestionSource 추가 (optional)
```

### Phase 3 — lib/questions.ts 확장

신규 함수 3개:
- `getMockExamQuestions(examNum: 1|2)` — 모의고사 단독 반환
- `getAllQuestionsFromAllSources()` — 챕터 + 모의고사 통합
- `sampleMixedExam()` — Part2 ch1:ch2:ch3 = 15:15:10 비율 혼합 샘플링

### Phase 4 — exam.tsx 소스 선택 UI

타입: `ExamSource = 'chapter' | 'mixed' | 'exam1' | 'exam2'`
기본값: `'mixed'`
준비 화면: 4가지 선택 카드 + 기존 합격 기준 박스 유지

### Phase 5 — QuestionCard source 배지

`source === 'mockexam1'` → `예상1회`, `mockexam2` → `예상2회` 배지 (teal)

### Phase 6 — QA

```
/build-check    # tsc + lint + next build
/validate-data  # JSON 스키마 검증
```

---

## 의존 순서

```
Phase 0 → Phase 1 → Phase 2 (병렬 가능) → Phase 3 → Phase 4 → Phase 5 → Phase 6
```
