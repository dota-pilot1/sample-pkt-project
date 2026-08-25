# PKT Study Fullstack 하이브리드 릴리즈 런북

## 목적

`pkt-study-fullstack`을 하나의 설치형 제품으로 배포하면서 GitHub Actions 비용을 줄이기 위한 현행 절차입니다.

- macOS: 개발 Mac에서 직접 빌드하고 Developer ID 서명·Apple 공증 후 GitHub Release에 업로드합니다.
- Windows: `windows-latest` Actions 작업만 수동 실행하여 NSIS 설치 파일을 같은 Release에 추가합니다.
- 태그 push만으로 macOS와 Windows를 자동 빌드하지 않습니다.

macOS GitHub 호스팅 러너가 Windows보다 비싸므로, Apple 인증서와 공증 정보를 보유한 개발 Mac에서 macOS 산출물을 만드는 것이 비용 면에서 유리합니다. Windows는 macOS에서 정식 NSIS 설치 파일을 만들기 어렵기 때문에 Windows 러너를 선택적으로 사용합니다.

## 대상

| 항목 | 값 |
|---|---|
| 로컬 소스 | `/Users/terecal/pilot-project/sample-pkt-project/pkt-study-fullstack` |
| 소스 전용 저장소 | `dota-pilot1/pkt-study-fullstack` |
| 공개 배포 저장소 | `dota-pilot1/pkt-study-tauri` |
| Release/updater | <https://github.com/dota-pilot1/pkt-study-tauri/releases> |
| 워크플로 | `.github/workflows/tauri-release.yml` |
| macOS 산출물 | Apple Silicon용 `.dmg` |
| Windows 산출물 | x64 NSIS `-setup.exe` |

## 버전 동기화

릴리즈 전에 다음 파일의 버전을 모두 동일하게 맞춥니다.

1. `package.json`
2. `package-lock.json`
3. `src-tauri/Cargo.toml`
4. `src-tauri/Cargo.lock`의 `pkt-study-fullstack` 패키지
5. `src-tauri/tauri.conf.json`
6. 화면 하단에 표시하는 앱 버전

파일 버전이 `0.1.22`라면 Git 태그는 `v0.1.22`를 사용합니다.

## 공통 검증

```bash
cd /Users/terecal/pilot-project/sample-pkt-project/pkt-study-fullstack
npm ci
npx next typegen
npx tsc --noEmit
npm run build
node scripts/prepare-tauri-sidecar.mjs
cargo check --manifest-path src-tauri/Cargo.toml
git diff --check
```

`cargo check` 전에 sidecar를 생성하지 않으면 `binaries/node-<target>` 누락으로 실패한다. 정식 `npm run tauri -- build`는 `pretauri`에서 이 작업을 자동으로 실행한다.

검증 후 변경을 커밋하고 `main`에 push한 다음 annotated tag를 push합니다.

```bash
git push origin main
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

태그 push는 Release 식별자만 등록하며 데스크톱 빌드를 자동 실행하지 않습니다.

## macOS 로컬 빌드

Keychain에 다음 Developer ID 인증서가 있어야 합니다.

```text
Developer ID Application: Hyunseok oh (5PRM3RRTSH)
```

인증서 존재 여부만 확인합니다. 인증서나 비밀번호 원문은 출력하거나 문서에 기록하지 않습니다.

```bash
security find-identity -v -p codesigning
```

Apple Silicon용 앱과 DMG를 빌드합니다.

```bash
cd /Users/terecal/pilot-project/sample-pkt-project/pkt-study-fullstack
SECRET_DIR='/Users/terecal/english-agent-hub-container/배포 가이드/.local-secrets'
APPLE_SIGNING_IDENTITY='Developer ID Application: Hyunseok oh (5PRM3RRTSH)' \
  TAURI_SIGNING_PRIVATE_KEY="$(tr -d '\r\n' < "$SECRET_DIR/pkt-study-fullstack-updater.key")" \
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD='' \
  npm run tauri -- build --bundles app,dmg
