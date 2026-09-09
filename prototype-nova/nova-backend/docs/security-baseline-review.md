# Spring Security 기본 설정 리뷰

## 이번 설정의 목적

로그인 API를 구현하기 전에 웹 보안의 기본 동작을 명시한다. Spring Security 웹 스타터를 사용하고, 기존 `PasswordEncoderConfig`의 BCrypt 해시는 그대로 회원가입과 다음 로그인 검증에 사용한다.

## 현재 정책

- 서버는 세션을 만들지 않는 REST API로 동작한다.
- CSRF, 폼 로그인, HTTP Basic, 로그아웃 엔드포인트는 사용하지 않는다. 로그인 구현에서 토큰 기반 인증을 추가할 수 있도록 기본 로그인 화면이나 기본 자격 증명 인증이 끼어들지 않게 한다.
- CORS는 `app.cors.allowed-origin` 한 곳만 허용하며, `Authorization` 요청 헤더와 `OPTIONS` 사전 요청을 허용한다. 현재는 쿠키 인증을 사용하지 않으므로 credentials는 허용하지 않는다.
- `/signup`, 향후 `/login`, health·OpenAPI 문서와 현재 프론트가 호출하는 대시보드·요금제 API만 공개한다. 목록에 없는 경로는 기본 차단한다.

## 다음 로그인 작업에서 할 일

`POST /login`에서 정규화한 로그인 ID로 사용자를 찾고 BCrypt로 비밀번호를 검증한다. 활성 사용자와 역할을 확인한 뒤 인증 결과를 발급한다. 인증 방식(JWT 등)이 정해지면 현재 공개인 `/api/**` 경로를 역할별 권한 정책으로 전환하고, 인증 실패는 401, 권한 부족은 403으로 구분한다.

## 검증 범위

`SecurityConfigTest`는 공개 대시보드 접근, 등록하지 않은 API의 차단, 설정된 프론트 Origin의 CORS 사전 요청을 확인한다. 기존 `SignUpControllerTest`도 계속 실행해 회원가입 공개 경로가 회귀하지 않는지 함께 검증한다.
