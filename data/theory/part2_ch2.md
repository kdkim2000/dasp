# 2과목 2장: SQL 활용

## 1. 집합 연산자 (Set Operators)

### 집합 연산자의 개념
두 개 이상의 SELECT 결과를 하나로 합치는 연산자

> **핵심**: 집합 연산자를 사용할 때 각 SELECT의 컬럼 수와 데이터 타입이 일치해야 한다.

| 연산자 | 설명 | 중복 처리 |
|--------|------|-----------|
| **UNION** | 두 결과의 합집합 | 중복 제거 |
| **UNION ALL** | 두 결과의 합집합 | 중복 포함 |
| **INTERSECT** | 두 결과의 교집합 | 중복 제거 |
| **MINUS** (Oracle) / **EXCEPT** (SQL Server) | 두 결과의 차집합 | 중복 제거 |

```sql
-- UNION: 1과목 또는 2과목 수강자 (중복 제거)
SELECT 학번 FROM 1과목수강
UNION
SELECT 학번 FROM 2과목수강;

-- UNION ALL: 모든 수강 이력 (중복 포함)
SELECT 학번, '1과목' AS 과목 FROM 1과목수강
UNION ALL
SELECT 학번, '2과목' AS 과목 FROM 2과목수강;

-- INTERSECT: 두 과목 모두 수강한 학생
SELECT 학번 FROM 1과목수강
INTERSECT
SELECT 학번 FROM 2과목수강;

-- MINUS: 1과목만 수강한 학생
SELECT 학번 FROM 1과목수강
MINUS
SELECT 학번 FROM 2과목수강;
```

### 집합 연산자 주의사항
- 컬럼의 수가 동일해야 함
- 각 컬럼의 데이터 타입이 호환되어야 함
- 컬럼명은 첫 번째 SELECT 기준으로 결정
- ORDER BY는 마지막에 한 번만 사용

---

## 2. 계층형 쿼리 (Hierarchical Query)

### 계층형 쿼리의 개념
트리 구조의 데이터를 조회할 때 사용하는 Oracle 전용 구문

```sql
-- 기본 구조
SELECT LEVEL, LPAD(' ', (LEVEL-1)*2) || 직원명 AS 조직도, 직원번호, 관리자번호
  FROM 직원
 START WITH 관리자번호 IS NULL      -- 최상위 루트 노드 조건
CONNECT BY PRIOR 직원번호 = 관리자번호  -- 부모→자식 관계
 ORDER SIBLINGS BY 직원명;          -- 같은 레벨 내 정렬
```

### 계층형 쿼리 주요 키워드

| 키워드 | 설명 |
|--------|------|
| `START WITH` | 계층 구조의 시작 노드(루트) 조건 |
| `CONNECT BY PRIOR` | 부모-자식 관계 정의 |
| `LEVEL` | 현재 행의 계층 레벨 (루트=1) |
| `ORDER SIBLINGS BY` | 같은 레벨 내에서 정렬 |
| `CONNECT_BY_ROOT` | 루트 노드의 컬럼값 반환 |
| `SYS_CONNECT_BY_PATH` | 루트부터 현재까지의 경로 |
| `CONNECT_BY_ISLEAF` | 리프 노드 여부 (1=리프, 0=아님) |

```sql
-- 계층형 쿼리 심화
SELECT LEVEL,
       SYS_CONNECT_BY_PATH(직원명, '/') AS 경로,
       CONNECT_BY_ROOT 직원명 AS 최상위관리자,
       CONNECT_BY_ISLEAF AS 리프여부
  FROM 직원
 START WITH 관리자번호 IS NULL
CONNECT BY PRIOR 직원번호 = 관리자번호;
```

> **핵심**: `PRIOR` 위치에 따라 방향이 결정된다.
> - `CONNECT BY PRIOR 자식 = 부모` → 부모에서 자식 방향 (하향식)
> - `CONNECT BY PRIOR 부모 = 자식` → 자식에서 부모 방향 (상향식)

---

## 3. 서브쿼리 심화

