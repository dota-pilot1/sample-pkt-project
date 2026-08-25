# PKT Study Fullstack Next.js 서버 라우트 리팩토링 계획

> 진행 상태: 구조 리팩토링과 자동 아키텍처 체크 완료. 일반/공개 Playbook Route Handler와 LLM 유스케이스에서 직접 DB 접근을 제거하고, LLM HTTP 응답 처리를 별도 adapter로 분리했다. DB 연결과 DDL/호환 컬럼은 `server/db/connection.ts`, `server/db/migrations.ts`로, 샘플 콘텐츠 원본은 `server/db/seed-content.ts`로 이전했다. UI의 기존 상대 경로는 역할 호환용 re-export로 유지했다. 서버/API 대상 lint, TypeScript, production build, 자동 아키텍처 체크를 통과했고, 로컬 실행 서버에서 health/일반 Playbook/LLM Playbook API smoke test도 HTTP 200으로 확인했다. 후속 lint 경고 7건도 effect 의존성과 Lexical 동적 이미지 처리 의도를 반영해 0건으로 정리했다.

## 1. 목적

`pkt-study-fullstack` Next.js Route Handler에 혼재된 인증, 권한 판단, 문서 계층 처리, Drizzle 쿼리를 분리한다.

이번 리팩토링의 목표는 정통 DDD를 그대로 복제하는 것이 아니라, Next.js 로컬 모놀리스에 맞는 다음 의존 방향을 만드는 것이다.

```text
Route Handler -> Application Service -> Functional Repository -> Drizzle/SQLite
```

## 2. 현재 문제

### 2.1 Route Handler의 책임 과다

다음 라우트들이 `db`, `@/db/schema`, Drizzle 연산자를 직접 사용한다.

- `hospital-playbook/documents/[id]`
- `hospital-playbook/documents/[id]/ai-edit-token`
- `hospital-playbook/topics/[topicId]/documents`
- `hospital-playbook/comments`
- `hospital-playbook/comments/[id]`
- `hospital-playbook/search`
- `auth/login`
- `proof-entries`

특히 문서 삭제 라우트는 HTTP 처리와 하위 문서 탐색, 댓글 삭제, 문서 삭제를 모두 수행한다.

### 2.2 일반 API와 LLM API의 중복

문서 생성·수정·삭제·재정렬 규칙이 일반 API Route Handler와 `src/server/llm-playbook.ts`에 나뉘어 구현되어 있다. 두 API의 정책이 서로 달라질 수 있다.

### 2.3 서버 계층의 HTTP·DB 결합

`src/server/llm-playbook.ts`는 `NextResponse`와 Drizzle을 모두 알고 있다. 유스케이스를 Next.js HTTP 환경과 독립적으로 테스트하기 어렵다.

### 2.4 `database.ts`의 책임 과다

`src/server/database.ts`가 DB 경로, 복구, 연결, DDL, 마이그레이션, 계정 부트스트랩, 샘플 시딩을 모두 담고 있다. 또한 `widgets` 계층의 샘플 데이터를 import하여 서버가 UI 모듈에 의존한다.

### 2.5 테스트 부재

문서 계층 삭제, 재정렬, 권한, 버전 충돌을 검증하는 자동화 테스트가 없다.

## 3. 이번 리팩토링의 범위

### 포함

- 일반 Playbook API와 LLM Playbook API의 공통 유스케이스 추출
- Route Handler에서 Playbook Drizzle 직접 접근 제거
- 함수형 Playbook Repository 추출
- 문서 계층 삭제·재정렬의 트랜잭션 경계 정리
- 서비스와 HTTP 오류 응답 변환 분리
- DB 연결·부트스트랩·시딩 책임 분리
- 핵심 Playbook 유스케이스 테스트 추가

### 제외

- Repository interface와 Drizzle 구현체를 나누는 정통 헥사고날 구조
- DI 컨테이너 도입
- DB 스키마 변경
- API URL, 요청·응답 형식, 정상 응답 상태 코드 변경
- 기존 권한 정책의 의도적 변경
- Auth, Backup, Proof Entry의 전면 재설계

