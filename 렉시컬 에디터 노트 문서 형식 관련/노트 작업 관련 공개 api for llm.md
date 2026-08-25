# PKT Playbook 노트 작업 관련 공개 API for LLM

이 문서는 PKT Playbook의 2차 주제 본문 문서와 TODO 하위 문서를 조회·생성·수정·정렬하는 API 기준이다. 구체적인 `spaceCode`, `topicId`, 문서 ID, 버전은 작업 전에 API로 조회한다.

## 작업 원칙

1. 먼저 tree 또는 topic 조회로 기존 문서와 `version`을 확인한다.
2. 본문 문서에는 전체 TODO 계획만 작성한다.
3. TODO 하나마다 하위 문서 하나를 만든다. Step은 하위 문서 본문 안에 작성한다.
4. 수정 시 최신 `expectedVersion`을 사용한다.
5. 구현 전에는 존재하지 않는 파일·API·응답을 확정하지 않는다.
6. 구현 후 실제 파일 경로, 코드, 테스트·조회 결과를 문서에 반영한다.

## 기본 URL과 식별자

```text
baseUrl: http://localhost:4201/api/llm/hospital-playbook
spaceCode: 작업 대상 공간 코드
topicId: 작업 대상 2차 주제 ID
```

## 구조 생성

```http
POST {baseUrl}/structure
Content-Type: application/json
```

```json
{
  "spaceCode": "PKT_FRONT_LEV1",
  "categoryTitle": "기본 UI 실습",
  "topicTitles": ["기본 테이블", "컴포넌트 만들기", "페이지에 적용"]
}
```

## 조회

```http
GET {baseUrl}/tree?spaceCode={spaceCode}
GET {baseUrl}/topics/{topicId}
GET {baseUrl}/documents/{documentId}
GET {baseUrl}/categories/{categoryId}
```

2차 주제 조회 결과에 본문 문서가 있으면 새 본문을 만들지 않고 기존 문서와 최신 version을 사용한다.

## 본문 문서 생성·수정

```http
POST {baseUrl}/topics/{topicId}/documents
PATCH {baseUrl}/documents/{documentId}/content
Content-Type: application/json
```

```json
{
  "title": "LOT 조회 페이지네이션 서버 구현 전체 계획",
  "content": "Lexical EditorState를 JSON.stringify한 문자열",
  "expectedVersion": 3,
  "parentId": null
}
```

생성 요청에서는 `expectedVersion`을 보내지 않는다. 수정 요청에서는 조회한 최신 version을 보낸다.

## TODO 하위 문서 생성

```http
POST {baseUrl}/topics/{topicId}/children
Content-Type: application/json
```

```json
{
  "parentId": 123,
  "title": "TODO 1. LOT 도메인 모델과 응답 계약 구현",
  "content": "TODO 1의 Step 1~N을 담은 Lexical EditorState 문자열"
}
```

`parentId`는 본문 문서의 실제 ID다. Step별 `parentId` 문서는 만들지 않는다.

## 하위 문서 순서 변경

```http
POST {baseUrl}/topics/{topicId}/documents/reorder
Content-Type: application/json
```

```json
{
  "ids": [201, 202, 203],
  "parentId": 123
}
```

## 문서 삭제

```http
DELETE {baseUrl}/documents/{documentId}
```

삭제 전 tree를 조회해 대상 ID와 하위 문서 범위를 확인한다. 문서 삭제 시 해당 하위 문서와 댓글도 함께 삭제될 수 있으므로 대상 확인 후 실행한다.

## Lexical 저장 규칙

`content`에는 Markdown이나 HTML이 아니라 `JSON.stringify(editorState)` 결과를 넣는다.

- root에는 `children`, `direction`, `format`, `indent`, `type: "root"`, `version`을 둔다.
- 일반 문단은 `paragraph`, 제목은 `heading`과 `tag: "h1"`~`"h6"`를 사용한다.
- 섹션은 제목 다음에 하나의 `quote` 노드로 설명을 묶는다.
- 파일 경로와 실제 코드는 quote 밖의 독립 `code` 블록으로 둔다.
- 파일 경로는 `language: "text"`, 실제 코드는 실제 언어명을 사용한다.
- code 블록의 children에는 `type: "code-highlight"` 노드를 두고 전체 코드를 `text`에 넣는다.
- 섹션 사이에는 빈 `paragraph` 2개를 둔다. 목록 항목 사이에는 빈 paragraph를 두지 않는다.
- JSON 문자열 안의 줄바꿈은 JSON 직렬화에 맡긴다. `\\n`을 수동으로 이중 escape하지 않는다.
