# 회원 가입 API 계약

## `POST /signup`

로그인 가능한 활성 사용자를 생성하고 기본 `CUSTOMER` 역할을 부여한다. 사용자 생성과 역할 부여는 하나의 트랜잭션으로 처리한다.

### 요청

```json
{
  "loginId": "nova.user",
  "password": "Valid1!pw",
  "displayName": "노바 사용자"
}
```

| 필드 | 규칙 |
| --- | --- |
| `loginId` | 영문으로 시작하는 4~30자의 영문·숫자·`.`·`_`·`-`. 공백을 제거하고 소문자로 저장한다. |
| `password` | 공백 없는 8~72자. 영문·숫자·특수문자를 각각 하나 이상 포함한다. BCrypt 단방향 해시만 저장한다. |
| `displayName` | 공백이 아닌 2~100자. 앞뒤 공백을 제거해 저장한다. |

### 성공 응답 — `201 Created`

```json
{
  "id": 1,
  "loginId": "nova.user",
  "displayName": "노바 사용자",
  "active": true,
  "roleCode": "CUSTOMER",
  "createdAt": "2026-09-08T10:00:00+09:00"
}
```

`password`, `passwordHash`는 응답에 포함하지 않는다.

### 오류 응답

| 상태 | 코드 | 경우 |
| --- | --- | --- |
| `400` | `INVALID_REQUEST` | 필수값 또는 형식 검증 실패. `fieldErrors`에 필드별 원인을 넣는다. |
| `409` | `DUPLICATE_LOGIN_ID` | 정규화된 로그인 ID가 이미 존재한다. |
| `503` | `DEFAULT_ROLE_NOT_FOUND` | 기본 `CUSTOMER` 역할 기준정보가 없어 가입을 완료할 수 없다. |

## 검증 근거

`SignUpControllerTest`는 정상 가입·활성 상태·기본 역할 연결·BCrypt 검증, 중복 로그인 ID, 입력 형식 오류, 기본 역할 누락 시 트랜잭션 결과를 검증한다. 최종 Gradle 실행 결과는 프로젝트 전체 할 일 문서에 기록한다.
