const textNode = (text: string) => ({ detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 });
const paragraph = (text: string) => ({ children: [textNode(text)], direction: "ltr", format: "", indent: 0, type: "paragraph", version: 1 });
const heading = (text: string, tag: "h1" | "h2" = "h2") => ({ children: [textNode(text)], direction: "ltr", format: "", indent: 0, tag, type: "heading", version: 1 });
const emptyParagraph = () => ({ children: [], direction: null, format: "", indent: 0, type: "paragraph", version: 1 });
const quoteBlock = (children: unknown[]) => ({ children, direction: "ltr", format: "", indent: 0, type: "quote", version: 1 });
const bulletList = (items: string[]) => ({ children: items.map((item, index) => ({ children: [textNode(item)], direction: "ltr", format: "", indent: 0, type: "listitem", value: index + 1, version: 1 })), direction: "ltr", format: "", indent: 0, listType: "bullet", start: 1, tag: "ul", type: "list", version: 1 });
const codeBlock = (text: string) => ({ children: [{ text, type: "code-highlight", version: 1 }], direction: "ltr", format: "", indent: 0, language: "code-highlight.text", type: "code", version: 1 });

const SAMPLE_STEP1_CODE = `// src/features/lot/model/useLots.ts
import { useQuery } from "@tanstack/react-query";
import { fetchLots } from "../api/lot.api";

export function useLots() {
  return useQuery({
    queryKey: ["lots"],
    queryFn: fetchLots,
    staleTime: 30_000,
  });
}`;

const createState = (children: unknown[]) => JSON.stringify({
  root: { children, direction: null, format: "", indent: 0, type: "root", version: 1 },
});
const sampleStep = (number: number, title: string, description: string, checks: string[], code: string) => [
  heading(`Step ${number}. ${title}`),
  quoteBlock([paragraph(description), bulletList(checks)]),
  paragraph("Code:"),
  codeBlock(code),
  emptyParagraph(),
  emptyParagraph(),
];

const todoStep = (number: number, title: string, description: string, code: string) => [
  heading(`TODO ${number}. ${title}`),
  quoteBlock([paragraph(description)]),
  paragraph("Code:"),
  codeBlock(code),
  emptyParagraph(),
  emptyParagraph(),
];

/** 전체 계획 문서에서 사용하는 고정 Lexical 샘플입니다. */
export const TODO_PLAN_SAMPLE_LEXICAL_STATE = createState([
  heading("전체 주제 샘플", "h1"),
  quoteBlock([paragraph("LOT 목록 조회를 TanStack Query 기준으로 검토하고 실제 LOT 조회 API까지 단계적으로 적용합니다.")]),
  emptyParagraph(),
  emptyParagraph(),
  ...todoStep(1, "적용 현황 리뷰", "현재 QueryClientProvider, useLots, LotsPage 적용 상태를 확인하고 완료된 범위를 구분합니다.", `// prac-pkt-react/src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>`),
  ...todoStep(2, "사용 패턴 리뷰", "queryKey, queryFn, staleTime, 캐시와 화면 상태 처리 방식을 검토합니다.", `// prac-pkt-react/src/features/lot/model/useLots.ts
export function useLots() {
  return useQuery({
    queryKey: ["lots"],
    queryFn: fetchLots,
    staleTime: 30_000,
  });
}`),
  ...todoStep(3, "실제 LOT 조회 API 구현 및 적용", "확정된 백엔드 계약을 기준으로 응답 타입과 fetchLots를 구현해 화면에 연결합니다.", `// prac-pkt-react/src/features/lot/api/lot.api.ts
export async function fetchLots(): Promise<Lot[]> {
  const response = await fetch(LOT_LIST_ENDPOINT);
  if (!response.ok) throw new Error("LOT 목록 조회 실패");
  return response.json();
}`),
]);

/** 하나의 하위 문서에서 Step 1~N을 관리하는 고정 Lexical 샘플입니다. */
export const STEP1_SAMPLE_LEXICAL_STATE = createState([
  heading("TODO 하위 문서 Step 1~N 샘플", "h1"),
  quoteBlock([paragraph("하나의 하위 문서 안에서 Step 1부터 필요한 마지막 단계까지 순서대로 관리합니다. 각 Step은 설명·확인 목록·코드 블록으로 구성합니다.")]),
  emptyParagraph(),
  emptyParagraph(),
  ...sampleStep(1, "Provider 확인", "앱 진입점에서 QueryClientProvider가 설정되어 있는지 확인합니다.", ["QueryClient를 생성한다", "앱을 Provider 하위에 연결한다"], `// prac-pkt-react/src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>`),
  ...sampleStep(2, "query 계약 확인", "useLots의 queryKey와 queryFn을 확인합니다.", ["queryKey는 [lots]다", "fetchLots가 queryFn이다"], SAMPLE_STEP1_CODE),
  ...sampleStep(3, "조회 상태 확인", "페이지의 로딩·실패·성공 상태를 확인합니다.", ["isLoading을 표시한다", "isError를 표시한다", "빈 배열을 처리한다"], `// prac-pkt-react/src/pages/LotsPage.tsx
const { data: rows = [], isLoading, isError } = useLots();
if (isLoading) return <LoadingMessage />;
if (isError) return <ErrorMessage />;
return <LotTable rows={rows} onSelect={setSelectedLot} />;`),
  ...sampleStep(4, "선택 연계 확인", "목록 행 선택과 상세 패널 연계를 확인합니다.", ["행 클릭으로 selectedLot을 갱신한다", "상세 패널에 선택 값을 표시한다"], `// prac-pkt-react/src/features/lot/ui/LotTable.tsx
const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
<LotTable rows={rows} onSelect={setSelectedLot} />
<LotDetail lot={selectedLot} />`),
  ...sampleStep(5, "최종 검증", "lint·build와 실제 화면 동작을 확인합니다.", ["npm run lint 통과", "npm run build 통과", "화면 동작 확인"], `// prac-pkt-react/package.json
npm run lint
npm run build`),
]);

/** 기존 호출부 호환용 기본 샘플입니다. */
export const DOCUMENT_API_SAMPLE_LEXICAL_STATE = TODO_PLAN_SAMPLE_LEXICAL_STATE;
