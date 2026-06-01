# WORKPLAN — SQLD 사이트 구축 실행 계획

> **이 문서가 단일 진입점입니다.** 처음 시작하는 사람은 위에서부터 차례대로 따라가세요.
> 각 Phase 끝의 "검증 게이트"를 통과해야 다음 Phase로 진행합니다.

---

## 0. 시작 전 체크리스트

```bash
node --version    # 18.0 이상 필요
npm --version
git --version
```

- [ ] `CLAUDE.md` 읽음
- [ ] `docs/PRD.md` 시험 구조·핵심 기능 확인
- [ ] `docs/ARCHITECTURE.md` 데이터 모델·페이지 흐름 확인
- [ ] `docs/AGENTS.md` 에이전트 분업 구조 확인
- [ ] `/status` 명령으로 시스템 준비 상태 확인

---

## Phase 0 — Scaffold (단독)

**목표**: `npm run dev`로 빈 페이지가 뜨는 Next.js 프로젝트  
**예상 소요**: 10~15분

### 실행
```
/run-agent 1
```

### 검증 게이트
| 항목 | 명령 / 확인 |
|------|-----------|
| 프로젝트 골격 생성 | `package.json`, `tsconfig.json`, `tailwind.config.js` 존재 |
| 개발 서버 동작 | `npm run dev` → localhost:3000 200 OK |
| 린트 통과 | `npm run lint` → 0 errors |
| 디렉토리 골격 | `data/`, `components/`, `lib/`, `context/`, `types/` 생성됨 |

### 통과 시 → Phase 1로 진행

---

## Phase 1 — Content + Foundation (병렬, 권장 순서 있음)

**목표**: 데이터(JSON·MD) + 공유 레이어(types·lib·context) 완성  
**예상 소요**: 30~60분

### 권장 순서
1. **먼저** `/run-agent 3` (Foundation Builder)로 `types/index.ts` 5분 내 작성 → 타입 계약 확정
2. **그 다음** 콘텐츠 에이전트 실행 (Foundation 작업과 병렬 가능)

**콘텐츠 에이전트 선택 기준**

| 상황 | 실행 명령 | 비고 |
|------|---------|------|
| `docs/contents/` 에 PDF 파일 있음 | `/run-agent 9` | PDF 원본 기반 자동 생성 — **권장** |
| PDF 없거나 보완 필요 | `/run-agent 2` | 수동/AI 생성 |

> PDF Extractor(Agent 9)가 우선입니다. PDF를 읽어 이론 마크다운과 문제 JSON을 직접 추출하므로 정확도가 높습니다.  
> Agent 9 실행 후 품질 보완이 필요한 챕터만 `/run-agent 2`로 추가 작업하세요.

### 실행
```
# Foundation 먼저 시작 (types/index.ts만이라도 빠르게)
/run-agent 3

# PDF가 있을 때 (docs/contents/ 폴더 확인)
/run-agent 9

# PDF가 없을 때 또는 보완 시
/run-agent 2
```

### 검증 게이트
| 항목 | 명령 / 확인 |
|------|-----------|
| Foundation 파일 5개 | `types/index.ts`, `lib/{questions,theory,progress}.ts`, `context/ProgressContext.tsx` |
| 타입 검사 통과 | `npx tsc --noEmit` → 0 errors |
| 데이터 파일 10개 | `data/questions/*.json` 5개 + `data/theory/*.md` 5개 |
| 데이터 검증 통과 | `/validate-data` → 통과 |
| 자동 저널 항목 | `[Phase 1] [foundation-builder] — ProgressContext` 기록 확인 |
| (Agent 9 실행 시) PDF 소스 활용 | `data/theory/*.md` 이론 파일에 `## 출제 포인트` 섹션 존재 |

### 통과 시 → Phase 2로 진행

---

## Phase 2 — Layout (단독)

