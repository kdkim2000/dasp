# 바이브 코딩 저널 — SQLD 시험 준비 사이트

> 이 파일은 개발 과정의 생생한 기록입니다.
> 자동 훅과 `/log` 명령으로 항목이 추가됩니다.
> 회고는 `/retrospect` 명령으로 `LESSONS.md`에 합성됩니다.

**프로젝트**: SQLD 시험 준비 사이트  
**시작일**: 2026-05-05  
**스택**: Next.js 14 · TypeScript · Tailwind CSS · JSON · localStorage · Vercel  
**에이전트 수**: 9개 (Orchestrator 포함)

---

## 항목 형식 참고
```
### [YYYY-MM-DD HH:MM] [Phase N] [에이전트] — 제목

**작업**: 무엇을 했나
**결정**: 선택과 이유 (있을 때만)
**장애물**: 마주친 문제 (있을 때만)
**해결**: 극복 방법 (있을 때만)
**교훈**: 핵심 takeaway
**바이브**: ⚡고에너지 / 😌안정적 / 🤔복잡 / 🎉완성 / 😤막힘
```

---

### [2026-05-05 00:00] [Phase 0] [Orchestrator] — 프로젝트 기획 완료

**작업**: PRD, ARCHITECTURE, AGENTS, MCP_SKILLS, HARNESS 문서 작성. 9개 에이전트 정의. 5개 슬래시 명령, 2개 MCP 서버, 3개 훅 설정.
**결정**: Next.js Pages Router + JSON + localStorage 조합 선택. App Router보다 SSG 패턴이 직관적이고 서버 없이 배포 가능.
**교훈**: 코딩 시작 전 에이전트 경계와 파일 소유권을 명확히 정의하면 충돌 없이 병렬 작업 가능.
**바이브**: ⚡고에너지

---

### [2026-05-05 00:30] [Phase 0] [Orchestrator] — 시스템 구조 최종 점검 및 보강

**작업**: 9에이전트 + 7스킬 + 7훅 + 8문서 전체 감사. WORKPLAN.md 신규 작성, /status 스킬 추가, 훅 멱등성 패치.
**결정**: WORKPLAN.md를 단일 진입점으로 채택. CLAUDE.md는 요약 + 포인터만 두고 권위 있는 소스를 분산. 마일스톤 훅은 `once: true` 대신 콘텐츠 기반 idempotent 체크 사용 (settings.json 수정 회피).
**장애물**: 마일스톤 훅이 같은 파일 재편집 시 중복 저널 항목 추가하는 결함 발견. Edit 도구로 수정 시 트리거되지 않는 문제도 함께.
**해결**: 훅 command에 `Select-String`으로 마커 검색 → 미존재 시에만 Add-Content. matcher를 `Write|Edit`로 확장.
**교훈**: 자동화 훅은 "시작" 시점 한 번만 의미가 있다면 반드시 멱등성 보장 필요. 슬래시 명령·에이전트가 많아질수록 단일 진입점 문서가 결정적.
**바이브**: 😌안정적

---

<!-- 이 아래로 새 항목이 자동 또는 /log 명령으로 추가됩니다 -->

### [2026-05-05 01:00] [Phase 0] [Orchestrator] — PDF Extractor 에이전트 추가

**작업**: `docs/contents/` PDF 파일 기반 콘텐츠 자동 생성 에이전트(Agent 9) 설계 및 추가. `.claude/agents/pdf-extractor.md` 신규 작성. `docs/AGENTS.md`, `docs/WORKPLAN.md`, `CLAUDE.md` 업데이트.
**결정**: content-writer(Agent 2) 대체가 아닌 우선 실행 에이전트로 포지셔닝. PDF 있을 때 → Agent 9, 없거나 보완 필요 → Agent 2. 두 에이전트가 동일 소유 파일을 공유하므로 대체 관계 명시.
**교훈**: Read 도구가 PDF를 직접 읽을 수 있으므로, 별도 파이프라인 없이 에이전트 프롬프트에 소스 매핑만 명확히 정의하면 PDF 기반 콘텐츠 생성이 가능하다.
**바이브**: ⚡고에너지
