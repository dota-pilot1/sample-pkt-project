# SK PKT MES 프로젝트

> 이 문서와 `sk-pkt-mes-front`, `sk-pkt-mes-server`를 PKT 전용 프로젝트의 기준으로 사용한다. 루트의 기존 MES 문서는 공통 보일러플레이트 참고 자료다.

이 프로젝트는 SK하이닉스 PKT(Package Test) 업무를 학습하기 위한 전용 MES 프로토타입이다.

실행 포트는 기존 일반 제조 MES와 충돌하지 않도록 프론트 `4200`, 백엔드 `4201`, PostgreSQL `5454`를 사용한다. 프로젝트 실행 이름은 `sk-pkt-mes`로 관리한다.

## 핵심 업무 흐름

```text
제품/Package 등록
→ 공정 Route 정의
→ LOT 생성
→ 테스트 프로그램 선택
→ Tester 배정
→ 테스트 실행
→ Pass/Fail 결과 기록
→ 수율·불량 분석
→ LOT 이력 추적
```

## 1차 구현 범위

- 제품/Package 기준정보
- 공정 Route와 공정 단계
- LOT 생성과 상태 관리
- Tester 및 테스트 프로그램
- LOT 테스트 작업지시
- 테스트 결과와 수율 계산
- LOT 이력 및 불량 분석

기존 복사본의 인증·인가, 메뉴, 공통 UI, React Query, DDD/FSD 구조는 재사용하되, 가구 조립 예시 중심의 BOM/MRP 흐름은 PKT의 LOT·공정·테스트·수율 흐름으로 단계적으로 교체한다.