```

산출물은 다음 위치에 생성됩니다.

```text
src-tauri/target/release/bundle/macos/PKT Study Fullstack.app
src-tauri/target/release/bundle/dmg/PKT Study Fullstack_VERSION_aarch64.dmg
src-tauri/target/release/bundle/macos/PKT Study Fullstack.app.tar.gz
src-tauri/target/release/bundle/macos/PKT Study Fullstack.app.tar.gz.sig
```

## Apple 공증과 티켓 고정

공증 명령은 `SECRET_DIR`, Apple ID, app-specific password를 각각 별도 명령으로 대입한 뒤 실행한다. 비밀번호는 개행 제거 등의 가공도 하지 않고 파일에서 직접 읽는다. 401 발생 사례와 검증 절차는 [`09-macOS-공증-중요-디버깅.md`](./09-macOS-공증-중요-디버깅.md)에 기록되어 있다.

Apple ID와 앱 전용 비밀번호는 Git에 넣지 않은 로컬 보호 파일을 사용합니다. 아래 경로는 파일 위치만 나타내며 값 자체는 문서화하지 않습니다.

```text
/Users/terecal/english-agent-hub-container/배포 가이드/.local-secrets/apple_id.txt
/Users/terecal/english-agent-hub-container/배포 가이드/.local-secrets/apple_app_specific_password.txt
```

또는 저장소 밖의 `/Users/terecal/Desktop/pkt-apple-signing-secrets.txt`를 로컬 입력으로 사용할 수 있다. 이 파일은 `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_TEAM_ID`를 가진다. 파일을 `source`로 실행하지 말고 `KEY=VALUE` 데이터로만 파싱하며, 값을 터미널·로그·문서에 출력하지 않는다. 이 파일은 절대 저장소 안으로 복사하거나 Git에 추가하지 않는다.

공증 제출 시 비밀값을 터미널에 직접 입력하거나 출력하지 않습니다.

```bash
SECRET_DIR='/Users/terecal/english-agent-hub-container/배포 가이드/.local-secrets'
DMG_PATH='src-tauri/target/release/bundle/dmg/PKT Study Fullstack_VERSION_aarch64.dmg'
NOTARY_APPLE_ID="$(tr -d '\r\n' < "$SECRET_DIR/apple_id.txt")"
NOTARY_PASSWORD="$(tr -d '\r\n' < "$SECRET_DIR/apple_app_specific_password.txt")"

xcrun notarytool submit "$DMG_PATH" \
  --apple-id "$NOTARY_APPLE_ID" \
  --password "$NOTARY_PASSWORD" \
  --team-id '5PRM3RRTSH' \
  --wait
```

`status: Accepted`를 확인한 뒤 공증 티켓을 DMG에 붙이고 Gatekeeper 검증을 수행합니다.

```bash
xcrun stapler staple "$DMG_PATH"
xcrun stapler validate "$DMG_PATH"
spctl --assess --type open --context context:primary-signature --verbose=4 "$DMG_PATH"
shasum -a 256 "$DMG_PATH"
```

정상 결과는 `source=Notarized Developer ID`입니다.

## GitHub Release 직접 생성·업로드

소스 전용 저장소의 태그가 예정 커밋을 가리키는지 먼저 확인한다. 공개 배포 저장소는 소스 태그를 공유하지 않으므로 `gh release create --verify-tag`를 사용하지 않고 `--target main`으로 배포용 태그를 생성한다.

```bash
TAG='vX.Y.Z'
DMG_PATH='src-tauri/target/release/bundle/dmg/PKT Study Fullstack_VERSION_aarch64.dmg'

gh api "repos/dota-pilot1/pkt-study-fullstack/git/ref/tags/$TAG"
gh release create "$TAG" "$DMG_PATH#PKT Study Fullstack $TAG · macOS Apple Silicon" \
  --repo dota-pilot1/pkt-study-tauri \
  --target main \
  --latest \
  --title "PKT Study Fullstack $TAG" \
  --notes '로컬에서 직접 빌드·서명·Apple 공증한 macOS 릴리즈입니다.'
```

Release가 이미 있으면 새로 만들지 않고 파일만 추가합니다.

```bash
gh release upload "$TAG" "$DMG_PATH" \
  --repo dota-pilot1/pkt-study-tauri
