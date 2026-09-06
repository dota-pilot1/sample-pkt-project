# NOVA 작업 드로워 — TODO·API 테스트 통합 계획

## 1. 목적

NOVA 프로젝트 노트를 보면서 구현 할 일을 관리하고, 같은 화면에서 API 요청을 실행·검증할 수 있는 작업 드로워를 만든다. 사용자는 노트 화면을 벗어나지 않고 `TODO`와 `API 테스트`를 전환하며 설계 → 구현 → 검증 흐름을 이어갈 수 있어야 한다.

핵심 방향은 Postman 전체 기능을 복제하는 것이 아니라, NOVA 구현 작업에 필요한 요청 작성·전송·응답 확인 기능만 기존 TODO 드로워에 결합하는 것이다. TODO는 SQLite와 Agent 전용 API로 관리해 화면뿐 아니라 Codex 같은 로컬 Agent도 같은 작업 목록을 조회·등록·수정할 수 있게 한다.

## 2. 현재 상태

### PKT Study Fullstack

- 노트 화면 상단의 `할 일` 버튼으로 우측 TODO 드로워를 연다.
- 드로워는 `S / M / L / XL` 너비를 선택할 수 있고 선택값을 로컬에 보존한다.
- TODO 데이터는 로그인 사용자 이메일 기준 `localStorage`에 저장된다.
- TODO 항목은 제목, 분류, 완료 여부, 중요 여부, 생성·완료 시각만 가진다.
- 현재 선택한 프로젝트·1차 영역·2차 주제·문서와 TODO가 연결되지 않는다.
- TODO 본문·체크리스트·완료 조건·관련 파일·관련 API처럼 구현에 필요한 상세 정보가 없다.
- 브라우저 `localStorage`는 외부 Agent가 직접 조회할 수 없으므로 Agent 연동 저장소로 사용할 수 없다.
- 기본 분류와 샘플 항목이 범용 학습 중심이어서 NOVA 구현 관리에는 문맥이 부족하다.

확인한 현재 파일:

```text
tikitaka-note/pkt-study-fullstack/src/features/todo/TodoDrawer.tsx
tikitaka-note/pkt-study-fullstack/src/features/todo/types.ts
tikitaka-note/pkt-study-fullstack/src/features/todo/useTodos.ts
tikitaka-note/pkt-study-fullstack/src/widgets/hospital-playbook/HospitalPlaybookModule.tsx
```

### 참고 Postman 앱

`towercrane-postman-tauri`에는 다음 기능이 이미 구현되어 있다.

- HTTP Method, URL, Params, Headers, JSON·Raw Body 편집
- 환경변수 치환과 환경 선택
- Bearer Token 적용
- Tauri HTTP 플러그인을 통한 요청 전송
- 응답 Status, Headers, Body, 소요 시간 표시
- JSON 포맷팅과 응답 복사
- 요청 설정 초기화·저장

검토할 참고 파일:

```text
/Users/terecal/pilot-project/towercrane-for-uiux/towercrane-postman-tauri/src/widgets/apidoc/ApiTesterPanel.tsx
/Users/terecal/pilot-project/towercrane-for-uiux/towercrane-postman-tauri/src/widgets/apidoc/EnvironmentDialog.tsx
/Users/terecal/pilot-project/towercrane-for-uiux/towercrane-postman-tauri/src/features/api-doc/types.ts
/Users/terecal/pilot-project/towercrane-for-uiux/towercrane-postman-tauri/src/features/api-doc/api-env-store.ts
/Users/terecal/pilot-project/towercrane-for-uiux/towercrane-postman-tauri/src/features/api-doc/http.ts
```

참고 구현은 API 문서의 팀·카테고리·Endpoint·Block 모델과 관리자 권한에 연결되어 있다. 이를 그대로 복사하지 않고, 요청 실행에 필요한 순수 모델과 UI만 분리해 PKT 앱 구조에 맞춘다.

## 3. 목표 사용자 흐름

