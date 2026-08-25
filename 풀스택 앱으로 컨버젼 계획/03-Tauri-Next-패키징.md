# Tauri + Next.js 패키징 계획

## 선택 구조

```text
Tauri 프로세스
├── Next.js standalone sidecar 시작
├── 준비 상태 확인
├── 로컬 앱 창 연결
├── SQLite DB와 첨부파일 경로 전달
└── 앱 종료 시 sidecar 종료
```

Next.js의 Route Handler와 Server Action을 사용하려면 정적 export만으로는 부족하다. 따라서 Next standalone 서버와 실행 가능한 Node 런타임을 sidecar로 패키징한다.

## 시작 순서

1. Tauri가 앱 데이터 디렉터리를 생성한다.
2. DB가 없으면 migration과 초기 관리자 생성을 수행한다.
3. 빈 로컬 포트를 확보한다.
4. DB 경로, 첨부 경로, 세션 비밀키, 포트를 환경변수로 전달한다.
5. Next sidecar를 시작한다.
6. `/api/health`가 준비 상태를 반환할 때까지 짧게 재시도한다.
7. Tauri 창을 로컬 Next 주소로 연결한다.
8. 종료 이벤트에서 sidecar 프로세스를 정리한다.

## 데이터 저장 위치

```text
Tauri app data directory/
├── app.db
├── attachments/
├── backups/
└── logs/
```

- DB와 첨부파일은 설치 디렉터리에 저장하지 않는다.
- DB 백업은 SQLite online backup API 또는 안전한 checkpoint 후 복사 방식으로 만든다.
- 백업에는 DB와 첨부파일 manifest를 함께 넣는다.

## 개발 모드

- Next.js dev server를 고정 개발 포트로 실행한다.
- Tauri는 dev URL을 연다.
- SQLite는 운영 DB가 아닌 별도 개발 DB를 사용한다.
- 기존 Spring API와 새 Next API를 선택할 수 있는 임시 전환 플래그를 둘 수 있다.

## 릴리즈 모드

- `next build` 결과 중 standalone 서버, static, public 자산을 묶는다.
- 대상 OS와 CPU에 맞는 Node 런타임을 sidecar로 포함한다.
- `better-sqlite3`도 대상 플랫폼별로 빌드하고 실제 설치본에서 로딩을 검사한다.
- 기존 Tauri updater 설정은 유지하되 앱 업데이트와 DB migration을 분리한다.
- DB migration 실패 시 앱을 열지 말고 기존 DB와 오류 로그를 보존한다.

## 폐쇄망 기준

- 설치 후 npm, Node.js, Java, PostgreSQL을 내려받지 않는다.
- 외부 CDN, 웹폰트, 원격 아이콘에 의존하지 않는다.
- 업데이트 파일은 GitHub 외에 USB 또는 내부 파일 서버로 전달할 수 있어야 한다.
- 최초 설치와 업데이트를 인터넷이 차단된 테스트 PC에서 검증한다.
- YouTube preview, S3 업로드, 공개 공유 링크는 오프라인 대체 UI를 제공한다.

## 기술 위험과 검증 방법

| 위험 | 검증 |
| --- | --- |
| Node sidecar 누락 또는 실행 실패 | 깨끗한 PC에서 설치 직후 실행 |
| 포트 충돌 | 동적 포트 할당 및 health check |
| sidecar 잔류 | 앱 종료 후 프로세스 목록 확인 |
| 네이티브 SQLite 모듈 불일치 | macOS arm64/x64, Windows x64 설치본 테스트 |
| 업데이트 중 DB 손상 | 업데이트 전 자동 백업과 migration rollback 테스트 |
| 로컬 HTTP 접근 노출 | loopback bind, 임의 secret 또는 Tauri IPC 보호 검토 |

## 1차 기술 검증 산출물

업무 화면을 옮기기 전에 아래만 수행하는 작은 실행본을 만든다.

```text
앱 실행
→ Next sidecar health check
→ SQLite에 test row 저장
→ 앱 재시작
→ 저장한 row 조회
→ 앱 종료 후 sidecar 종료 확인
```

이 실행본이 macOS와 Windows에서 성공한 뒤 본 기능 이전을 시작한다.