```

동일한 이름의 자산을 의도적으로 교체할 때만 `--clobber`를 사용합니다.

## Windows 설치 파일 빌드

macOS DMG와 Release 생성이 끝난 후 Windows 전용 워크플로를 수동 실행합니다.

```bash
gh workflow run tauri-release.yml \
  --repo dota-pilot1/pkt-study-fullstack \
  --ref main \
  -f release_tag=vX.Y.Z
```

진행 상태를 확인합니다.

```bash
gh run list \
  --repo dota-pilot1/pkt-study-fullstack \
  --workflow tauri-release.yml \
  --limit 5

gh run watch RUN_ID \
  --repo dota-pilot1/pkt-study-fullstack \
  --exit-status
```

이 워크플로는 `windows-latest` 한 개만 사용하고 `--bundles nsis`로 Windows 설치 파일만 빌드한다. **현재 workflow는 소스 전용 저장소의 Release에만 결과를 올리며, 공개 배포 저장소로 자동 이관하지 않는다.** Actions 성공 후 `.exe`, `.exe.sig`, Windows용 `latest.json`을 내려받아 공개 Release에 업로드하고, macOS 항목을 유지한 채 두 `latest.json`의 `platforms`를 병합해야 한다.

```bash
mkdir -p /tmp/pkt-windows-release
gh release download vX.Y.Z \
  --repo dota-pilot1/pkt-study-fullstack \
  --pattern '*.exe' --pattern '*.exe.sig' --pattern 'latest.json' \
  --dir /tmp/pkt-windows-release