권한 정책은 일단 기존 동작을 보존한다. 댓글·문서의 작성자/관리자 제한은 별도 기능 변경으로 처리하여 구조 리팩토링과 섞지 않는다.

## 4. 목표 구조

```text
pkt-study-fullstack/src/
├─ app/api/
│  ├─ hospital-playbook/**/route.ts
│  └─ llm/hospital-playbook/**/route.ts
└─ server/
   ├─ db/
   │  ├─ connection.ts
   │  ├─ bootstrap.ts
   │  ├─ migrations.ts
   │  └─ seeds/
   │     ├─ core-seed.ts
   │     └─ playbook-seed.ts
   ├─ http/
   │  └─ error-response.ts
   └─ modules/
      └─ playbook/
         ├─ playbook-service.ts
         ├─ playbook-repository.ts
         ├─ playbook-errors.ts
         └─ playbook-types.ts
```

### Route Handler의 책임

- path/query/body 파싱
- 요청 형식 검증
- 세션 확인과 actor 생성
- application service 호출
- 서비스 결과를 HTTP 응답으로 변환

### Service의 책임

- 문서·토픽·카테고리 유스케이스 조합
- 작성자·관리자 등 권한 정책
- 상위/하위 문서 규칙
- version conflict 검증
- 트랜잭션 경계
- Not Found, Forbidden, Conflict 등 의미 있는 오류 발생

### Functional Repository의 책임

- Drizzle와 `@/db/schema` 의존 집중
- 조회·생성·수정·삭제 쿼리
- service에서 사용할 의미 있는 함수 제공
- 트랜잭션 executor를 받아 같은 쿼리를 재사용할 수 있게 설계

Repository class, interface, factory는 만들지 않고 함수 모듈로 시작한다.

## 5. 구현 단계

### 0단계. 기준 동작 고정

- [ ] Playbook Route Handler의 URL, 메서드, 상태 코드, 응답 형식을 목록화한다.
- [ ] 문서 생성·수정·삭제·재정렬의 characterization test를 추가한다.
- [ ] 일반 API와 LLM API의 현재 차이를 기록한다.

### 1단계. Repository 추출

- [ ] `playbook-repository.ts`를 생성한다.
- [ ] `server/playbook.ts`, `server/llm-playbook.ts`, Playbook Route Handler에서 사용하는 Drizzle 쿼리를 Repository 함수로 이동한다.
- [ ] 이 단계에서는 업무 규칙과 HTTP 응답을 변경하지 않는다.

### 2단계. Service 추출과 유스케이스 통합

- [ ] 카테고리·토픽·문서·댓글 유스케이스를 `playbook-service.ts`로 이동한다.
- [ ] 일반 API와 LLM API가 같은 생성·수정·삭제·재정렬 서비스를 호출하게 한다.
- [ ] LLM API의 로컬 접근 제한과 API 전용 입력 규칙은 HTTP adapter에 유지한다.
- [ ] 문서 계층 삭제와 재정렬을 하나의 트랜잭션으로 처리한다.
- [ ] `better-sqlite3`/Drizzle이 지원하는 동기 transaction callback 내에서 async callback을 사용하지 않도록 검증한다.

### 3단계. Route Handler 얇게 만들기

- [ ] Playbook Route Handler의 `@/server/database`, `@/db/schema`, `drizzle-orm` import를 제거한다.
- [ ] Route Handler에는 입력 파싱, 인증, service 호출, 응답 변환만 남긴다.
- [ ] `NextResponse`를 service/repository에서 제거한다.
- [ ] 공통 error-to-response mapper를 추가한다.

### 4단계. DB 부트스트랩 분리

- [ ] SQLite 연결과 DB export를 `connection.ts`로 이동한다.
- [ ] DDL/하위 호환 컬럼 처리를 `migrations.ts`로 이동한다.
- [ ] 기본 계정과 Playbook 샘플 데이터를 `seeds/`로 이동한다.
- [ ] `server -> widgets` 의존을 제거하고 샘플 콘텐츠를 서버 중립 자원으로 이동한다.
- [ ] 기존 DB와 새 DB 모두에서 부트스트랩이 멱등적으로 동작하는지 검증한다.

### 5단계. 검증과 정리

