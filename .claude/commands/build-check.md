TypeScript 타입 검사 → ESLint → Next.js 빌드를 순서대로 실행하고, 각 단계 결과를 표로 리포트한다.

단계별 실행:
1. `npx tsc --noEmit` — 타입 오류 확인
2. `npm run lint` — ESLint 오류 확인
3. `npm run build` — Next.js SSG 빌드

각 단계가 실패하면 이후 단계는 실행하지 말고, 오류 내용과 수정 방법을 즉시 제시한다.
모든 단계 통과 시: "빌드 통과 ✓" 메시지와 생성된 SSG 경로 수를 출력한다.
