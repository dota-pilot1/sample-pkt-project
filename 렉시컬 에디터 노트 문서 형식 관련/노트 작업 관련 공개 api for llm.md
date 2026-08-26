# PKT Playbook 노트 작업 관련 공개 API for LLM

이 문서는 PKT Playbook의 2차 주제 본문 문서와 TODO 하위 문서를 조회·생성·수정·정렬하는 API 기준이다. `spaceCode`, Category·Topic·Document ID, `version`, API base URL은 고정하지 않으며 작업 직전에 현재 앱의 `API for LLM` 안내와 조회 응답으로 확정한다.

## 작업 원칙

1. 현재 앱의 `API for LLM` 버튼에서 base URL과 요청 예시를 확인한다. 이 문서의 예시 주소보다 현재 앱 안내를 우선한다.
2. `tree` 또는 `topic` 조회로 화면에서 선택한 1차 영역·2차 주제와 기존 TODO 본문 문서·`version`을 확인한다.
3. 같은 1차 영역·2차 주제·본문 문서가 있으면 새 구조나 문서를 만들지 않는다.
4. TODO 하나를 하나의 본문 문서로 만든다. 본문에는 해당 TODO의 목표·범위·선행 조건·완료 기준만 작성한다.
5. TODO가 길면 API 구현·Front 구현 하위 문서를 만들고, 각 하위 문서 안에 Step 1~N을 작성한다.
6. 수정 시 최신 `expectedVersion`을 사용한다.
7. 구현 전에는 존재하지 않는 파일·API·응답을 확정하지 않는다.
8. 구현 후 실제 파일 경로, 코드, 테스트·조회 결과를 문서에 반영한다.

## 기본 URL과 식별자

```text
baseUrl: 현재 앱의 API for LLM 버튼에서 확인
spaceCode: tree 조회로 확인한 작업 대상 공간 코드
categoryId: 화면에서 선택한 1차 영역 조회 결과
topicId: 화면에서 선택한 2차 주제 조회 결과
```

## 구조 생성

`structure`는 기존 Category·Topic을 재사용하지 않는 구현일 수 있으므로, 기존 트리 확인 없이 호출하지 않는다. 화면에 이미 보이는 1차 영역·2차 주제라면 구조 생성 대신 조회한 `topicId`를 사용한다. 새 구조가 정말 필요할 때만 현재 앱 안내의 구조 생성 API를 호출하고, 응답 ID를 다시 조회해 확인한다.

```http
POST {baseUrl}/structure
Content-Type: application/json
```

```json
{
  "spaceCode": "조회로 확인한 spaceCode",
  "categoryTitle": "조회 결과에 없는 새 1차 영역",
  "topicTitles": ["조회 결과에 없는 새 2차 주제"]
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
