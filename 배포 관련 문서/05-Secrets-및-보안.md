# Secrets 및 보안 런북

## GitHub Secrets

`dota-pilot1/pkt-study-tauri`에 다음 Secret이 필요합니다.

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- `VITE_API_BASE`
- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`

Apple 인증서 원본은 로컬 배포 가이드의 보호된 `.local-secrets`에서 등록하며 Git에 커밋하지 않습니다.

## 로컬 Apple 서명 입력

`/Users/terecal/Desktop/pkt-apple-signing-secrets.txt`는 로컬 macOS 릴리즈에 참고할 수 있는 저장소 밖 보호 파일이다. 값을 문서에 복사하거나 로그에 출력하지 않는다. 파일을 쉘에 `source`하지 말고, 필요한 키만 `KEY=VALUE` 데이터로 파싱한다.

- 빌드 서명: `APPLE_SIGNING_IDENTITY` 값과 Keychain의 유효한 Developer ID Application 인증서가 일치해야 한다.
- Apple 공증: `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`를 사용한다.
- 공증 명령에서는 `SECRET_DIR`, Apple ID, app-specific password를 먼저 별도 명령으로 변수에 대입한다. 여러 환경변수 대입을 `xcrun notarytool` 앞 한 줄에 섞으면 셸 확장 순서 때문에 잘못된 값이 전달될 수 있다. 상세 원인과 검증법은 `09-macOS-공증-중요-디버깅.md`를 따른다.
- 인증서 설치: Keychain에 인증서가 없을 때만 `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`가 필요하다.
- Tauri updater 서명: Apple 서명과 별개로 `pkt-study-fullstack-updater.key`와 일치하는 공개키를 사용한다.

## 서버 보안

DB 접속 정보, JWT 시크릿, AWS 자격증명, CORS 설정은 EC2의 systemd 환경변수 또는 별도 환경 파일에서 관리합니다.

`.env`, 개인키, 인증서, 비밀번호는 저장소에 커밋하지 않습니다. 키가 노출되었다고 판단되면 Secret과 DB/JWT 자격증명을 즉시 교체하고 API를 재시작합니다.