- [ ] 서비스 단위 테스트와 Route 통합 테스트를 통과한다.
- [ ] `npm run lint`를 통과한다.
- [ ] `npm run build`를 통과한다.
- [ ] Tauri sidecar 준비와 로컬 DB 시작을 검증한다.
- [ ] 로그인 후 플레이북 조회·편집·삭제·정렬, LLM API 읽기·쓰기를 smoke test한다.

## 6. 필수 테스트 시나리오

### 문서

- 문서를 생성하면 같은 parent의 마지막 `orderIdx`로 추가된다.
- 다른 topic의 문서를 parent로 지정할 수 없다.
- 자기 자신을 parent로 지정할 수 없다.
- 문서 수정 시 version이 증가한다.
- `expectedVersion`이 다르면 409에 해당하는 도메인 오류가 발생한다.
- 상위 문서를 삭제하면 모든 하위 문서와 관련 댓글이 하나의 트랜잭션에서 삭제된다.

### 재정렬

- 같은 parent 아래의 전체 sibling ID가 아니면 거부한다.
- 다른 topic이나 parent의 ID가 섞이면 거부한다.
- 재정렬 중 오류가 발생하면 일부만 변경되지 않는다.

### 권한과 토큰

- 비로그인 사용자의 쓰기 요청을 거부한다.
- AI 편집 토큰은 기존 정책대로 작성자 또는 관리자에게만 발급한다.
- AI 편집 토큰은 해시로만 저장하고 만료·재사용·버전 충돌을 거부한다.
- 로컬 전용 LLM API 접근 정책을 유지한다.

### 호환성

- 기존 API URL과 JSON 필드가 변경되지 않는다.
- 일반 API와 LLM API의 기존 성공/실패 상태 코드를 유지한다.
- 기존 SQLite DB를 열 때 데이터가 유지된다.
- 새 DB에서 기본 계정과 시드 데이터가 기존과 동일하게 생성된다.

## 7. 완료 기준

- Playbook Route Handler가 `db`, `@/db/schema`, `drizzle-orm`을 직접 import하지 않는다.
- 일반 API와 LLM API가 공통 Playbook service/repository를 사용한다.
- service/repository가 `NextResponse`에 의존하지 않는다.
- 문서 계층 삭제와 재정렬이 트랜잭션으로 보호된다.
- `database.ts`의 UI/widgets 의존이 제거된다.
- 핵심 유스케이스 테스트, lint, Next.js build가 통과한다.
- Tauri 개발 실행과 release 빌드에서 로컬 SQLite가 정상 시작한다.

## 8. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 일반 API와 LLM API의 기존 차이가 통합 과정에서 사라짐 | 0단계에서 계약 테스트로 고정하고, 정책 변경은 별도 커밋으로 분리한다. |
| SQLite 트랜잭션 callback의 async 오용 | `better-sqlite3` 동기 트랜잭션 방식을 작은 검증 코드로 먼저 확인한다. |
| `database.ts` 분리 중 부트스트랩 순서 변경 | 연결 -> migration -> seed의 명시적 진입점을 두고 기존/신규 DB를 모두 검증한다. |
| 대규모 이동으로 리뷰가 어려워짐 | Repository 추출, Service 통합, Route 간소화, DB 분리를 별도 커밋으로 나눈다. |
| 사용자 DB 데이터 훼손 | DB 스키마 변경을 제외하고, 복본 DB에서 복구·부트스트랩을 먼저 검증한다. |

## 9. 커밋 권장 단위

1. `test(server): lock current playbook route behavior`
2. `refactor(server): extract functional playbook repository`
3. `refactor(server): unify playbook application services`
4. `refactor(server): thin next route handlers`
5. `refactor(server): split database bootstrap and seeds`
6. `test(server): cover playbook transactions and route contracts`

## 10. 후속 검토 항목

아래는 이번 구조 리팩토링 후 별도로 결정한다.

- 문서 수정·삭제를 작성자/관리자로 제한할지
- 댓글 수정·삭제를 작성자/관리자로 제한할지
- Repository interface가 필요할 정도로 테스트 대체성이 중요해졌는지
- Auth, Backup, Proof Entry에도 같은 Route-Service-Repository 규칙을 확장할지
