# 2과목 1장: SQL 기본

## 1. 관계형 데이터베이스 개요

### 관계형 데이터베이스 (RDBMS)
데이터를 **테이블(Table)** 형태로 저장하고, 테이블 간의 **관계(Relationship)** 를 이용하여 데이터를 관리하는 데이터베이스 시스템

| 용어 | 설명 |
|------|------|
| **테이블(Table)** | 데이터를 행과 열로 구성한 2차원 구조 |
| **행(Row)/튜플** | 테이블의 가로 데이터 단위 (인스턴스) |
| **열(Column)/속성** | 테이블의 세로 데이터 단위 |
| **도메인(Domain)** | 각 컬럼에 허용될 수 있는 값의 범위 |
| **기본키(PK)** | 각 행을 유일하게 식별하는 컬럼 |
| **외래키(FK)** | 다른 테이블의 PK를 참조하는 컬럼 |

### SQL (Structured Query Language)
관계형 데이터베이스에서 데이터를 **정의, 조작, 제어**하기 위한 표준 언어

| 구분 | 종류 | 설명 |
|------|------|------|
| **DDL** (Data Definition Language) | CREATE, ALTER, DROP, TRUNCATE, RENAME | 데이터 구조 정의 |
| **DML** (Data Manipulation Language) | SELECT, INSERT, UPDATE, DELETE | 데이터 조작 |
| **DCL** (Data Control Language) | GRANT, REVOKE | 데이터 접근 권한 제어 |
| **TCL** (Transaction Control Language) | COMMIT, ROLLBACK, SAVEPOINT | 트랜잭션 제어 |

---

## 2. DDL (Data Definition Language)

### CREATE TABLE

```sql
CREATE TABLE 직원 (
    직원번호    VARCHAR2(10)   NOT NULL,
    직원명      VARCHAR2(50)   NOT NULL,
    부서코드    VARCHAR2(10),
    입사일자    DATE,
    급여        NUMBER(10,2)   DEFAULT 0,
    CONSTRAINT PK_직원 PRIMARY KEY (직원번호),
    CONSTRAINT FK_직원_부서 FOREIGN KEY (부서코드)
        REFERENCES 부서(부서코드)
);
```

### 제약조건 (Constraints)

| 제약조건 | 설명 |
|----------|------|
| **PRIMARY KEY** | 기본키: NOT NULL + UNIQUE, 테이블당 1개만 허용 |
| **UNIQUE** | 유일성 보장, NULL 허용 |
| **NOT NULL** | NULL 값 불허 |
| **CHECK** | 지정된 조건에 맞는 데이터만 허용 |
| **FOREIGN KEY** | 참조 무결성 보장, 다른 테이블 PK 참조 |
| **DEFAULT** | 값이 없을 경우 기본값 지정 |

### ALTER TABLE

```sql
-- 컬럼 추가
ALTER TABLE 직원 ADD 이메일 VARCHAR2(100);

-- 컬럼 수정
ALTER TABLE 직원 MODIFY 직원명 VARCHAR2(100) NOT NULL;

-- 컬럼 삭제
ALTER TABLE 직원 DROP COLUMN 이메일;

-- 제약조건 추가
ALTER TABLE 직원 ADD CONSTRAINT UK_직원_이메일 UNIQUE (이메일);

-- 테이블명 변경
RENAME 직원 TO 사원;
```

### DROP vs TRUNCATE vs DELETE

| 구분 | DROP | TRUNCATE | DELETE |
|------|------|----------|--------|
| 종류 | DDL | DDL | DML |
| 롤백 가능 | 불가 | 불가 | 가능 |
| 로그 기록 | 없음 | 없음(최소) | 있음 |
| 대상 | 테이블 자체 삭제 | 데이터 전체 삭제 | 행 단위 삭제 |
| WHERE 사용 | 불가 | 불가 | 가능 |

> **핵심**: DDL(CREATE, ALTER, DROP, TRUNCATE)은 AUTO COMMIT이 적용되어 롤백이 불가능하다.

---

## 3. DML - SELECT 문

### 기본 SELECT 구문

```sql
SELECT [DISTINCT] 컬럼명1, 컬럼명2, ...
  FROM 테이블명
 WHERE 조건
 GROUP BY 컬럼명
HAVING 그룹조건
 ORDER BY 컬럼명 [ASC | DESC];
```

### SELECT 실행 순서

```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
```

> **핵심**: SQL 실행 순서는 작성 순서와 다르다. FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 순서로 실행된다.

