import { useMemo } from "react";
import { getApiBase } from "../../shared/api/client";
import type { PlaybookDomain } from "../../features/hospital-playbook/api";
import ApiGuideDialogShell from "./ApiGuideDialogShell";

type LlmApiGuideDialogProps = {
  domain: PlaybookDomain;
  parentDocumentId?: number | null;
  onClose: () => void;
};

export default function LlmApiGuideDialog({ domain, parentDocumentId = null, onClose }: LlmApiGuideDialogProps) {
  const guide = useMemo(() => {
    const base = `${getApiBase()}/api/llm/hospital-playbook`;
    return `# PKT Playbook LLM API

baseUrl: ${base}
spaceCode: ${domain}

## 1. 1차·2차 메뉴를 한 번에 생성
POST ${base}/structure
Content-Type: application/json

{
  "spaceCode": "${domain}",
  "categoryTitle": "기본 UI 실습",
  "topicTitles": ["기본 테이블", "컴포넌트 만들기", "페이지에 적용"]
}

## 2. 본문 저장
PATCH ${base}/documents/{documentId}/content
Content-Type: application/json

{
  "title": "LOT 목록 테이블 만들기",
  "content": "Lexical JSON 문자열",
  "expectedVersion": 3,
  "parentId": null
}

## 3. 최상위 문서 생성
POST ${base}/topics/{topicId}/documents
Content-Type: application/json

{
  "title": "1. 기본 테이블 만들기",
  "content": "Lexical JSON 문자열",
  "parentId": null
}

## 4. 하위 문서 생성
POST ${base}/topics/{topicId}/children
Content-Type: application/json

{
  "parentId": ${parentDocumentId ?? "{parentDocumentId}"},
  "title": "컴포넌트 만들기",
  "content": "하위 문서 본문을 저장합니다."
}

## 5. 조회
GET ${base}/tree?spaceCode=${domain}
GET ${base}/categories/{categoryId}
GET ${base}/topics/{topicId}
GET ${base}/documents/{documentId}

## 6. 하위 문서 순서 변경
POST ${base}/topics/{topicId}/documents/reorder
Content-Type: application/json

{
  "ids": [{childDocumentId1}, {childDocumentId2}, {childDocumentId3}],
  "parentId": ${parentDocumentId ?? "{parentDocumentId}"}
}

## 7. Lexical content 저장 형식

content는 Markdown이나 HTML이 아니라 Lexical EditorState를 JSON.stringify한 문자열입니다.

- 최상위 구조는 {"root":{"children":[...]}}입니다.
- root에는 children, direction, format, indent, type: "root", version을 포함합니다.
- 일반 문단은 type: "paragraph", 제목은 type: "heading"과 tag: "h1"~"h6"를 사용합니다.
- 목록은 Lexical의 list와 listitem 노드로 저장합니다.
- 섹션 사이의 간격은 children: []인 빈 paragraph 2개로 표현합니다. CSS 여백만으로 섹션 간격을 만들지 않습니다.
- list에는 children, direction, format, indent, listType, start, tag, type, version을 포함하고 listitem에는 children, checked, direction, format, indent, type, value, version을 포함합니다.
- 목록 항목 사이에는 빈 paragraph를 넣지 않습니다.
- 각 섹션은 h2 제목 다음에 본문 paragraph 또는 list 전체를 하나의 type: "quote" 노드 안에 넣어 파스텔 배경으로 표시합니다.
- 파일 경로나 실제 코드는 섹션 quote 밖에 독립된 type: "code" 블록으로 배치합니다. 코드 블록에는 배경색을 중첩하지 않습니다.
- 구현 계획 문서는 h1 제목 → quote 목표 → h2 제목 → quote 본문 → 필요 시 code 블록 순서로 작성합니다. 목록 항목 사이에는 빈 paragraph를 넣지 않습니다.
- 섹션 사이에는 children: []인 빈 paragraph 2개를 둡니다.
- 아직 구현하지 않은 계획 단계에서는 확정되지 않은 API 경로·응답 예시를 추가하지 않고, 구현 완료 후 실제 조회 API만 이 안내에 반영합니다.
- 실제 코드만 type: "code" 블록으로 저장하고 language는 "code-highlight.text"를 사용합니다.
- code 블록은 children 안에 type: "code-highlight" 노드를 두고, 코드 전체를 그 노드의 text에 넣습니다. 코드 안의 줄바꿈은 text 값에 그대로 유지합니다.
- content에 Markdown, HTML, 또는 코드 전체를 넣지 않습니다.
- 줄바꿈은 JSON 직렬화에 맡기며 문자 \\n 을 직접 입력하거나 이중 escape하지 않습니다.
- 수정 전 최신 문서를 조회하고 expectedVersion을 맞춥니다.

`; 
  }, [domain, parentDocumentId]);

  return (
    <ApiGuideDialogShell
      title="API for LLM"
      description="구조·본문·하위 문서 생성·정렬·조회 API를 한 번에 복사합니다."
      copyText={guide}
      onClose={onClose}
      ariaLabel="API for LLM"
      footer={
        <>
          <p className="font-black text-text-primary">사용 순서</p>
          <p>기존 tree 조회 → 없을 때만 구조 생성 → ID 확인 → 최상위 문서 생성 → 최신 version 확인 → 본문 저장 → 하위 문서 생성 → 컴포넌트 만들기 → 페이지에 적용 → 문법 포인트 순서로 정렬 → 다시 조회</p>
          <p className="mt-1">본문 <code className="rounded bg-surface-muted px-1 py-0.5 font-mono">content</code>는 Lexical EditorState를 JSON.stringify한 문자열입니다. 섹션 본문 paragraph·list 전체는 하나의 <code className="rounded bg-surface-muted px-1 py-0.5 font-mono">quote</code> 안에 넣고, 실제 코드·파일 경로만 독립된 <code className="rounded bg-surface-muted px-1 py-0.5 font-mono">code-highlight.text</code> 코드 블록에 넣습니다. 섹션 사이에는 <code className="rounded bg-surface-muted px-1 py-0.5 font-mono">children: []</code>인 빈 paragraph 2개를 두되 목록 항목 사이에는 넣지 않습니다. 계획 문서는 확정되지 않은 API를 임의로 적지 않고, 구현 완료 후 실제 API만 안내에 추가합니다.</p>
          <p className="mt-1">하위 문서는 <code className="rounded bg-surface-muted px-1 py-0.5 font-mono">parentId</code>에 부모 Document ID를 넣어 생성합니다. 409가 나오면 최신 문서를 다시 조회한 뒤 <code className="rounded bg-surface-muted px-1 py-0.5 font-mono">expectedVersion</code>을 갱신합니다.</p>
        </>
      }
    >
      <pre className="whitespace-pre-wrap bg-surface-muted px-5 py-4 font-mono text-[11px] leading-5 text-text-primary">{guide}</pre>
    </ApiGuideDialogShell>
  );
}