1. 사용자가 `파일럿 → 프로토타입 → NOVA BSS 프로토타입 → 요금제 API 설계 및 test`를 선택한다.
2. 상단 `할 일` 버튼을 눌러 우측 작업 드로워를 연다.
3. 드로워 상단에서 현재 작업 범위가 `NOVA BSS / 요금제 API 설계 및 test`로 표시된다.
4. `TODO` 탭에서는 현재 범위에 속한 구현 작업만 확인·등록한다.
5. TODO에 연결된 API 요청이 있으면 `API 테스트`로 바로 전환한다.
6. Method·URL·Params·Headers·Body를 확인하고 요청을 전송한다.
7. Status·응답 본문·소요 시간을 확인하고 검증 결과를 TODO에 남긴다.
8. 완료 기준을 만족하면 사용자가 TODO를 완료 처리한다.
9. Agent가 `for Agent {}` 안내에서 현재 범위의 API와 ID를 확인하고 같은 TODO를 조회·편집한다.

## 4. 화면 구성

### 4.1 공통 상단

```text
NOVA BSS · 요금제 API 설계 및 test        [for Agent {}] [닫기]
[ TODO 7 ] [ API 테스트 ]
```

- 드로워 제목은 고정된 `할 일 관리`보다 현재 작업 범위를 우선 표시한다.
- `TODO / API 테스트`는 상단 세그먼트 토글로 제공한다.
- `for Agent {}` 버튼은 현재 선택 범위가 반영된 Agent API 안내 패널을 연다.
- 탭을 바꿔도 입력 중인 TODO와 API 요청 상태를 유지한다.
- 드로워의 `S / M / L / XL` 크기 레일은 공통으로 유지한다.
- API 테스트는 입력 영역이 넓으므로 최소 `M`을 권장한다. `S`에서 API 테스트로 전환할 경우 `M`으로 확장하고, TODO로 돌아오면 사용자가 선택한 TODO 너비를 복원하는 방식을 우선 검토한다.

### 4.2 TODO 탭

- 현재 NOVA 범위의 TODO만 기본 표시
- 전체 프로젝트 TODO를 볼 수 있는 범위 필터
- 업무 영역 4탭: `Backend`, `Frontend`, `API`, `DevOps`
- 각 탭에 전체·진행·막힘·완료 개수를 표시
- 상태: `대기`, `진행`, `막힘`, `완료`
- 중요도와 정렬 순서
- 관련 노트·관련 API 요청 표시
- 항목의 `API 테스트` 버튼으로 연결 요청 열기

현재의 `완료/미완료` 데이터는 마이그레이션 시 각각 `완료/대기`로 변환한다. 기존 범용 TODO는 `공통` 범위로 보존해 데이터가 사라지지 않게 한다.

업무 영역의 의미는 다음과 같이 고정한다.

| 탭 | 관리 대상 |
| --- | --- |
| Backend | Spring 서비스·도메인·Repository·Controller 구현 |
| Frontend | 목록·상세·폼·상태 관리·API 연동 |
| API | 계약 결정, Endpoint 목록, 요청·응답 검증, Postman 저장 요청 |
| DevOps | DB·Docker·환경변수·빌드·배포·모니터링 |

`DB`와 `테스트`는 독립 탭을 추가하지 않는다. DB 작업은 Backend 또는 DevOps에 귀속하고, 테스트는 각 업무 영역 TODO의 체크리스트와 완료 조건에 포함한다.

### 4.3 TODO 상세 보기

목록의 한 줄 제목은 빠른 탐색용으로 유지하고, 행을 누르면 상세 작업을 볼 수 있게 한다.

- `S / M`: 선택 행 아래에 아코디언 형태로 상세 내용을 펼친다.
- `L / XL`: 왼쪽 목록, 오른쪽 상세 편집기의 Master–Detail 구조로 전환한다.
- `S`에서 긴 상세 편집을 시작하면 `M` 확장을 제안하되 사용자의 크기 선택을 강제로 덮어쓰지 않는다.
- 상세를 닫으면 목록의 필터·스크롤·선택 위치를 유지한다.

상세 정보에는 다음을 포함한다.

