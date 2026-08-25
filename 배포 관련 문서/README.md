# PKT React Practice 배포 문서

사람과 AI 코딩 에이전트가 동일한 운영 절차를 따라갈 수 있도록 작성한 배포 런북입니다.

## 문서 순서

1. `01-운영-구성.md` - 운영 주소와 인프라
2. `02-웹-배포.md` - React/Vite 및 S3/CloudFront
3. `03-API-서버-운영.md` - Spring Boot, systemd, PostgreSQL
4. `04-앱-릴리즈.md` - Tauri GitHub Release와 updater
5. `05-Secrets-및-보안.md` - Secret과 민감정보 원칙
6. `06-장애-대응-체크리스트.md` - 검증, 장애, 롤백
7. `07-Tauri-앱-배포-정보-총정리.md` - 기존 `pkt-study-tauri` 배포 참고
8. `08-PKT-Study-Fullstack-하이브리드-릴리즈.md` - 현행 앱의 로컬 macOS + Actions Windows 릴리즈
9. `09-macOS-공증-중요-디버깅.md` - Apple 공증 401, 셸 변수 확장, staple/Gatekeeper 검증

## 상태 보고를 재현하는 문서

프론트·백엔드 버전 어긋남, LOT 정렬 지원 여부, EC2 키 경로 확인, 로컬 플레이북 API 접근 방법은 `03-API-서버-운영.md`의 다음 절을 따른다.

- `프론트·백엔드 버전 어긋남 확인`
- `EC2 키 경로를 확인하는 방법`
- `로컬 플레이북 API 확인 방법`

운영 프론트 빌드 재현과 `.env.production` 확인은 `02-웹-배포.md`의 `검증 및 빌드` 절을 따른다.

## 현재 운영 주소

- 웹: <https://hibot-docu.com>
- API: <https://api.hibot-docu.com>
- 웹/API 저장소: <https://github.com/dota-pilot1/sample-pkt-project>
- 현행 풀스택 앱 저장소: <https://github.com/dota-pilot1/pkt-study-fullstack>
- 현행 풀스택 앱 Release: <https://github.com/dota-pilot1/pkt-study-fullstack/releases>
- 기존 분리형 앱 저장소: <https://github.com/dota-pilot1/pkt-study-tauri>

> 보안: 비밀번호, 개인키, p12 원문, Apple 계정 비밀번호는 이 폴더에 기록하지 않습니다.

## 현재 자동 배포 흐름

```text
main push
  └─ Deploy backend
       ├─ JAR 빌드·EC2 백업·교체·systemd 재시작
       ├─ 운영 OpenAPI에서 LOT 정렬 파라미터 검증
       └─ 성공 시 Deploy frontend
            ├─ 프론트 lint·build
            ├─ S3 동기화
            ├─ CloudFront invalidation
            └─ 웹 응답 확인

PKT Study Fullstack 릴리즈
  ├─ macOS: 로컬 빌드·Developer ID 서명·Apple 공증·Release 직접 업로드
  └─ Windows: workflow_dispatch로 NSIS 설치 파일만 빌드·기존 Release에 추가

기존 PKT Study Tauri 릴리즈
  ├─ macOS: 로컬 universal DMG 빌드·서명·공증·Release 직접 업로드
  └─ Windows: workflow_dispatch로 NSIS와 updater 산출물 생성
```

백엔드와 프론트 워크플로는 `main` push에 자동 실행된다. 프론트는 백엔드 워크플로가 성공한 경우에만 이어서 실행되며, 두 워크플로 모두 GitHub Actions 화면에서 수동 실행할 수도 있다. 현행 `pkt-study-fullstack` Tauri 앱은 Actions 비용을 줄이기 위해 `08-PKT-Study-Fullstack-하이브리드-릴리즈.md`의 절차를 따른다.
