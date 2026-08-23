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

## 서버 보안

DB 접속 정보, JWT 시크릿, AWS 자격증명, CORS 설정은 EC2의 systemd 환경변수 또는 별도 환경 파일에서 관리합니다.

`.env`, 개인키, 인증서, 비밀번호는 저장소에 커밋하지 않습니다. 키가 노출되었다고 판단되면 Secret과 DB/JWT 자격증명을 즉시 교체하고 API를 재시작합니다.