**목표**: 모든 페이지가 공유할 레이아웃 쉘  
**예상 소요**: 20~30분

### 실행
```
/run-agent 4
```

### 검증 게이트
| 항목 | 명령 / 확인 |
|------|-----------|
| 레이아웃 파일 | `components/layout/{Layout,TopBar}.tsx`, `pages/_app.tsx` |
| Provider 연결 | `pages/_app.tsx`에 `<ProgressProvider><Layout>` 구조 |
| TopBar 표시 | 브랜드 로고, 네비 링크, 게이미피케이션 배지 TopBar에 표시 |
| 자동 저널 항목 | `[Phase 2] [layout-builder] — 공통 레이아웃` 기록 확인 |

### 통과 시 → Phase 3로 진행

---

## Phase 3 — Quiz + Theory (완전 병렬)

**목표**: 문제풀이 5개 페이지 + 이론 학습 2개 페이지  
**예상 소요**: 60~90분

### 실행 (별도 세션 또는 동시 호출)
```
/run-agent 5    # Quiz Builder
/run-agent 6    # Theory Builder
```

### 검증 게이트
| 항목 | 명령 / 확인 |
|------|-----------|
| Quiz 컴포넌트 4개 | `components/quiz/{QuestionCard,AnswerFeedback,QuizNavigator,ExamTimer}.tsx` |
| Quiz 페이지 6개 | `pages/quiz/{index,exam,result,wrong,bookmarks}.tsx`, `pages/quiz/chapter/[chapterId].tsx` |
| Theory 컴포넌트 3개 | `components/theory/{TheoryContent,TheoryTOC,RelatedQuestions}.tsx` |
| Theory 페이지 2개 | `pages/theory/index.tsx`, `pages/theory/[chapterId].tsx` |
| 흐름 동작 | `/quiz/chapter/part2_ch1` → 보기 선택 → 정답 피드백 → localStorage 반영 |
| 이론 3열 레이아웃 | `/theory/[id]` → TOC + 본문 + 관련문제 3열 표시 |
| SSG 빌드 | `npm run build` → 5+5 챕터 경로 사전 생성 |
| 자동 저널 항목 | `[Phase 3] [quiz-builder]`, `[Phase 3] [theory-builder]` 기록 확인 |

### 통과 시 → Phase 4로 진행

---

## Phase 4 — Dashboard (단독, Phase 3 완료 필수)

**목표**: Quest Mode 대시보드 메인 페이지  
**예상 소요**: 20~30분

### 실행
```
/run-agent 7
```

### 검증 게이트
| 항목 | 명령 / 확인 |
|------|-----------|
| UI 컴포넌트 2개 | `components/ui/{Mascot,Badge}.tsx` |
| 대시보드 컴포넌트 4개 | `components/dashboard/{HeroBanner,LearningPath,MascotCard,WeeklyXP}.tsx` |
| 메인 페이지 | `pages/index.tsx` Quest Mode 대시보드 |
| 히어로 배너 | 퍼플 그래디언트 배너 + 마스코트 표시 |
| 학습 경로 버블 | 챕터 완료 상태 버블로 시각화 |
| 빈 상태 표시 | localStorage 비어있을 때 적절한 안내 메시지 |
| 자동 저널 항목 | `[Phase 4] [dashboard-builder] — 대시보드` 기록 확인 |

### 통과 시 → Phase 5로 진행

---

## Phase 5 — QA (단독, 모든 Phase 완료 필수)

**목표**: 전체 통합 검증 + 버그 수정 + 첫 회고  
**예상 소요**: 15~30분

### 실행
```
/run-agent 8
/build-check     # tsc + lint + build 통합 검증
/validate-data   # 데이터 최종 점검
/retrospect      # LESSONS.md 첫 회고 합성
```

