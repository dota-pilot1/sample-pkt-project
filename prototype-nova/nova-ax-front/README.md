# NOVA AX Front (`nova-ax-front`)

SK그룹의 **AX(AI Transformation) 전략(울산CLX 듀얼 브레인, 1인 1 AI 에이전트, 프로세스 혁신)**을 기간계 통신/과금 시스템(BSS)에 접목하여 연습할 수 있는 독립 프론트엔드 프로젝트입니다.

---

## 📌 주요 특징 및 기능

### 1. 듀얼 브레인 (Dual-Brain) 승인 센터 (Human-in-the-Loop)
- **AI의 24시간 감지**: 보안 이상 접속, 요금제 유휴 대역폭, 해지 위험군 가입자 패턴을 실시간 분석.
- **숙련 엔지니어의 최종 승인**:
  - AI 진단 신뢰도(Confidence Score), 데이터 근거(Reasoning), 예상 영향도(Impact) 검토
  - **[1-클릭 최종 승인 및 백엔드 즉시 반영]** 또는 **[반려 사유 입력 후 반려]**
  - 백엔드 실행 API 규격(Endpoint, HTTP Method, Payload) 실시간 확인

### 2. 1인 1 에이전트 BSS AI Copilot
- 우측 슬라이드 패널을 통해 대화형으로 기간계 업무 명령 수행
- **Agentic UX**:
  - AI 사고 단계(Thinking Steps) 시각화
  - 백엔드 도구 호출(Tool Calls) 내역 확인
  - 대화 중 즉시 신규 듀얼 브레인 안건 생성 및 보드 연동

### 3. 포트 구성
- `nova-backend`: `http://localhost:4401` (Spring Boot 백엔드)
- `nova-front`: `http://localhost:4400` (기존 BSS 관리자 화면)
- **`nova-ax-front`**: **`http://localhost:4410`** (신규 AX 특화 화면)

---

## 🚀 실행 방법

```bash
cd /Users/terecal/pilot-project/sample-pkt-project/prototype-nova/nova-ax-front

# 개발 서버 실행 (포트 4410)
npm run dev

# 빌드 및 프로덕션 실행
npm run build
npm run start
```

브라우저에서 `http://localhost:4410` 에 접속하여 확인하실 수 있습니다.
