# 회원 가입 구현·검증 기록

기준 소스: `POST /signup` 구현 직후의 현재 작업 트리

## 세부 계획 완료 상태

- [x] **API 설계** — `SignUpRequest`, `SignUpResponse`와 `signup-api-spec.md`에 요청·응답, `201/400/409/503`, 입력 검증 규칙을 기록했다.
- [x] **도메인·영속성** — `User.passwordHash`를 `password_hash NOT NULL` 컬럼으로 추가하고, `login_id UNIQUE` 제약과 repository 중복 조회를 사용한다.
- [x] **서비스** — `SignUpService`가 로그인 ID를 소문자로 정규화하고 BCrypt 해시를 만든 뒤 `CUSTOMER` 역할과 `UserRole`을 `@Transactional` 범위에서 생성한다.
- [x] **컨트롤러** — `SignUpController`가 `POST /signup`을 제공한다. 응답 DTO에 `password`와 `passwordHash`는 없다. `ApiExceptionHandler`가 가입 업무 오류를 공통 오류 형식으로 변환한다.
- [x] **통합 테스트** — `SignUpControllerTest`가 H2 DB에서 아래 성공·실패 흐름을 검증한다.

## 완료 기준과 근거

| 조건 | 결과 | 근거 |
| --- | --- | --- |
| 유효 요청이 활성 사용자와 기본 역할 관계를 만든다 | 충족 | `createsActiveUserAndCustomerRoleWithHashedPassword`: `active=true`, `CUSTOMER` 기준 역할의 `UserRole` 한 건을 확인한다. |
| 비밀번호가 단방향 해시로만 저장되고 응답에 없다 | 충족 | 같은 테스트에서 원문과 `passwordHash`가 다르고 `PasswordEncoder.matches`가 참임을 확인하며, JSON에 `password`, `passwordHash`가 없음을 확인한다. |
| 중복 ID가 계정을 추가하지 않고 일관된 오류를 준다 | 충족 | `normalizesLoginIdAndRejectsDuplicateWithoutCreatingAnotherUser`: 대소문자 정규화 후 `409 DUPLICATE_LOGIN_ID`, User/UserRole 각각 한 건을 확인한다. |
| 필수값·형식 오류가 검증 오류를 준다 | 충족 | `returnsFieldErrorsForInvalidRequiredOrFormattedValues`: `400 INVALID_REQUEST`와 세 필드의 오류를 확인한다. |
| 기본 역할 누락이 가입을 남기지 않는다 | 충족 | `returnsServiceUnavailableWithoutCreatingUserWhenDefaultRoleIsMissing`: `503 DEFAULT_ROLE_NOT_FOUND`와 User/UserRole 0건을 확인한다. |
| 단위 또는 통합 테스트와 Gradle 테스트가 통과한다 | 충족 | 2026-09-08 실행: `./gradlew test` → `BUILD SUCCESSFUL` (약 4초). |

## 후속 범위

이 작업은 회원 **계정 생성**까지다. 실제 로그인 세션/JWT, 비밀번호 재설정, 이메일·휴대폰 본인 확인, 계정 잠금 정책은 별도 인증 작업으로 분리한다.