### 상관 서브쿼리 (Correlated Subquery)
외부 쿼리의 값을 참조하는 서브쿼리. 외부 쿼리의 각 행에 대해 서브쿼리가 실행됨

```sql
-- 부서의 평균보다 급여가 높은 직원 조회
SELECT E.직원명, E.급여, E.부서코드
  FROM 직원 E
 WHERE E.급여 > (SELECT AVG(E2.급여)
                   FROM 직원 E2
                  WHERE E2.부서코드 = E.부서코드);  -- 외부 쿼리 참조!
```

### WITH 절 (Common Table Expression)

```sql
-- WITH 절로 가독성 향상
WITH 부서평균급여 AS (
    SELECT 부서코드, AVG(급여) AS 평균급여
      FROM 직원
     GROUP BY 부서코드
),
고액부서 AS (
    SELECT 부서코드
      FROM 부서평균급여
     WHERE 평균급여 >= 4000000
)
SELECT E.직원명, E.급여
  FROM 직원 E
 WHERE E.부서코드 IN (SELECT 부서코드 FROM 고액부서);
```

---

## 4. 윈도우 함수 (Window Functions / 분석 함수)

### 윈도우 함수의 개념
행과 행 간의 관계를 정의하거나 행과 행 간을 비교, 연산하는 함수

> **핵심**: 윈도우 함수는 GROUP BY와 달리 행을 줄이지 않고 각 행에 집계/순위 결과를 추가한다.

### 기본 문법

```sql
SELECT 컬럼,
       함수명(인수) OVER (
           [PARTITION BY 파티션컬럼]
           [ORDER BY 정렬컬럼]
           [ROWS | RANGE BETWEEN ... AND ...]
       )
  FROM 테이블명;
```

### 순위 함수

| 함수 | 설명 | 동일값 처리 |
|------|------|------------|
| `RANK()` | 순위 부여 (동일 순위면 다음 순위 건너뜀) | 1,1,3,4 |
| `DENSE_RANK()` | 순위 부여 (동일 순위 다음은 연속 순위) | 1,1,2,3 |
| `ROW_NUMBER()` | 고유 순번 부여 (동일값도 서로 다른 번호) | 1,2,3,4 |
| `NTILE(n)` | 전체 행을 n개 버킷으로 분류 | - |

```sql
-- 급여 순위 예시
SELECT 직원명, 급여,
       RANK() OVER (ORDER BY 급여 DESC) AS RANK순위,
       DENSE_RANK() OVER (ORDER BY 급여 DESC) AS DENSE_RANK순위,
       ROW_NUMBER() OVER (ORDER BY 급여 DESC) AS ROW_NUMBER순위
  FROM 직원;

-- 부서별 급여 순위
SELECT 직원명, 부서코드, 급여,
       RANK() OVER (PARTITION BY 부서코드 ORDER BY 급여 DESC) AS 부서내순위
  FROM 직원;
```

### 집계 윈도우 함수

```sql
-- 누적 합계
SELECT 직원명, 급여,
       SUM(급여) OVER (ORDER BY 직원번호) AS 누적급여합,
       AVG(급여) OVER (PARTITION BY 부서코드) AS 부서평균급여
  FROM 직원;
```

### 행 순서 함수

| 함수 | 설명 |
|------|------|
| `FIRST_VALUE(컬럼)` | 파티션 내 첫 번째 값 |
| `LAST_VALUE(컬럼)` | 파티션 내 마지막 값 |
| `LAG(컬럼, n, default)` | 현재 행에서 n행 이전 값 |
| `LEAD(컬럼, n, default)` | 현재 행에서 n행 이후 값 |

```sql
-- 전월 대비 급여 변화 분석
SELECT 직원명, 지급월, 급여,
       LAG(급여, 1, 0) OVER (PARTITION BY 직원번호 ORDER BY 지급월) AS 전월급여,
       급여 - LAG(급여, 1, 0) OVER (PARTITION BY 직원번호 ORDER BY 지급월) AS 급여변화
  FROM 급여이력;
```

### ROWS vs RANGE

| 구분 | 설명 |
|------|------|
| **ROWS** | 물리적인 행 단위로 범위 지정 |
| **RANGE** | 논리적인 값 범위로 지정 (기본값) |

