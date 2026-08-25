# DB·API 전환표

## 데이터베이스 전환 원칙

- PostgreSQL의 ID 값을 가능한 한 유지해 문서 부모·자식 관계를 보존한다.
- 외래키 검사를 활성화한다.
- SQLite는 WAL 모드를 사용한다.
- 시간은 ISO 8601 UTC 문자열 또는 epoch 정수 중 하나로 통일한다.
- Boolean은 SQLite integer `0/1`로 저장한다.
- Lexical `content`는 JSON 문자열 원문을 보존한다.
- 운영 DB를 직접 수정하지 않고 export/import 도구를 통해 이전한다.

## 1차 테이블 매핑

| 기존 PostgreSQL/JPA | SQLite 대상 | 비고 |
| --- | --- | --- |
| `users` | `users` | 이메일, 비밀번호 해시, 활성 상태 유지 |
| `roles` | `roles` | 역할 코드 unique 유지 |
| `permissions` | `permissions` | 권한 코드 unique 유지 |
| 역할-권한 조인 | `role_permissions` | 복합 PK와 외래키 적용 |
| `refresh_tokens` | 검토 후 `sessions` 또는 `refresh_tokens` | 로컬 앱이면 세션 단순화 가능 |
| `playbook_spaces` | `playbook_spaces` | `code` unique 유지 |
| `playbook_categories` | `playbook_categories` | space FK, `order_idx` 유지 |
| `playbook_topics` | `playbook_topics` | category FK, `order_idx` 유지 |
| `playbook_documents` | `playbook_documents` | topic/parent FK, version과 토큰 필드 유지 |
| `playbook_document_comments` | `playbook_document_comments` | document/parent FK 유지 |
| S3 업로드 메타데이터 | `attachments` 추가 검토 | 폐쇄망 로컬 파일 경로와 checksum 관리 |

## SQLite에서 명시적으로 보완할 제약

- `playbook_documents.parent_id`는 동일 topic 문서만 참조하도록 서비스 계층에서도 검증한다.
- 카테고리, 주제, 문서 순서 변경은 하나의 transaction으로 처리한다.
- 문서 수정 시 `version`을 비교해 덮어쓰기 충돌을 방지한다.
- 문서 삭제 정책은 기존 동작을 확인한 뒤 cascade 또는 하위 문서 이동으로 확정한다.
- DB 연결마다 `PRAGMA foreign_keys = ON`을 보장한다.

## 현재 앱 API 전환표

| 기능 | 기존 API | Next.js 대상 |
| --- | --- | --- |
| 로그인 | `POST /api/auth/login` | 동일 경로 유지 |
| 세션 갱신 | `POST /api/auth/refresh` | 인증 방식 결정 후 호환 유지 또는 제거 |
| 로그아웃 | `POST /api/auth/logout` | 동일 경로 유지 |
| 현재 사용자 | `GET /api/auth/me` | 동일 경로 유지 |
| 공간 CRUD | `/api/hospital-playbook/spaces` | 동일 경로 유지 |
| 트리 조회 | `GET /api/hospital-playbook?spaceCode=` | 동일 경로 유지 |
| 검색 | `GET /api/hospital-playbook/search` | SQLite FTS5 적용 검토 |
| 문서 CRUD | `/api/hospital-playbook/documents/*` | 동일 경로 유지 |
| 카테고리 CRUD/정렬 | `/api/hospital-playbook/categories/*` | 동일 경로 유지 |
| 주제 CRUD/정렬 | `/api/hospital-playbook/topics/*` | 동일 경로 유지 |
| 댓글 CRUD | 문서 comments 및 `/comments/{id}` | 동일 경로 유지 |
| 공유 토큰 | `/documents/{id}/share` | 폐쇄망 사용성 검토 후 유지 |
| AI 편집 토큰 | `/documents/{id}/ai-edit-token` | 로컬 LLM 연동 방식과 함께 검토 |
| 이미지 업로드 | `POST /api/upload/presign` | 로컬 첨부 저장 API로 교체 |

기존 프론트 API 모듈을 최대한 재사용하기 위해 1차에서는 URL과 응답 DTO를 유지한다. 내부 구현만 Spring Service/JPA에서 Next.js server/Drizzle로 바꾼다.

## 데이터 이관 절차

1. PostgreSQL을 읽기 전용 상태로 전환하거나 최종 백업 시점을 고정한다.
2. 필요한 테이블을 JSON 또는 CSV로 export한다.
3. SQLite schema migration을 적용한다.
4. 역할·권한·사용자 순으로 import한다.
5. space → category → topic → document → comment 순으로 import한다.
6. ID, FK, 문서 수, 자식 문서 수, Lexical JSON parse 여부를 비교한다.
7. 대표 문서를 기존 앱과 새 앱에서 각각 열어 시각적으로 비교한다.
8. SQLite 파일을 백업한 뒤 새 앱의 기준 DB로 지정한다.

## 데이터 검증 기준

- 테이블별 row count 일치
- 모든 문서의 topic 및 parent 참조 유효
- 모든 Lexical 본문 JSON parse 성공
- `order_idx` 중복과 누락 검사
- 사용자 비밀번호 해시로 기존 계정 로그인 성공
- 승인 상태, 작성자, 승인자, 버전, 수정 시각 보존
