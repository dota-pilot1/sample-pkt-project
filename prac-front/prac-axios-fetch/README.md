# Axios & Fetch Practice Lab

브라우저의 HTTP 요청 흐름을 `fetch`부터 Axios까지 단계별로 연습하는 Next.js 프로젝트입니다. 인증과 CRUD를 분리해 각 단계에서 라이브러리의 책임 경계를 확인합니다.

## 실행

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:4350`입니다.

## Level 1 데모 계정

- 아이디: `operator`
- 비밀번호: `pkt1234!`

## 학습 단계

- Level 1: Drizzle/SQLite 회원가입·로그인·세션 복원 + 순수 `fetch`
- Level 2: 공통 fetch 래퍼 + 인증 설비 CRUD + TanStack Query 서버 상태 + Zustand 화면 상태
- Level 3: Axios 전용 인증 설비 CRUD + 인스턴스·인터셉터·자동 JSON 처리