```sql
-- ROWS BETWEEN: 현재 행 포함 이전 2행부터 현재까지
SELECT 날짜, 매출,
       SUM(매출) OVER (ORDER BY 날짜
           ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS 3일이동평균
  FROM 일별매출;
```

---

## 5. 그룹 함수 (Group Functions)

### ROLLUP

소계 및 총계를 자동으로 생성

```sql
-- 부서별, 직급별 급여 합계 + 소계 + 총계
SELECT 부서코드, 직급, SUM(급여) AS 급여합계
  FROM 직원
 GROUP BY ROLLUP (부서코드, 직급);
-- 결과: 부서+직급별 → 부서별 소계 → 총계 순으로 출력
```

### CUBE

모든 가능한 조합의 소계를 생성 (ROLLUP보다 많은 그룹 생성)

```sql
SELECT 부서코드, 직급, SUM(급여) AS 급여합계
  FROM 직원
 GROUP BY CUBE (부서코드, 직급);
-- 결과: 부서+직급, 부서별, 직급별, 전체 총계
```

### GROUPING SETS

특정 그룹핑 조합만 선택하여 집계

```sql
SELECT 부서코드, 직급, SUM(급여) AS 급여합계
  FROM 직원
 GROUP BY GROUPING SETS ((부서코드, 직급), (부서코드), ());
-- 위 ROLLUP과 동일한 결과
```

### GROUPING 함수

소계 행인지 판별 (소계 행이면 1, 아니면 0 반환)

```sql
SELECT DECODE(GROUPING(부서코드), 1, '전체부서', 부서코드) AS 부서코드,
       DECODE(GROUPING(직급), 1, '전체직급', 직급) AS 직급,
       SUM(급여) AS 급여합계
  FROM 직원
 GROUP BY ROLLUP (부서코드, 직급);
```

### ROLLUP vs CUBE vs GROUPING SETS 비교

| 구분 | 생성 그룹 수 | 설명 |
|------|-------------|------|
| `ROLLUP(A, B)` | 3가지: (A,B), (A), () | 계층적 소계 |
| `CUBE(A, B)` | 4가지: (A,B), (A), (B), () | 모든 조합 소계 |
| `GROUPING SETS((A,B),(A))` | 지정한 만큼 | 원하는 조합만 |

---

## 6. 뷰 (View)

### 뷰의 개념
하나 이상의 테이블로부터 정의된 **가상의 테이블**. 실제 데이터는 저장하지 않고 SELECT 문만 저장

```sql
-- 뷰 생성
CREATE VIEW 서울직원뷰 AS
SELECT E.직원번호, E.직원명, E.급여, D.부서명
  FROM 직원 E, 부서 D
 WHERE E.부서코드 = D.부서코드
   AND D.지역 = '서울';

-- 뷰 조회
SELECT * FROM 서울직원뷰 WHERE 급여 >= 3000000;

-- 뷰 삭제
DROP VIEW 서울직원뷰;
```

### 뷰의 장단점

| 장점 | 단점 |
|------|------|
| 독립성 (테이블 변경 영향 최소화) | 인덱스 사용 불가 |
| 편리성 (복잡한 쿼리 단순화) | 뷰 자체 변경 불가 (쿼리 재작성 필요) |
| 보안성 (특정 컬럼만 노출 가능) | DML 제한 (복잡한 뷰는 UPDATE 불가) |

---

## 7. 피벗(PIVOT)과 언피벗(UNPIVOT)

### PIVOT: 행을 열로 변환

```sql
-- CASE를 이용한 피벗 (표준 SQL)
SELECT 직원번호,
       SUM(CASE WHEN 분기 = 'Q1' THEN 매출액 ELSE 0 END) AS Q1매출,
       SUM(CASE WHEN 분기 = 'Q2' THEN 매출액 ELSE 0 END) AS Q2매출,
       SUM(CASE WHEN 분기 = 'Q3' THEN 매출액 ELSE 0 END) AS Q3매출,
       SUM(CASE WHEN 분기 = 'Q4' THEN 매출액 ELSE 0 END) AS Q4매출
  FROM 분기별매출
 GROUP BY 직원번호;

-- Oracle PIVOT 함수
SELECT *
  FROM 분기별매출
 PIVOT (SUM(매출액) FOR 분기 IN ('Q1' AS Q1, 'Q2' AS Q2, 'Q3' AS Q3, 'Q4' AS Q4));
```

