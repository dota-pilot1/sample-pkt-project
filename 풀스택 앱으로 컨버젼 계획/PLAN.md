# Tauri 기반 앱의 Next.js 풀스택 전환 계획

## 관련 문서

- [01-현재-구조와-전환-범위.md](./01-현재-구조와-전환-범위.md)
- [02-DB-API-전환표.md](./02-DB-API-전환표.md)
- [03-Tauri-Next-패키징.md](./03-Tauri-Next-패키징.md)
- [04-실행-체크리스트.md](./04-실행-체크리스트.md)
- [05-현재-상태-인수인계.md](./05-현재-상태-인수인계.md)

## 목표

현재 Tauri + React/Vite + Spring Boot API + PostgreSQL로 분리된 앱을,
폐쇄망에서 설치와 실행이 쉬운 Tauri + Next.js 풀스택 + SQLite 앱으로 전환한다.

Tauri는 제거하지 않고 데스크톱 실행기, 파일 접근, 백업·복구, 업데이트 패키징을 담당한다.

## 목표 구조

```text
Tauri 데스크톱 앱
└── Next.js standalone 서버 + React UI
    ├── Route Handlers / Server Actions
    ├── 인증·인가·문서 업무 로직
    └── SQLite
```

## 전환 범위

- React/Vite 화면을 Next.js App Router로 이전
- Spring Boot 인증·인가 API를 Next.js 서버 기능으로 이전
- JPA/PostgreSQL 모델을 SQLite 모델로 재설계
- JWT/RBAC와 사용자·역할·권한 기능 유지
- Lexical 문서와 자식 문서 구조 유지
- 이미지·첨부파일 및 로컬 백업·복구 흐름 재구성
- 폐쇄망 설치 파일과 최초 실행 흐름 검증

1차 전환은 `pkt-study-tauri`가 실제 사용하는 기능을 대상으로 한다. `sk-pkt-mes-server`의 LOT, BOM, 작업지시 등 MES 전체 기능은 자동으로 포함하지 않는다.

## 유지할 것

- Tauri 데스크톱 앱 경험
- 기존 UI와 업무 흐름
- Lexical JSON 문서 형식
- 사용자·역할·권한 개념
- 웹 브라우저에서도 확인 가능한 개발 모드

## 1차 수직 기능

```text
로그인
→ 인증 상태 유지
→ 문서 목록 조회
→ 문서 본문 조회
→ Lexical 문서 저장
→ 앱 재시작 후 데이터 확인
```

이 기능으로 Next.js 서버 실행, SQLite 연결, 인증, 문서 저장, Tauri 패키징을 한 번에 검증한다.

## 구현 순서

1. 현재 Tauri 화면·API 호출·Tauri command 사용 범위 조사
2. Next.js 앱과 standalone 실행 구조 생성
3. SQLite 스키마와 마이그레이션 방식 결정
4. 인증·사용자·역할·권한 모델 이전
5. 문서·자식 문서·Lexical 본문 이전
6. 1차 수직 기능 구현 및 데이터 재시작 검증
7. 기존 화면을 기능 단위로 Next.js에 이전
8. 백업·복구와 파일 저장 기능 이전
9. Tauri 설치 파일에 Next 서버와 런타임 포함
10. 폐쇄망 환경에서 설치·실행·업데이트 검증

## 기술 선택 초안

- UI: Next.js App Router, React, 기존 스타일 재사용
- 서버: Next.js Route Handlers 또는 Server Actions
- DB: SQLite
- ORM: Drizzle ORM 검토
- Node SQLite 드라이버: `better-sqlite3` 우선 검토
- 패키징: Tauri + Next standalone 서버
- 인증: 폐쇄망 단일 앱에 맞춘 세션 또는 로컬 JWT 구조 검토

## 주요 판단 기준

- 단일 PC 또는 단일 현장 서버 중심이면 SQLite를 사용한다.
- 여러 단말의 중앙 실시간 공유가 필요하면 PostgreSQL 구조를 유지하거나 중앙 SQLite 서버만 둔다.
- 추후 온라인 동기화 가능성이 있으면 변경 이력 또는 sync outbox를 초기에 고려한다.
- 외부 CDN, 외부 폰트, 외부 아이콘, 런타임 다운로드에 의존하지 않는다.

## 범위 제외

- 1차 전환에서 온라인·오프라인 양방향 동기화
- 다중 PC 간 충돌 해결
- 기존 Spring Boot와 Next.js의 장기 병행 운영
- 기능 전환과 동시에 대규모 UI 리디자인

## 완료 기준

- 인터넷이 차단된 환경에서 설치 파일만으로 앱 실행
- 로그인과 RBAC 동작
- 문서 조회·편집·저장 및 앱 재시작 후 데이터 유지
- SQLite 백업·복구 가능
- 기존 핵심 화면과 업무 흐름 사용 가능
- 외부 서버나 PostgreSQL 없이 독립 실행