### DISTINCT와 ALIAS

```sql
-- 중복 제거
SELECT DISTINCT 부서코드 FROM 직원;

-- 별명(ALIAS) 사용
SELECT 직원명 AS 이름, 급여 * 12 AS 연봉
  FROM 직원;

-- 연결 연산자 (Oracle)
SELECT 직원명 || '의 급여는 ' || 급여 || '원입니다.' AS 급여정보
  FROM 직원;
```

---

## 4. WHERE 절

### 비교 연산자

| 연산자 | 설명 | 예시 |
|--------|------|------|
| `=` | 같음 | WHERE 부서코드 = 'A001' |
| `<>`, `!=` | 다름 | WHERE 급여 <> 0 |
| `>`, `>=` | 초과, 이상 | WHERE 급여 >= 3000000 |
| `<`, `<=` | 미만, 이하 | WHERE 급여 < 5000000 |

### SQL 연산자

```sql
-- BETWEEN: 범위 조건 (경계값 포함)
SELECT * FROM 직원 WHERE 급여 BETWEEN 3000000 AND 5000000;

-- IN: 목록에서 선택
SELECT * FROM 직원 WHERE 부서코드 IN ('A001', 'A002', 'B001');

-- LIKE: 패턴 검색
SELECT * FROM 직원 WHERE 직원명 LIKE '김%';   -- '김'으로 시작
SELECT * FROM 직원 WHERE 직원명 LIKE '%수';   -- '수'로 끝남
SELECT * FROM 직원 WHERE 직원명 LIKE '_철_';  -- 가운데 '철' 포함 3글자

-- IS NULL / IS NOT NULL
SELECT * FROM 직원 WHERE 부서코드 IS NULL;
SELECT * FROM 직원 WHERE 부서코드 IS NOT NULL;
```

> **핵심**: NULL 비교는 반드시 IS NULL 또는 IS NOT NULL을 사용해야 한다. `= NULL`은 항상 FALSE를 반환한다.

### 논리 연산자

```sql
-- AND: 모두 만족
SELECT * FROM 직원 WHERE 급여 >= 3000000 AND 부서코드 = 'A001';

-- OR: 하나 이상 만족
SELECT * FROM 직원 WHERE 부서코드 = 'A001' OR 부서코드 = 'B001';

-- NOT: 부정
SELECT * FROM 직원 WHERE NOT 부서코드 = 'A001';
```

### 연산자 우선순위

```
1. 괄호 ()
2. NOT
3. 비교 연산자 (=, <>, <, >, <=, >=)
4. AND
5. OR
```

---

## 5. 함수 (Functions)

### 단일행 함수

#### 문자 함수

| 함수 | 설명 | 예시 |
|------|------|------|
| `UPPER(str)` | 대문자 변환 | UPPER('hello') → 'HELLO' |
| `LOWER(str)` | 소문자 변환 | LOWER('HELLO') → 'hello' |
| `SUBSTR(str, pos, len)` | 문자열 추출 | SUBSTR('ABCDE', 2, 3) → 'BCD' |
| `LENGTH(str)` | 문자열 길이 | LENGTH('HELLO') → 5 |
| `TRIM(str)` | 양쪽 공백 제거 | TRIM('  AB  ') → 'AB' |
| `LTRIM(str)` | 왼쪽 제거 | LTRIM('  AB') → 'AB' |
| `RTRIM(str)` | 오른쪽 제거 | RTRIM('AB  ') → 'AB' |
| `REPLACE(str, old, new)` | 문자 치환 | REPLACE('ABCABC', 'A', 'X') → 'XBCXBC' |
| `LPAD(str, n, pad)` | 왼쪽 채우기 | LPAD('123', 5, '0') → '00123' |
| `RPAD(str, n, pad)` | 오른쪽 채우기 | RPAD('123', 5, '0') → '12300' |
| `CONCAT(str1, str2)` | 문자열 연결 | CONCAT('AB', 'CD') → 'ABCD' |

#### 숫자 함수

| 함수 | 설명 | 예시 |
|------|------|------|
| `ROUND(n, d)` | 반올림 | ROUND(3.456, 2) → 3.46 |
| `TRUNC(n, d)` | 버림(절삭) | TRUNC(3.456, 2) → 3.45 |
| `CEIL(n)` | 올림 | CEIL(3.1) → 4 |
| `FLOOR(n)` | 내림 | FLOOR(3.9) → 3 |
| `MOD(n, m)` | 나머지 | MOD(10, 3) → 1 |
| `ABS(n)` | 절대값 | ABS(-5) → 5 |
| `SIGN(n)` | 부호 (-1, 0, 1) | SIGN(-5) → -1 |

