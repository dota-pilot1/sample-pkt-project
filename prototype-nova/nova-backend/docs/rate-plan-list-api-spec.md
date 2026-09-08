# 요금제 목록 조회 API Spec

## GET `/api/plans`

요금제 목록을 조건에 따라 조회한다. 목록 응답은 상세 정보가 아닌 화면 목록에 필요한 요약 정보만 반환한다.

### Query parameters

| 이름 | 필수 | 기본값 | 규칙 |
| --- | --- | --- | --- |
| `keyword` | 아니오 | 없음 | 요금제 코드 또는 이름 부분 일치, 대소문자 무시 |
| `categoryCode` | 아니오 | 없음 | 요금제 분류 코드, 대소문자 무시 |
| `status` | 아니오 | 전체 | `DRAFT`, `ACTIVE`, `SUSPENDED`, `TERMINATED` |
| `page` | 아니오 | `1` | 1-based 페이지 번호, 1 이상 |
| `size` | 아니오 | `20` | 페이지 크기, 1~100 |
| `sort` | 아니오 | `ratePlanCode` | `ratePlanCode`, `name`, `monthlyFee`, `updatedAt` |
| `direction` | 아니오 | `asc` | `asc`, `desc` |

기본 정렬은 `ratePlanCode asc`다. 정렬 필드와 방향은 임의의 DB 컬럼명으로 전달할 수 없으며 허용 목록만 사용한다.

### Request example

```http
GET /api/plans?keyword=5G&status=ACTIVE&page=1&size=20&sort=monthlyFee&direction=asc
```

### 200 response

```json
{
  "items": [
    {
      "id": 1,
      "ratePlanCode": "MOBILE-5G-59",
      "name": "5G Flex 59",
      "categoryCode": "MOBILE",
      "categoryName": "휴대폰",
      "monthlyFee": 59000.00,
      "salesStatus": "ACTIVE",
      "updatedAt": "2026-09-06T09:00:00+09:00"
    }
  ],
  "page": 1,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

검색 결과가 없으면 오류가 아니라 다음처럼 `200`을 반환한다.

```json
{
  "items": [],
  "page": 1,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

### 400 response

잘못된 상태·정렬 필드·정렬 방향·페이지 번호·페이지 크기는 `400`으로 거절한다.

```json
{
  "code": "INVALID_SORT",
  "message": "허용되지 않은 정렬 필드입니다.",
  "fieldErrors": {}
}
```