- 작업 목적과 설명
- 상태·중요도·업무 영역
- Step 체크리스트
- 완료 조건
- 막힘 사유와 선행 TODO
- 관련 파일 경로
- 관련 노트 ID·문서 링크
- 관련 API 요청·Endpoint
- Agent/사용자 작업 메모
- 최근 수정 시각과 version

### 4.4 API 테스트 탭

최초 범위는 다음으로 제한한다.

- HTTP Method: GET, POST, PUT, PATCH, DELETE
- URL 및 `{{VARIABLE}}` 환경변수
- Params, Headers
- 인증 사용 여부와 Bearer Token
- Body: None, JSON, Raw
- 요청 전송·취소 상태
- 응답 Status, Status Text, 소요 시간
- Response Body·Headers 탭
- JSON 포맷팅과 응답 복사
- 현재 NOVA 범위에 요청 저장
- 저장된 요청 선택·수정·삭제

`L / XL`에서는 요청과 응답을 좌우 2열로, `M`에서는 위아래 구조로 표시한다.

## 5. TODO와 API 테스트 연결

API 테스트를 단순 부가 화면으로 두지 않고 구현 작업의 검증 도구로 연결한다.

- TODO 하나에 저장된 API 요청 하나 이상을 연결할 수 있다.
- TODO의 `API 테스트`를 누르면 연결된 요청을 불러오며 API 테스트 탭으로 전환한다.
- API 테스트에서 `TODO에 연결`을 선택하면 현재 범위의 미완료 TODO를 지정할 수 있다.
- 마지막 응답의 Status·실행 시각·소요 시간을 검증 기록으로 남길 수 있다.
- 2xx 응답만으로 TODO를 자동 완료하지 않는다. 비즈니스 데이터와 DB 변경 이력까지 확인한 뒤 사용자가 완료한다.
- `검증 기록 저장 후 완료`는 명시적인 사용자 동작으로 제공한다.

NOVA 요금제 API의 초기 저장 요청 후보:

1. 요금제 목록 조회
2. 요금제 상세 조회
3. 요금제 생성
4. 요금제 초안 수정 및 version 충돌 확인
5. 판매 상태 변경
6. 변경 이력 조회 또는 DB 검증

실제 Endpoint 경로와 요청·응답 계약은 구현 시 백엔드 코드와 OpenAPI 결과를 확인한 뒤 저장한다. 계획 단계에서 존재하지 않는 경로를 단정하지 않는다.

## 6. Agent TODO API와 `for Agent {}` 안내

### 6.1 목적

Agent가 화면의 한 줄 텍스트를 추측하거나 브라우저 저장소를 직접 읽지 않고, 현재 NOVA 범위의 TODO와 상세 내용을 구조화된 JSON으로 조회·등록·수정할 수 있게 한다.

### 6.2 `for Agent {}` 화면

노트의 `2차 주제 노트 작업 도우미`와 같은 패턴으로 별도 안내 패널을 연다.

- 현재 space·category·topic·document와 각 ID 표시
- Agent API별 Method, URL, 용도 표시
- 요청·응답 JSON 예제
- 현재 범위가 채워진 명령 복사
- 선택 API 일괄 복사
- `Backend / Frontend / API / DevOps`별 TODO 조회 예제
- version 기반 수정 충돌 규칙 안내
- 로컬 접근 정책과 인증 주의사항 표시

API 경로는 구현 시 기존 Route Handler 규칙과 충돌 여부를 확인해 확정한다. 계획 후보는 다음과 같다.

| 방식 | 후보 API | 용도 |
| --- | --- | --- |
| GET | `/api/llm/todos/context?topicId={topicId}` | 현재 범위와 업무 영역별 개수 조회 |
| GET | `/api/llm/todos?topicId={topicId}&workstream={workstream}` | TODO 목록 조회 |
| GET | `/api/llm/todos/{todoId}` | 상세·체크리스트·연결 정보 조회 |
| POST | `/api/llm/todos` | 현재 범위에 TODO 등록 |
| PATCH | `/api/llm/todos/{todoId}` | 제목·상세·상태·체크리스트 수정 |
| POST | `/api/llm/todos/reorder` | 같은 범위·업무 영역 안에서 순서 변경 |