gh release upload vX.Y.Z \
  /tmp/pkt-windows-release/*.exe \
  /tmp/pkt-windows-release/*.exe.sig \
  --repo dota-pilot1/pkt-study-tauri
```

Windows용 `latest.json`을 공개 Release에 그대로 올리면 macOS updater 항목이 사라진다. 따라서 소스 및 공개 Release의 JSON을 내려받아 `version`과 `pub_date`를 신규 버전으로 맞춘 후, `platforms`를 병합하고 결과에 `darwin-aarch64`, `darwin-aarch64-app`, `windows-x86_64`, `windows-x86_64-nsis` 네 키가 모두 있는지 확인해 `--clobber`로 올린다. updater endpoint는 반드시 공개 배포 저장소를 사용한다.

## 최종 검증

```bash
gh release view vX.Y.Z \
  --repo dota-pilot1/pkt-study-tauri \
  --json url,tagName,assets
```

정식 제품 릴리즈의 최소 산출물은 다음과 같습니다.

- `PKT.Study.Fullstack_VERSION_aarch64.dmg`
- `PKT.Study.Fullstack_VERSION_x64-setup.exe`
- `PKT Study Fullstack.app.tar.gz` 및 `.sig`
- `PKT.Study.Fullstack_VERSION_x64-setup.exe.sig`
- macOS와 Windows 플랫폼이 모두 포함된 `latest.json`

macOS DMG는 Apple 서명·공증·staple 검증을 통과해야 합니다. Windows 작업은 Actions 성공뿐 아니라 Release에 실제 `.exe`가 업로드됐는지 확인해야 합니다.

## 비용과 실행 원칙

- 일반 커밋이나 태그 push만으로 데스크톱 빌드를 실행하지 않습니다.
- 사용자에게 배포할 버전이 확정된 뒤 macOS와 Windows를 각각 한 번만 빌드합니다.
- macOS는 로컬에서 빌드하여 GitHub Actions 비용을 사용하지 않습니다.
- Windows는 설치 파일이 필요할 때만 수동 실행합니다.
- Windows Actions가 결제 제한으로 시작되지 않으면 코드 문제가 아니므로 GitHub Billing의 결제 수단과 Actions 예산을 확인합니다.

## v0.1.22 수동 릴리즈 기록

- 커밋: `49436b9 feat(notes): add internal LLM sample workflow`
- 태그: `v0.1.22`
- Release: <https://github.com/dota-pilot1/pkt-study-fullstack/releases/tag/v0.1.22>
- macOS: Apple Silicon DMG 직접 업로드 완료
- Developer ID 서명: 완료
- Apple notarization: `Accepted`
- stapler/Gatekeeper 검증: 완료
- DMG SHA-256: `0bc87ef11e9e276b9e5efe6b363e27b42f9540b2700c8385a37e8d363c5f7aec`
- Windows 워크플로 변경 커밋: `2c9e9cf ci(release): build Windows installer on demand`
- Windows Actions: <https://github.com/dota-pilot1/pkt-study-fullstack/actions/runs/32819319129>
- Windows 빌드 시간: 17분 3초
- Windows x64 NSIS: `PKT.Study.Fullstack_0.1.22_x64-setup.exe` (44,834,188 bytes)
- Windows 설치 파일: 같은 `v0.1.22` Release에 추가 완료
- 예상 Windows Actions 비용: 분 단위 올림 기준 약 `$0.18`

## v0.1.23 updater 릴리즈 기록

- 기능: 앱 내 업데이트 확인, 릴리스 노트, 다운로드 진행률, 설치 후 재실행
- 커밋: `d0f0f20 feat: add in-app update flow`, `127c910 fix: derive sidebar version from package`, `e8a6ed7 fix: use public updater release endpoint`, `25d33a1 fix: allow updater checks from local app origins`
- 공개 Release: <https://github.com/dota-pilot1/pkt-study-tauri/releases/tag/v0.1.23>
- macOS: Apple Silicon DMG와 updater archive를 로컬 빌드·서명, Apple 공증 `Accepted`, staple 및 Gatekeeper 검증 완료
- macOS DMG SHA-256: `f7854df0759c2a8eb314e57a86bc8cff1d318e7f2c5ffbe7a0767ae4b89e8ef0`
- updater 확인: 설치본과 `localhost` 개발본에서 모두 정상이며, v0.1.23에서 `최신 버전을 사용 중입니다.` 표시 확인
- updater 키: 로컬 보호 파일 `pkt-study-fullstack-updater.key`, GitHub Secret `TAURI_SIGNING_PRIVATE_KEY`
- Windows Actions: <https://github.com/dota-pilot1/pkt-study-fullstack/actions/runs/32825550520> (`success`, 16분 58초)
- Windows x64 NSIS: `PKT.Study.Fullstack_0.1.23_x64-setup.exe` (45,886,787 bytes) 및 `.sig`
- 공개 `latest.json`: `darwin-aarch64`, `darwin-aarch64-app`, `windows-x86_64`, `windows-x86_64-nsis` 병합 완료
- v0.1.22에는 updater 플러그인이 없으므로 v0.1.23은 한 번 수동 설치해야 하며, 이후 버전부터 앱 내부 업데이트를 사용합니다.

## v0.1.24 하이브리드 릴리즈 기록

- 소스 커밋·태그: `a1c3d48 refactor(server): separate playbook routes into service layers`, `v0.1.24`
- 공개 Release: <https://github.com/dota-pilot1/pkt-study-tauri/releases/tag/v0.1.24>
- macOS: Apple Silicon DMG와 updater archive를 로컬 빌드·Developer ID 서명, Apple 공증 `Accepted`, staple·Gatekeeper 검증 완료
- macOS DMG SHA-256: `889328b57124ebf55daec5b6196c0dde913038a20b6128bb342535edac263540`
- Windows Actions: <https://github.com/dota-pilot1/pkt-study-fullstack/actions/runs/32841443392> (`success`, 5분 42초)
- Windows x64 NSIS: `PKT.Study.Fullstack_0.1.24_x64-setup.exe` (45,764,379 bytes) 및 `.sig`
- Windows NSIS SHA-256: `fdb929eb1e89e3faef3c3541fac1b28e821385f790a91a62a7dfd42beee6fc57`
- 공개 `latest.json`: `darwin-aarch64`, `darwin-aarch64-app`, `windows-x86_64`, `windows-x86_64-nsis` 네 플랫폼을 병합하고 모든 URL을 공개 배포 저장소로 전환함
- Apple 서명·공증 값은 저장소 밖의 `pkt-apple-signing-secrets.txt`에서 값을 출력하지 않고 키별로 파싱해 사용함

## 보안 원칙

- Apple ID, 앱 전용 비밀번호, p12, updater 개인키의 원문을 로그·문서·Git에 남기지 않습니다.
- 명령에 필요한 값은 보호된 파일이나 GitHub Secret에서 읽습니다.
- 공증 제출 로그에는 비밀번호가 출력되지 않았는지 확인합니다.
- 비밀 파일을 Release asset이나 빌드 resource에 포함하지 않습니다.