#### 날짜 함수

```sql
-- 현재 날짜/시간
SELECT SYSDATE FROM DUAL;         -- Oracle
SELECT GETDATE() FROM DUAL;       -- SQL Server

-- 날짜 연산 (Oracle)
SELECT SYSDATE + 1 FROM DUAL;     -- 다음날
SELECT SYSDATE - 7 FROM DUAL;     -- 7일 전

-- 날짜 함수
SELECT MONTHS_BETWEEN(SYSDATE, 입사일자) AS 근속월수 FROM 직원;
SELECT ADD_MONTHS(SYSDATE, 3) FROM DUAL;     -- 3개월 후
SELECT NEXT_DAY(SYSDATE, '월요일') FROM DUAL; -- 다음 월요일
SELECT LAST_DAY(SYSDATE) FROM DUAL;           -- 해당월 마지막 날

-- 날짜 형식 변환
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;
SELECT TO_DATE('2024-01-01', 'YYYY-MM-DD') FROM DUAL;
```

### NULL 관련 함수

| 함수 | 설명 | 예시 |
|------|------|------|
| `NVL(expr, value)` | NULL이면 대체값 반환 | NVL(급여, 0) |
| `NVL2(expr, val1, val2)` | NOT NULL이면 val1, NULL이면 val2 | NVL2(급여, '급여있음', '급여없음') |
| `NULLIF(expr1, expr2)` | 두 값이 같으면 NULL, 다르면 expr1 | NULLIF(급여, 0) |
| `COALESCE(e1, e2, ...)` | NULL이 아닌 첫 번째 값 반환 | COALESCE(급여, 0) |

### CASE 표현식

```sql
-- 단순 CASE
SELECT 직원명,
       CASE 부서코드
           WHEN 'A001' THEN '영업부'
           WHEN 'B001' THEN '개발부'
           ELSE '기타'
       END AS 부서명
  FROM 직원;

-- 검색 CASE
SELECT 직원명,
       CASE
           WHEN 급여 >= 5000000 THEN '고액연봉'
           WHEN 급여 >= 3000000 THEN '중간연봉'
           ELSE '일반연봉'
       END AS 급여등급
  FROM 직원;

-- DECODE (Oracle 전용)
SELECT DECODE(부서코드, 'A001', '영업부', 'B001', '개발부', '기타') AS 부서명
  FROM 직원;
```

---

## 6. GROUP BY와 집계 함수

### 집계 함수 (Aggregate Functions)

| 함수 | 설명 | NULL 처리 |
|------|------|-----------|
| `COUNT(*)` | 전체 행 수 | NULL 포함 |
| `COUNT(컬럼)` | 해당 컬럼 NOT NULL 행 수 | NULL 제외 |
| `SUM(컬럼)` | 합계 | NULL 제외 |
| `AVG(컬럼)` | 평균 | NULL 제외 |
| `MAX(컬럼)` | 최대값 | NULL 제외 |
| `MIN(컬럼)` | 최소값 | NULL 제외 |

> **핵심**: 집계 함수는 NULL을 제외하고 계산한다. 단, COUNT(*)는 NULL 행도 포함한다.

```sql
-- 부서별 평균 급여
SELECT 부서코드, COUNT(*) AS 인원수, AVG(급여) AS 평균급여
  FROM 직원
 GROUP BY 부서코드
HAVING AVG(급여) >= 3000000
 ORDER BY 평균급여 DESC;
```

### WHERE vs HAVING

| 구분 | WHERE | HAVING |
|------|-------|--------|
| 적용 대상 | 개별 행(Row) | 그룹(Group) |
| 집계 함수 사용 | 불가 | 가능 |
| 실행 순서 | GROUP BY 이전 | GROUP BY 이후 |

---

## 7. JOIN

### 조인의 개념
두 개 이상의 테이블을 연결하여 데이터를 조회하는 방법

### INNER JOIN (내부 조인)
두 테이블에서 **공통으로 존재하는 데이터**만 조회

```sql
-- ANSI 표준 문법
SELECT E.직원명, D.부서명
  FROM 직원 E
  INNER JOIN 부서 D ON E.부서코드 = D.부서코드;

-- Oracle 전통 문법
SELECT E.직원명, D.부서명
  FROM 직원 E, 부서 D
 WHERE E.부서코드 = D.부서코드;
```