초기 Agent API에는 영구 삭제를 넣지 않는다. 필요 없는 항목은 `완료` 또는 후속 `보관` 상태로 처리하고, 삭제 API는 복구 정책을 정한 뒤 추가한다.

### 6.3 Agent 수정 규칙

- Agent는 수정 전에 단건 GET으로 최신 `version`을 확인한다.
- PATCH 요청은 `expectedVersion`을 필수로 보내며 불일치 시 409를 반환한다.
- 생성 요청은 선택 범위의 실제 topic ID와 업무 영역을 명시한다.
- 상태를 완료로 바꿀 때 완료 조건과 체크리스트 결과를 함께 확인한다.
- 한 요청에서 다른 사용자의 TODO나 다른 topic으로 암묵적으로 이동하지 않는다.
- Agent가 남긴 변경은 `updatedByType: AGENT`와 작업 메모로 구분할 수 있게 한다.

### 6.4 접근 정책

기존 노트 LLM API의 로컬 접근 경계를 재사용한다.

- `localhost`, `127.0.0.1`, `::1` 요청은 로컬 Agent용으로 허용한다.
- 외부 공개 접근은 기본 비활성화한다.
- 외부 접근을 열 경우 별도 토큰과 사용자 권한을 적용한다.
- API 응답에는 Token, Authorization Header, Cookie를 포함하지 않는다.

## 7. 데이터 모델 계획

### 작업 범위

```text
WorkScope
- domain
- categoryId / categoryTitle
- topicId / topicTitle
- documentId / documentTitle (선택)
```

`topicId`를 기본 귀속 단위로 사용하고, 문서 단위 연결은 선택값으로 둔다. 제목은 표시용 스냅샷이며 식별에는 ID를 사용한다.

### TODO 확장

```text
TodoItem
- 기존 필드
- scope
- workstream: BACKEND | FRONTEND | API | DEVOPS
- status
- description
- checklist
- acceptanceCriteria
- blockerReason
- dependencyTodoIds
- relatedFiles
- relatedDocumentIds
- apiRequestIds
- order
- version
- updatedByType
- updatedAt
- verificationSummary (선택)
```

### 저장 API 요청

```text
SavedApiRequest
- id
- scope
- title
- method
- url
- authEnabled
- params
- headers
- body
- environmentId
- lastResponseMeta (선택)
- createdAt / updatedAt
```

응답 본문 전체를 무제한 보존하지 않는다. 기본은 최근 화면 상태로만 유지하고, 검증 기록에는 Status·시간·소요 시간·짧은 요약만 저장한다. 전체 응답 저장이 필요하면 크기 제한과 민감정보 제거 정책을 먼저 결정한다.

### SQLite 저장 후보

```text
work_todos
work_todo_checklist_items
work_todo_api_links
work_todo_verifications
```

목록 조회에 자주 쓰는 사용자·topic·workstream·status·order 필드는 `work_todos`의 정규 컬럼으로 둔다. 여러 개인 체크리스트와 API 연결·검증 기록은 별도 테이블로 분리하는 방식을 우선 검토한다.

## 8. 저장 및 보안 원칙

- TODO와 요청 설정은 로그인 사용자별로 분리한다.
- 환경변수와 Token은 사용자 로컬 설정에만 보관한다.
- Token, Authorization Header, Cookie를 노트 본문·공유 데이터·패키징 시드에 포함하지 않는다.
- 저장 요청에 Authorization 값이 있으면 별도 민감 필드로 취급하거나 저장 시 제거한다.
- 응답 Header의 `set-cookie` 등 민감정보는 검증 기록에 저장하지 않는다.
- 패키징 기준 시드에는 예시 요청만 넣을 수 있으며 실제 인증값은 포함하지 않는다.

