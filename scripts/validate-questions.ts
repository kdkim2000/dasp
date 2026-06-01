import fs from 'fs';
import path from 'path';

const QUESTIONS_DIR = path.join(process.cwd(), 'data', 'questions');
const ID_PATTERN = /^p[12]c[123]_\d{3}$/;

interface Question {
  id: string;
  part: number;
  chapter: string;
  content: string;
  options: unknown[];
  answer: number;
  explanation: string;
  tags?: string[];
}

interface ValidationResult {
  file: string;
  count: number;
  errors: string[];
}

function validateFile(filePath: string): ValidationResult {
  const fileName = path.basename(filePath);
  const errors: string[] = [];
  let questions: Question[] = [];

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    questions = JSON.parse(raw);
  } catch {
    return { file: fileName, count: 0, errors: ['JSON 파싱 실패'] };
  }

  if (!Array.isArray(questions)) {
    return { file: fileName, count: 0, errors: ['최상위 구조가 배열이 아님'] };
  }

  questions.forEach((q, i) => {
    const loc = `[${i}] id=${q.id ?? '없음'}`;

    if (!q.id || !ID_PATTERN.test(q.id)) {
      errors.push(`${loc}: id 형식 오류 (p{1|2}c{1|2|3}_{3자리} 필요)`);
    }
    if (q.part !== 1 && q.part !== 2) {
      errors.push(`${loc}: part가 1 또는 2가 아님 (값: ${q.part})`);
    }
    if (!q.chapter || typeof q.chapter !== 'string') {
      errors.push(`${loc}: chapter 없음`);
    }
    if (!q.content || q.content.trim() === '') {
      errors.push(`${loc}: content 비어있음`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${loc}: options가 4개 배열이 아님 (현재: ${Array.isArray(q.options) ? q.options.length : '배열아님'}개)`);
    }
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) {
      errors.push(`${loc}: answer가 0~3 범위 정수가 아님 (값: ${q.answer})`);
    }
    if (!q.explanation || q.explanation.trim().length < 10) {
      errors.push(`${loc}: explanation 없거나 너무 짧음`);
    }
  });

  return { file: fileName, count: questions.length, errors };
}

function checkDuplicateIds(allFiles: string[]): string[] {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];

  for (const filePath of allFiles) {
    try {
      const questions: Question[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const fileName = path.basename(filePath);
      if (!Array.isArray(questions)) continue;
      for (const q of questions) {
        if (!q.id) continue;
        if (seen.has(q.id)) {
          duplicates.push(`id 중복: "${q.id}" — ${seen.get(q.id)} 와 ${fileName}`);
        } else {
          seen.set(q.id, fileName);
        }
      }
    } catch {
      // 파싱 오류는 개별 검증에서 이미 처리됨
    }
  }

  return duplicates;
}

function main() {
  if (!fs.existsSync(QUESTIONS_DIR)) {
    console.error(`data/questions 디렉토리가 없습니다: ${QUESTIONS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(QUESTIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(QUESTIONS_DIR, f));

  if (files.length === 0) {
    console.log('data/questions/*.json 파일이 없습니다.');
    process.exit(0);
  }

  const results = files.map(validateFile);
  const duplicates = checkDuplicateIds(files);

  let totalCount = 0;
  let totalErrors = 0;
  let hasError = false;

  console.log('\n=== SQLD 문제 데이터 검증 ===\n');

  for (const r of results) {
    totalCount += r.count;
    totalErrors += r.errors.length;
    const status = r.errors.length === 0 ? '✓' : '✗';
    console.log(`${status} ${r.file} — ${r.count}문항${r.errors.length > 0 ? ` (${r.errors.length}개 오류)` : ''}`);
    for (const err of r.errors) {
      console.log(`    오류: ${err}`);
      hasError = true;
    }
  }

  if (duplicates.length > 0) {
    console.log('\n[중복 ID 오류]');
    for (const d of duplicates) {
      console.log(`  ✗ ${d}`);
      hasError = true;
    }
  }

  console.log(`\n합계: ${files.length}개 파일, 총 ${totalCount}문항`);

  if (!hasError) {
    console.log('검증 통과 ✓');
  } else {
    console.log(`\n오류 ${totalErrors + duplicates.length}개 발견 — 수정 후 재실행하세요.`);
    process.exit(1);
  }
}

main();
