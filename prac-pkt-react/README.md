# PKT React Practice

PKT 프로젝트 학습 목표 30개를 실제 화면으로 연습하기 위한 별도 프론트엔드 프로젝트입니다.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query / Table
- Zustand
- React Hook Form + Zod

## Run

```bash
npm install
npm run dev
```

개발 서버는 `http://localhost:4300`에서 실행됩니다.

## API와 화면 훅 구조

기능 화면에서 `apiFetch`를 직접 호출하지 않고 다음 순서로 분리합니다.

```text
페이지 컴포넌트
  └─ model/useWorkOrders.ts       # useQuery/useMutation, 캐시 무효화
      └─ api/work-order.api.ts    # HTTP 요청과 응답 처리
          └─ shared/api/http.ts   # 공통 URL·인증 헤더·401 처리
```

작업지시 기능의 목록 조회와 상태 변경은 `src/features/work-order/api/work-order.api.ts`에,
React Query 훅은 `src/features/work-order/model/useWorkOrders.ts`에 둡니다.
따라서 `src/pages/WorkOrdersPage.tsx`는 API 세부사항을 알지 않고 화면 상태와 렌더링에 집중합니다.