### OUTER JOIN (외부 조인)
한쪽 테이블의 모든 데이터를 포함하고, 상대방에 없는 경우 NULL로 채움

```sql
-- LEFT OUTER JOIN: 왼쪽 테이블 모두 표시
SELECT E.직원명, D.부서명
  FROM 직원 E
  LEFT OUTER JOIN 부서 D ON E.부서코드 = D.부서코드;

-- RIGHT OUTER JOIN: 오른쪽 테이블 모두 표시
SELECT E.직원명, D.부서명
  FROM 직원 E
  RIGHT OUTER JOIN 부서 D ON E.부서코드 = D.부서코드;

-- FULL OUTER JOIN: 양쪽 모두 표시
SELECT E.직원명, D.부서명
  FROM 직원 E
  FULL OUTER JOIN 부서 D ON E.부서코드 = D.부서코드;

-- Oracle 외부 조인 (+) 표기
SELECT E.직원명, D.부서명
  FROM 직원 E, 부서 D
 WHERE E.부서코드 = D.부서코드(+);  -- LEFT OUTER JOIN
```

### CROSS JOIN (카테시안 곱)
두 테이블의 모든 행을 곱한 결과 반환 (WHERE 절 없이 조인 시 발생)

```sql
SELECT E.직원명, D.부서명
  FROM 직원 E
  CROSS JOIN 부서 D;
-- 직원 10명 × 부서 5개 = 50행 반환
```

### SELF JOIN (자체 조인)
같은 테이블을 별명을 달리하여 조인

```sql
-- 직원과 그 직원의 관리자 조회
SELECT E.직원명, M.직원명 AS 관리자명
  FROM 직원 E
  LEFT JOIN 직원 M ON E.관리자번호 = M.직원번호;
```

---

## 8. 서브쿼리 (Subquery)

### 서브쿼리의 개념
하나의 SQL 문 안에 포함된 또 다른 SELECT 문

### 서브쿼리 종류 (위치에 따라)

| 종류 | 위치 | 설명 |
|------|------|------|
| **스칼라 서브쿼리** | SELECT 절 | 단일 값 반환 |
| **인라인 뷰** | FROM 절 | 가상 테이블로 사용 |
| **중첩 서브쿼리** | WHERE 절 | 조건으로 사용 |

### 서브쿼리 종류 (반환 값에 따라)

| 종류 | 반환 | 사용 연산자 |
|------|------|-------------|
| **단일행 서브쿼리** | 1개 행, 1개 컬럼 | =, <>, >, >=, <, <= |
| **다중행 서브쿼리** | 여러 행, 1개 컬럼 | IN, ANY, ALL, EXISTS |
| **다중컬럼 서브쿼리** | 여러 행, 여러 컬럼 | IN, NOT IN |

```sql
-- 단일행 서브쿼리
SELECT 직원명, 급여
  FROM 직원
 WHERE 급여 > (SELECT AVG(급여) FROM 직원);

-- 다중행 서브쿼리 (IN)
SELECT 직원명
  FROM 직원
 WHERE 부서코드 IN (SELECT 부서코드 FROM 부서 WHERE 지역 = '서울');

-- EXISTS 서브쿼리
SELECT 직원명
  FROM 직원 E
 WHERE EXISTS (SELECT 1 FROM 주문 O WHERE O.담당직원 = E.직원번호);

-- 스칼라 서브쿼리 (SELECT 절)
SELECT 직원명,
       (SELECT 부서명 FROM 부서 WHERE 부서코드 = E.부서코드) AS 부서명
  FROM 직원 E;

-- 인라인 뷰 (FROM 절)
SELECT 직원명, 급여
  FROM (SELECT 직원명, 급여, RANK() OVER(ORDER BY 급여 DESC) AS 급여순위
          FROM 직원)
 WHERE 급여순위 <= 3;
```

### ANY / ALL 연산자

| 연산자 | 설명 | 예시 |
|--------|------|------|
| `> ANY` | 서브쿼리 결과 중 최솟값보다 크면 | 어느 하나라도 크면 |
| `> ALL` | 서브쿼리 결과의 최댓값보다 크면 | 모두보다 크면 |
| `= ANY` | IN과 동일 | IN과 같음 |

---

## 9. DML (Data Manipulation Language)

### INSERT