---

## 8. 정규식 함수 (Regular Expression)

| 함수 | 설명 |
|------|------|
| `REGEXP_LIKE(str, pattern)` | 패턴 일치 여부 확인 |
| `REGEXP_SUBSTR(str, pattern)` | 패턴에 맞는 문자열 추출 |
| `REGEXP_REPLACE(str, pattern, replace)` | 패턴 문자열 치환 |
| `REGEXP_INSTR(str, pattern)` | 패턴 문자열 위치 반환 |

```sql
-- 이메일 형식 확인
SELECT 직원명, 이메일
  FROM 직원
 WHERE REGEXP_LIKE(이메일, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

---

## 9. 성능 관련 SQL 작성 기법

### EXISTS vs IN

```sql
-- IN: 서브쿼리 결과 목록에 있으면 선택
SELECT * FROM 직원
 WHERE 부서코드 IN (SELECT 부서코드 FROM 부서 WHERE 지역='서울');

-- EXISTS: 서브쿼리에 행이 존재하면 선택 (일반적으로 대용량에서 빠름)
SELECT * FROM 직원 E
 WHERE EXISTS (SELECT 1 FROM 부서 D
               WHERE D.부서코드 = E.부서코드
                 AND D.지역 = '서울');
```

### NULL 처리 주의사항

```sql
-- NOT IN에서 NULL 주의!
-- 서브쿼리 결과에 NULL이 포함되면 NOT IN은 항상 FALSE 반환
SELECT * FROM 직원
 WHERE 부서코드 NOT IN (SELECT 부서코드 FROM 부서 WHERE 지역 = '서울');
-- 부서 테이블에 부서코드 NULL이 있으면 결과 없음!

-- 해결책: NOT EXISTS 사용 또는 IS NOT NULL 조건 추가
SELECT * FROM 직원 E
 WHERE NOT EXISTS (SELECT 1 FROM 부서 D
                   WHERE D.부서코드 = E.부서코드
                     AND D.지역 = '서울');
```

---

## 10. MERGE 문 (Oracle)

여러 테이블의 데이터를 비교하여 INSERT/UPDATE/DELETE를 한 번에 처리

```sql
MERGE INTO 대상테이블 T
USING 소스테이블 S ON (T.키 = S.키)
WHEN MATCHED THEN
    UPDATE SET T.컬럼1 = S.컬럼1, T.컬럼2 = S.컬럼2
WHEN NOT MATCHED THEN
    INSERT (키, 컬럼1, 컬럼2)
    VALUES (S.키, S.컬럼1, S.컬럼2);
```

---

## 출제 포인트

1. **집합 연산자**: UNION(중복제거)/UNION ALL(중복포함)/INTERSECT/MINUS
2. **계층형 쿼리**: START WITH(루트조건), CONNECT BY PRIOR(부모→자식), LEVEL(레벨번호)
3. **윈도우 함수**: RANK(동일순위→건너뜀), DENSE_RANK(연속), ROW_NUMBER(고유번호)
4. **LAG/LEAD**: 이전/이후 행 값 참조
5. **PARTITION BY**: 그룹별로 윈도우 함수 적용
6. **ROLLUP**: 계층적 소계 (N+1개 그룹), CUBE: 모든 조합 (2^N개 그룹)
7. **GROUPING()**: 소계 행이면 1, 데이터 행이면 0
8. **뷰**: 가상 테이블, 복잡한 쿼리 단순화, 보안, 실제 데이터 미저장
9. **NOT IN + NULL**: 서브쿼리에 NULL 포함 시 결과 없음 → NOT EXISTS 권장
10. **WITH절**: 복잡한 쿼리를 단계별로 분리하여 가독성 향상
