# NOVA 프로젝트 전체 할 일

목표: 운영자가 요금제를 관리하고, 고객의 가입 신청·개통을 처리하는 BSS 운영 콘솔을 단계적으로 완성한다.

## 1. 지금: 요금제 카탈로그 완성

- [x] PostgreSQL에 `rate_plan_categories`, `rate_plans`, `rate_plan_change_histories` 테이블 생성
- [x] 분류·요금제 Entity, Repository, 샘플 데이터, 목록/분류 조회 API 구현
- [ ] `GET /api/plans/{id}` 상세 조회 구현
- [ ] `POST /api/plans` 생성: 코드 중복·금액·필수값 검증
- [ ] `PATCH /api/plans/{id}` 초안(DRAFT) 수정과 낙관적 잠금(version) 구현
- [ ] `PATCH /api/plans/{id}/status` 상태 전이: DRAFT → ACTIVE → SUSPENDED만 허용
- [ ] 변경 시 `rate_plan_change_histories`에 전·후 스냅샷 기록
- [ ] 400/404/409 공통 오류 응답과 서비스·컨트롤러 테스트
- [ ] 프론트 목록/상세/등록 화면을 실제 API에 연결하고 대시보드 집계를 DB 기준으로 전환

## 2. 다음: 고객 가입과 개통 심사

- [ ] ACTIVE 요금제를 선택하는 고객·가입 신청(Order) 모델과 API 설계
- [ ] 가입 신청 생성, 심사, 개통 성공·실패 상태 흐름 구현
- [ ] 고객·주문 화면과 요금제 상세 연결

## 3. 운영 기반 갖추기

- [ ] 로그인·RBAC와 감사 로그 조회 추가
- [ ] 자동 테스트, 환경변수, Docker 기반 로컬 실행 절차 정리
- [ ] 배포·모니터링·장애 재현 절차 추가

## 4. 확장: MSA는 마지막

- [ ] 단일 애플리케이션에서 도메인 경계와 운영 흐름을 검증
- [ ] 필요성이 확인된 경계만 Customer/Order/Billing 등으로 분리

## 완료 기준

요금제 생성 → 초안 수정 → 판매 개시 → 판매 중단 흐름이 DB·API·화면에서 일관되게 동작하고, 변경 이력과 동시 수정 충돌을 확인할 수 있어야 한다.
