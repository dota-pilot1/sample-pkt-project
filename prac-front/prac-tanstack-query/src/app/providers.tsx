"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // 렌더마다 QueryClient를 만들면 캐시가 초기화되므로 앱 수명 동안 하나만 유지한다.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 일시적 네트워크 실패는 한 번 재시도하고, 10초 동안은 캐시를 최신 상태로 본다.
            retry: 1,
            staleTime: 10_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