### 검증 게이트
| 항목 | 명령 / 확인 |
|------|-----------|
| 타입 검사 | `npx tsc --noEmit` → 0 errors |
| 린트 검사 | `npm run lint` → 0 errors |
| 빌드 성공 | `npm run build` → exit 0 |
| 데이터 검증 | `/validate-data` → 통과 |
| SSR 가드 | `localStorage` 모든 접근에 `typeof window !== 'undefined'` 가드 적용 |
| 회고 생성 | `docs/journal/LESSONS.md` 업데이트됨 |

### 통과 시 → 배포로 진행

---

## Phase 6 — Quest Mode 디자인 개편 (디자인 리모델링 시 실행)

**목표**: OPUS-X 기반 퍼플 팔레트 + Quest Mode 게이미피케이션 UI 적용  
**트리거**: `docs/sqld.zip` (design_handoff_sqld_quest) 디자인 핸드오프 수령 시  
**예상 소요**: 2~3시간

### 실행 순서 (의존성 기반)
```
1. 디자인 시스템 기반 (tailwind.config.js + globals.css + _document.tsx)
2. ProgressContext 확장 (getStreak/getXP/getGems/getHearts)
3. 레이아웃 교체 (TopBar + Layout.tsx)
4. 대시보드 재설계 (/run-agent 7)
5. 이론/퀴즈 페이지 업데이트 (/run-agent 6, /run-agent 5)
6. 통합 QA (/run-agent 8)
```

### 검증 게이트
| 항목 | 확인 |
|------|------|
| 퍼플 히어로 배너 표시 | 대시보드 접속 → 그래디언트 배너 표시 |
| TopBar 배지 표시 | 스트릭/보석/하트 배지 TopBar에 표시 |
| 학습 경로 버블 | 챕터 완료 상태 버블로 시각화 |
| 이론 3열 레이아웃 | `/theory/[id]` → TOC + 본문 + 관련문제 |
| 다크모드 토글 | TopBar 달 아이콘 클릭 → 테마 전환 |
| TypeScript | `npx tsc --noEmit` → 0 errors |
| 빌드 | `npm run build` → 성공 |

---

## 배포

```bash
git init
git add .
git commit -m "feat: SQLD 시험 준비 사이트 MVP"
git remote add origin <github-repo-url>
git push -u origin main

# Vercel: GitHub 연동 → import → 자동 배포
```

---

## 진행 추적

`/status` 명령으로 언제든 현재 상태 확인:
- 어느 Phase 진행 중인지
- 어느 에이전트가 완료됐는지
- 다음 액션은 무엇인지

---

## 트러블슈팅

### "에이전트가 실패하거나 막혔어요"
1. `/status` — 현재 상태 확인
2. `/log` — 문제 상황 기록 (나중 회고용)
3. 해당 에이전트 산출물 수동 검토 → 부분 수정 또는 `/run-agent N` 재실행

### "빌드가 깨졌어요"
1. `/build-check` — 어느 단계(tsc/lint/build)에서 깨졌는지 확인
2. `/run-agent 8` (QA) — 자동 수정 시도
3. 그래도 안 되면 → 가장 최근 변경 파일 `git diff` 또는 Edit 되돌리기

### "JSON 데이터에 오류가 있어요"
1. `/validate-data` — 정확한 위치·이유 확인
2. 해당 파일 직접 수정 또는 `/add-question` 으로 추가

### "Phase를 건너뛰고 싶어요"
- **하지 마세요.** 각 Phase는 다음 Phase의 전제 조건을 만듭니다.
- 부분 작업이 필요하면 해당 에이전트의 system prompt(`docs/AGENTS.md`)를 참조해 수동 진행.

---

## 진행 후 회고

각 Phase 완료 시:
- 자동 저널 마일스톤 기록됨 (훅이 자동 처리)
- 의외의 발견·결정·문제는 `/log` 로 직접 기록

전체 완료 후:
- `/retrospect` 로 `LESSONS.md` 합성
- 다음 프로젝트의 출발점이 됩니다