Agent가 접근해야 하므로 `localStorage`를 최종 저장소로 유지하지 않는다. TODO와 상세 데이터는 앱의 SQLite에 저장하고 Next.js Route Handler와 공통 서비스·Repository를 통해 UI와 Agent API가 함께 사용한다. 기존 `localStorage` 데이터는 최초 실행 시 로그인 사용자와 `공통` 범위로 한 번 마이그레이션하고, 성공 여부를 기록해 중복 이관을 방지한다.

## 9. Tauri 요청 실행 방식

PKT 앱의 현재 의존성에는 Tauri HTTP 플러그인이 없다. 임의 외부 API를 브라우저 `fetch`로 호출하면 CORS 정책에 막힐 수 있으므로 참고 앱과 같은 Tauri HTTP 플러그인 방식을 사용한다.

구현 시 확인할 작업:

1. 프론트 의존성에 Tauri HTTP 플러그인 추가
2. Rust/Tauri 플러그인 초기화
3. capability에 필요한 HTTP 권한과 허용 범위 설정
4. 개발 환경의 localhost 호출 확인
5. 운영·임의 외부 주소 허용 정책 결정
6. 웹 실행 환경에서는 서버 프록시 사용 또는 제한 안내

모든 주소를 무조건 허용하기보다 로컬 개발 주소를 기본으로 하고, 사용자 추가 환경은 명시적인 설정을 거치게 한다.

## 10. 구현 단계

### TODO 1. SQLite TODO 저장소와 Agent API 기반 구축

- SQLite migration과 TODO Repository·Service를 추가한다.
- 기존 사용자별 `localStorage` TODO를 안전하게 이관한다.
- 목록·단건·생성·수정·정렬 API를 구현한다.
- expectedVersion 충돌과 로컬 접근 경계를 적용한다.

완료 조건: 화면과 로컬 Agent가 같은 TODO 데이터를 읽고 수정하며, 동시 수정은 409로 보호된다.

### TODO 2. NOVA 작업 범위와 4개 업무 영역 적용

- 현재 선택한 category·topic·document 문맥을 드로워에 전달한다.
- TODO에 scope·workstream·상태를 적용한다.
- Backend·Frontend·API·DevOps 탭과 범위 필터를 구현한다.

완료 조건: NOVA 요금제 주제에서 등록한 TODO가 다른 주제의 기본 목록에 섞이지 않고, 기존 TODO도 `공통` 범위에서 조회된다.

### TODO 3. TODO 상세 보기와 편집

- 설명·체크리스트·완료 조건·막힘·연결 정보를 편집한다.
- S/M 아코디언과 L/XL Master–Detail 레이아웃을 구현한다.
- 선택·스크롤·필터 상태를 유지한다.

완료 조건: 한 줄 목록에서 세부 구현 내용을 확인·수정하고 체크리스트 단위로 진행 상태를 기록할 수 있다.

### TODO 4. 작업 드로워 상단 토글과 Agent 안내

- `TODO / API 테스트` 세그먼트 토글을 추가한다.
- 현재 NOVA 작업 범위를 상단에 표시한다.
- `for Agent {}` 버튼과 현재 범위 기반 API 안내·복사를 추가한다.
- 탭별 너비 선택값과 입력 상태를 유지한다.
- API 테스트의 M·L·XL 레이아웃을 정의한다.

완료 조건: 드로워 상태가 안정적으로 유지되고, Agent가 안내 화면만으로 현재 범위의 TODO를 조회·편집할 수 있다.

### TODO 5. API 요청 실행기 이식

- 참고 앱에서 요청 타입, 환경변수 치환, URL 조립, 요청·응답 UI를 분리한다.
- PKT 디자인 토큰과 공통 컴포넌트에 맞춘다.
- Tauri HTTP 플러그인을 연결한다.
- JSON 유효성 검사, 오류 응답, 네트워크 오류를 표시한다.

완료 조건: 로컬 NOVA API에 GET·POST·PATCH 요청을 보내고 Status·Headers·Body·소요 시간을 확인할 수 있다.

### TODO 6. 요청 저장과 TODO 연결

