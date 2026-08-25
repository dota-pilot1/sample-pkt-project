# Tauri 앱 배포 정보 총정리

이 문서는 `PKT Study` 앱의 배포를 재현하기 위한 상세 참고 문서입니다.

## 기본 정보

| 항목 | 값 |
|---|---|
| 앱 이름 | `PKT Study` |
| identifier | `com.cj.pkt.study` |
| 앱 소스 | `pkt-study-tauri` |
| 릴리즈 저장소 | `dota-pilot1/pkt-study-tauri` |
| 운영 API | `https://api.hibot-docu.com/api` |
| updater | GitHub Release `latest.json` |
| 마지막 성공 릴리즈 | `v0.1.23` |
| 빌드 방식 | macOS 로컬, Windows 수동 Actions |

## 릴리즈 저장소의 핵심 파일

- `package.json`: npm 버전과 빌드 명령
- `package-lock.json`: npm 잠금 파일
- `src-tauri/Cargo.toml`: Rust 패키지 버전
- `src-tauri/tauri.conf.json`: 번들, updater endpoint/public key
- `src-tauri/capabilities/default.json`: API 접근 허용 origin
- `.github/workflows/tauri-release.yml`: Windows x64 NSIS 수동 빌드

## 버전 규칙

다음 세 파일의 버전을 동일하게 맞춥니다.

1. `package.json`
2. `src-tauri/Cargo.toml`
3. `src-tauri/tauri.conf.json`

예를 들어 파일 버전이 `0.1.23`이면 Git tag는 `v0.1.23`이어야 합니다.

## GitHub Secrets

저장소 `dota-pilot1/pkt-study-tauri`에 등록합니다.

- `VITE_API_BASE`: `https://api.hibot-docu.com/api`
- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`: `Developer ID Application: Hyunseok oh (5PRM3RRTSH)`
- `APPLE_ID`
- `APPLE_PASSWORD`: Apple app-specific password
- `APPLE_TEAM_ID`: `5PRM3RRTSH`

Secret 원문은 GitHub에서 다시 읽을 수 없으므로, 원본 파일은 로컬 보호 디렉터리에서만 사용합니다. 개인키·p12·비밀번호를 코드나 이 문서에 넣지 않습니다.

## 운영 API 연결 시 확인할 것

- `VITE_API_BASE`가 localhost가 아닌 운영 URL인지
- `src-tauri/capabilities/default.json`에 `https://api.hibot-docu.com/*`가 있는지
- API 서버 CORS가 앱/웹 origin을 허용하는지
- 앱 빌드 전에 환경변수가 실제로 주입되는지

## 정식 실행 순서

1. 릴리즈 저장소 main을 최신화합니다.
2. 세 버전 파일을 같은 값으로 변경합니다.
3. `npm ci`를 실행합니다.
4. `npm run build`를 실행합니다.
5. `git diff --check`를 실행합니다.
6. main을 push하고 `vX.Y.Z` 태그를 push합니다.
7. macOS universal DMG를 로컬 빌드·서명·공증하고 Release에 업로드합니다.
8. Windows 전용 워크플로를 `release_tag=vX.Y.Z`로 수동 실행합니다.
9. Windows job과 Release 파일, `latest.json`을 확인합니다.

## 산출물

- `latest.json`
- `PKT.Study_VERSION_universal.dmg`
- `PKT.Study_VERSION_x64-setup.exe`
- `PKT.Study_VERSION_x64-setup.exe.sig`
- `PKT.Study_universal.app.tar.gz`와 `.sig`는 일치하는 updater 개인키로 macOS updater artifact를 만든 경우에만 생성

## 검증 명령

- `gh run list --repo dota-pilot1/pkt-study-tauri --limit 5`
- `gh release view vX.Y.Z --repo dota-pilot1/pkt-study-tauri`
- `curl -I -L https://github.com/dota-pilot1/pkt-study-tauri/releases/latest/download/latest.json`

HTTP 200, macOS DMG, Windows 설치 파일, Windows `.sig`, `latest.json`이 모두 있어야 배포 완료로 판단합니다.

## 자주 발생하는 실패

### Windows checkout invalid path

통합 저장소의 특수한 문서 경로가 Windows checkout과 충돌할 수 있습니다. 이 앱은 전용 릴리즈 저장소에서 빌드합니다.

### macOS codesign/security import

Apple 6종 Secret과 p12 base64 형식, p12 비밀번호, signing identity를 확인합니다. 인증서가 없으면 unsigned DMG는 만들 수 있지만 정식 macOS 배포에는 적합하지 않습니다.

### 로컬 macOS updater 키 불일치

`tauri.conf.json`의 updater 공개키와 로컬 `.pub` 파일을 원문 출력 없이 비교합니다. 일치하는 개인키가 없으면 다른 앱의 키를 사용하지 않습니다. DMG만 로컬 빌드하고 Windows Actions가 Windows updater 산출물과 `latest.json`을 생성하게 합니다. macOS updater artifact가 필요한 릴리스는 일치하는 개인키를 복구하거나 macOS Actions Secret을 사용해야 합니다.

### updater 실패

`latest.json`과 `.sig`가 Release에 있는지, 앱의 updater public key와 Secret private key가 같은 키 쌍인지, 새 버전 번호가 더 높은지 확인합니다.

## 보안·롤백

- updater private key는 교체 전에 기존 설치 앱의 검증 영향을 검토합니다.
- Apple app-specific password나 인증서가 노출되면 즉시 폐기/재발급합니다.
- 문제 릴리즈는 이전 정상 Release로 배포합니다.
- 운영 API 장애는 앱을 재빌드하기 전에 API 상태와 CORS를 먼저 확인합니다.

## v0.1.23 릴리즈 기록

- 기능: 앱 내 업데이트 확인, 릴리스 노트 표시, 다운로드 진행률, 설치 후 재실행
- 커밋: `a65a546 feat: add in-app update flow`
- Release: <https://github.com/dota-pilot1/pkt-study-tauri/releases/tag/v0.1.23>
- macOS: universal DMG 로컬 빌드, Developer ID 서명, Apple 공증 `Accepted`, staple 및 Gatekeeper 검증 완료
- macOS DMG SHA-256: `15227eea6ee8e09538aa562adda86bde1b43e3ccf0a7481f5de4ff0ea06631db`
- Windows: 수동 Actions 성공, x64 NSIS 설치 파일과 `.sig` 업로드 완료
- Actions: <https://github.com/dota-pilot1/pkt-study-tauri/actions/runs/32821259462>
- `latest.json`: `0.1.23`, Windows x64/NSIS 플랫폼 제공
- 주의: 로컬에 일치하는 macOS updater 개인키가 없어 이번 macOS 배포는 DMG 수동 설치 방식입니다.
