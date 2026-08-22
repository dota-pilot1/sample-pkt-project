const textNode = (text: string) => ({ detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 });
const paragraph = (text: string) => ({ children: [textNode(text)], direction: "ltr", format: "", indent: 0, type: "paragraph", version: 1 });
const emptyParagraph = () => ({ children: [], direction: null, format: "", indent: 0, type: "paragraph", version: 1 });
const quoteBlock = (children: unknown[]) => ({ children, direction: "ltr", format: "", indent: 0, type: "quote", version: 1 });
const codeBlock = (text: string) => ({ children: [{ text, type: "code-highlight", version: 1 }], direction: "ltr", format: "", indent: 0, language: "code-highlight.text", type: "code", version: 1 });

const SAMPLE_CODE = `// src/features/pagination/model/pagination.types.ts
export type PaginationState = {
  page: number;
  totalPages: number;
  documents: DocumentSummary[];
};

const goToPage = (page: number) => {
  if (page < 1 || page > state.totalPages) return;
  setState((current) => ({ ...current, page }));
};`;

const SAMPLE_CODE_2 = `// src/features/pagination/ui/PaginationControls.tsx
function PaginationControls({ page, totalPages, onChange }: Props) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div>
      <button disabled={!canGoPrevious} onClick={() => onChange(page - 1)} />
      <button disabled={!canGoNext} onClick={() => onChange(page + 1)} />
    </div>
  );
}`;

/** API 문서와 본문 렌더링 화면에서 함께 사용하는 고정 Lexical 샘플입니다. */
export const DOCUMENT_API_SAMPLE_LEXICAL_STATE = JSON.stringify({
  root: {
    children: [
      paragraph("Step1:"),
      quoteBlock([paragraph("페이지 이동 절차 하나를 기준으로 설명합니다. 먼저 상태 타입 파일을 준비하고, 그다음 페이지 이동 함수에서 현재 페이지를 갱신합니다.")]),
      paragraph("Code:"),
      codeBlock(SAMPLE_CODE),
      emptyParagraph(),
      emptyParagraph(),
      paragraph("Step2:"),
      quoteBlock([paragraph("페이지 범위를 검증하고 조회 결과를 현재 상태에 반영합니다. 첫 페이지와 마지막 페이지에서는 이동 버튼 상태도 함께 갱신합니다.")]),
      paragraph("Code:"),
      codeBlock(SAMPLE_CODE_2),
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});