```sql
-- 모든 컬럼 삽입
INSERT INTO 직원 VALUES ('E001', '홍길동', 'A001', SYSDATE, 3000000);

-- 특정 컬럼만 삽입
INSERT INTO 직원 (직원번호, 직원명, 급여)
VALUES ('E002', '김철수', 2500000);

-- 서브쿼리 이용 삽입
INSERT INTO 직원_백업
SELECT * FROM 직원 WHERE 부서코드 = 'A001';
```

### UPDATE

```sql
-- 단순 업데이트
UPDATE 직원
   SET 급여 = 급여 * 1.1
 WHERE 부서코드 = 'A001';

-- 서브쿼리 이용 업데이트
UPDATE 직원
   SET 급여 = (SELECT AVG(급여) FROM 직원)
 WHERE 부서코드 = 'C001';
```

### DELETE

```sql
-- 특정 행 삭제
DELETE FROM 직원 WHERE 직원번호 = 'E001';

-- 전체 삭제 (롤백 가능, 로그 기록)
DELETE FROM 직원;
```

---

## 10. TCL (Transaction Control Language)

### 트랜잭션의 특성 (ACID)

| 특성 | 설명 |
|------|------|
| **원자성** (Atomicity) | 트랜잭션은 전부 실행되거나 전부 실행되지 않아야 함 |
| **일관성** (Consistency) | 트랜잭션 전후에 데이터 무결성이 유지되어야 함 |
| **격리성** (Isolation) | 동시 실행되는 트랜잭션이 서로 영향을 주지 않아야 함 |
| **지속성** (Durability) | 완료된 트랜잭션의 결과는 영구적으로 반영되어야 함 |

### TCL 명령어

```sql
-- COMMIT: 변경 내용 영구 저장
INSERT INTO 직원 VALUES ('E003', '이순신', 'B001', SYSDATE, 4000000);
COMMIT;

-- ROLLBACK: 변경 내용 취소 (마지막 COMMIT 또는 초기 상태로)
UPDATE 직원 SET 급여 = 0;
ROLLBACK;  -- 급여 0으로 변경 취소

-- SAVEPOINT: 중간 저장점 설정
INSERT INTO 직원 VALUES ('E004', '강감찬', 'A001', SYSDATE, 3500000);
SAVEPOINT SP1;
INSERT INTO 직원 VALUES ('E005', '유관순', 'B001', SYSDATE, 2800000);
ROLLBACK TO SP1;  -- E005만 취소, E004는 유지
```

> **핵심**: DDL(CREATE, ALTER, DROP, TRUNCATE)은 실행 즉시 AUTO COMMIT된다. DML(INSERT, UPDATE, DELETE)은 명시적으로 COMMIT/ROLLBACK 해야 한다.

---

## 11. DCL (Data Control Language)

### 권한 부여와 회수

```sql
-- 권한 부여
GRANT SELECT, INSERT ON 직원 TO 사용자A;
GRANT SELECT ON 직원 TO PUBLIC;           -- 모든 사용자에게
GRANT SELECT ON 직원 TO 사용자A WITH GRANT OPTION;  -- 재부여 권한 포함

-- 권한 회수
REVOKE SELECT ON 직원 FROM 사용자A;
REVOKE SELECT ON 직원 FROM 사용자A CASCADE;  -- 재부여된 권한도 회수

-- 롤(ROLE) 사용
CREATE ROLE 직원관리자;
GRANT SELECT, INSERT, UPDATE ON 직원 TO 직원관리자;
GRANT 직원관리자 TO 사용자A;
```

---

## 출제 포인트

1. **SQL 실행 순서**: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
2. **DDL vs DML**: DDL은 AUTO COMMIT, DML은 수동 COMMIT
3. **NULL 처리**: IS NULL/IS NOT NULL 사용, `= NULL`은 항상 FALSE
4. **집계함수 NULL**: COUNT(*)만 NULL 포함, 나머지는 NULL 제외
5. **WHERE vs HAVING**: WHERE는 개별행, HAVING은 그룹에 조건
6. **OUTER JOIN**: LEFT는 왼쪽 모두, RIGHT는 오른쪽 모두, Oracle은 (+)로 표기
7. **서브쿼리 위치**: SELECT절(스칼라), FROM절(인라인뷰), WHERE절(중첩)
8. **BETWEEN**: 경계값 포함 (>= AND <=)
9. **트랜잭션 ACID**: 원자성, 일관성, 격리성, 지속성
10. **ROLLBACK**: 마지막 COMMIT 이후 DML 변경사항 전체 취소
