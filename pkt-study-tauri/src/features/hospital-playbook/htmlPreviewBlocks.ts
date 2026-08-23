import type { HtmlPreviewBlock } from "../../shared/ui/lexical/html-preview";

type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  html?: string;
  css?: string;
  children?: LexicalNode[];
};

/** 미리보기 블록과, 바로 앞 제목에서 따온 라벨. 라벨은 없을 수 있다. */
export type LabeledHtmlPreviewBlock = HtmlPreviewBlock & { label: string };

function inlineText(node: LexicalNode): string {
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map(inlineText).join("");
}

/**
 * 문서 본문에서 html-preview 노드만 문서 순서대로 뽑아낸다.
 * 바로 앞에 나온 heading을 라벨로 달아 variant를 구분할 수 있게 한다.
 */
export function collectHtmlPreviewBlocks(serialized: string): LabeledHtmlPreviewBlock[] {
  let parsed: (LexicalNode & { root?: LexicalNode }) | null = null;
  try {
    parsed = JSON.parse(serialized) as LexicalNode & { root?: LexicalNode };
  } catch {
    // 이전 버전에서 일반 텍스트로 저장된 문서에는 미리보기 블록이 없다.
    return [];
  }

  const blocks: LabeledHtmlPreviewBlock[] = [];
  let lastHeading = "";

  const walk = (node: LexicalNode) => {
    if (node.type === "heading") {
      lastHeading = inlineText(node).trim();
      return;
    }
    if (node.type === "html-preview") {
      blocks.push({ html: node.html ?? "", css: node.css ?? "", label: lastHeading });
      return;
    }
    (node.children ?? []).forEach(walk);
  };

  const root = parsed.root ?? parsed;
  (root.children ?? []).forEach(walk);
  return blocks;
}