- 현재 작업 범위에 API 요청을 저장한다.
- TODO에서 연결 요청을 열 수 있게 한다.
- 검증 결과 요약을 TODO에 기록한다.
- 요청 삭제 시 TODO 연결을 안전하게 정리한다.

완료 조건: TODO → 연결 API 실행 → 검증 기록 → TODO 완료 흐름을 한 드로워에서 수행할 수 있다.

### TODO 7. 검증과 릴리즈 준비

- SQLite 이관·Repository·Agent API 테스트
- 모델 마이그레이션 테스트
- 4개 업무 영역 필터와 상세 편집 테스트
- expectedVersion 409 충돌 테스트
- 환경변수·URL 조립 단위 테스트
- 민감정보 비저장 확인
- 로컬 NOVA API 요청 통합 확인
- `npm run lint`, `npm run build`, Tauri 빌드 확인
- 패키징 시드에 민감정보가 없는지 검사

완료 조건: 신규 설치 DB와 기존 사용자 데이터 복제본에서 TODO·요청 데이터가 정상 동작하고, 로컬 API 테스트가 성공한다.

## 11. 초기 범위에서 제외할 기능

- Postman Collection 전체 호환·Import·Export
- 팀 공유와 서버 동기화
- Pre-request Script와 Test Script 실행
- OAuth 2.0 전체 플로우
- multipart 파일 업로드
- GraphQL 전용 편집기
- WebSocket·SSE 클라이언트
- Mock Server와 자동 부하 테스트
- 무제한 요청·응답 히스토리

필요성이 확인되면 후속 단계로 분리한다.

## 12. 구현 예정 파일 구조 후보

실제 구현 전 현재 구조와 참조 관계를 다시 확인하고 확정한다.

```text
tikitaka-note/pkt-study-fullstack/src/features/todo/
  types.ts
  useTodos.ts
  TodoDrawer.tsx

tikitaka-note/pkt-study-fullstack/src/server/modules/todo/
  todo-repository.ts
  todo-service.ts

tikitaka-note/pkt-study-fullstack/src/app/api/llm/todos/
  route.ts
  context/route.ts
  [todoId]/route.ts
  reorder/route.ts

tikitaka-note/pkt-study-fullstack/src/features/api-tester/
  types.ts
  request-utils.ts
  api-environment-store.ts
  saved-request-store.ts

tikitaka-note/pkt-study-fullstack/src/widgets/project-workbench/
  ProjectWorkbenchDrawer.tsx
  TodoPanel.tsx
  TodoDetailPanel.tsx
  TodoAgentGuideDialog.tsx
  ApiTesterPanel.tsx
  EnvironmentDialog.tsx
```

현재 `TodoDrawer`를 점진적으로 확장할지 `ProjectWorkbenchDrawer`로 역할을 분리할지는 TODO 2 시작 전에 결정한다. TODO와 API 테스트가 동일한 범위·헤더·크기 상태를 공유하므로 공통 Drawer Shell과 내부 Panel을 분리하는 구조를 우선 검토한다.

## 13. 최종 완료 기준

- 선택한 NOVA 주제의 TODO만 기본 조회된다.
- Backend·Frontend·API·DevOps 4탭으로 작업을 분리해 조회한다.
- 한 줄 TODO를 열어 설명·체크리스트·완료 조건·연결 정보를 편집할 수 있다.
- `for Agent {}` 안내를 통해 로컬 Agent가 같은 TODO를 조회·등록·수정할 수 있다.
- Agent와 화면의 동시 수정은 version 충돌로 보호된다.
- 상단 토글로 TODO와 API 테스트를 즉시 전환할 수 있다.
- 저장된 NOVA 요청을 실행하고 응답을 확인할 수 있다.
- TODO와 API 요청·검증 결과가 연결된다.
- 드로워 크기와 입력 상태가 안정적으로 유지된다.
- 인증정보와 민감 응답이 노트·시드·공유 데이터에 포함되지 않는다.
- 요금제 생성 → 수정 → 상태 변경 → 변경 이력 확인 흐름을 TODO와 API 테스트로 검증할 수 있다.
