# 06. 모의고사 세션 영속화 (이탈 후 복귀 시 진행 상태 유지)

**작성일**: 2026-06-02  
**상태**: 완료

---

## 배경

`/quiz/exam` 페이지의 모의고사 진행 상태(위치·답안·타이머)가 React 컴포넌트 state에만 저장되어,
다른 페이지로 이탈 후 돌아오면 인트로 화면으로 초기화되는 문제가 있다.

---

## 해결 방향

`localStorage`의 별도 키 `dasp_exam_session`에 진행 중 시험의 스냅샷을 저장.
페이지 진입 시 세션을 복원하여 "이어서 풀기" 기능 지원.

---

## 영속화 대상 데이터 (`ExamSession`)

| 필드 | 타입 | 설명 |
|------|------|------|
| mode | 'random' \| 'exam1' \| 'exam2' | 출제 방식 |
| questions | Question[] | 출제된 문제 목록 전체 |
| currentIndex | number | 현재 문제 번호 (0-based) |
| answers | Record<number, {selectedIndex, result}> | 제출된 답 |
| examEndTime | number | 시험 만료 절대 시각 (ms) |

**타이머 처리**: `examEndTime` 저장 → 복원 시 `remaining = examEndTime - Date.now()` 계산.
자리 비운 시간이 자동 차감되어 정확한 남은 시간 표시.

---

## 수정 파일

### 1. `types/index.ts`
- `ExamSession` 인터페이스 추가

### 2. `lib/progress.ts`
- `saveExamSession(session)` — localStorage 저장
- `loadExamSession()` — 복원 (파싱 실패 시 null)
- `clearExamSession()` — 세션 삭제

### 3. `pages/quiz/exam.tsx`
- `remainingSeconds` 상태 추가 (ExamTimer 초기값으로 사용)
- `examEndTimeRef` ref 추가 (절대 만료 시각)
- `hasSavedSession` 상태 추가 (배너 표시용)
- 마운트 시 세션 확인 useEffect
- `resumeExam()` 함수 신규
- `startExam()` 수정: 세션 저장
- `finishExam()` 수정: 세션 삭제
- 답변·이동 시 세션 자동 저장 useEffect
- 인트로 화면에 "이어서 풀기" 배너 UI 추가

---

## 이탈 중 시간 초과 처리

재진입 시 `remaining <= 0`이면 세션을 삭제하고 배너를 숨김 → 새 시험 시작 유도.

---

## 검증 시나리오

1. 시험 시작 → 3문제 풀기 → 이탈 → 재진입 → "이어서 풀기" 배너 → 클릭 → 4번 문제 복원
2. 시험 제출 완료 → 재진입 → 배너 미표시
3. 브라우저 탭 닫고 재오픈 → 세션 복원
4. 이탈 중 시간 초과 → 재진입 배너 클릭 → 세션 삭제, 인트로 유지
