# macOS 공증 중요 디버깅

## 2026-08-25 릴리즈에서 확인한 원인

`v0.1.25` 릴리즈 중 첫 번째 `xcrun notarytool submit`은 다음 오류로 실패했다.

```text
HTTP status code: 401. Invalid credentials.
```

Apple ID나 app-specific password를 며칠 만에 교체해야 해서 발생한 문제는 아니었다. 첫 시도와 두 번째 시도의 셸 명령 형태가 달랐고, 두 번째 시도에서 동일 DMG가 정상 제출되어 공증 결과는 `Accepted`였다.

첫 시도는 다음처럼 환경변수 대입, 파일 읽기, 명령 실행을 한 줄에 섞은 형태였다.

```bash
SECRET_DIR='...'
NOTARY_APPLE_ID="$(tr -d '\r\n' < "$SECRET_DIR/apple_id.txt")" \
NOTARY_PASSWORD="$(tr -d '\r\n' < "$SECRET_DIR/apple_app_specific_password.txt")" \
xcrun notarytool submit "$DMG_PATH" \
  --apple-id "$NOTARY_APPLE_ID" \
  --password "$NOTARY_PASSWORD" \
  --team-id '5PRM3RRTSH' \
  --wait
```

이 형태가 반드시 실패하는 것은 아니며, 현재 재현 실험만으로 셸 평가 순서를 직접적인 원인으로 확정할 수는 없었다. 다만 실패 원인을 줄이기 위해 파일 읽기와 변수 대입을 명령 실행과 분리하고, 비밀번호를 `tr`·`sed` 등으로 가공하지 않는 방식으로 통일한다.

## 재현 가능한 안전한 실행법

변수 대입을 명령 실행과 분리한다. 아래 명령은 비밀값을 출력하거나 변형하지 않는다.

```bash
SECRET_DIR='/Users/terecal/english-agent-hub-container/배포 가이드/.local-secrets'
DMG_PATH="$(pwd)/src-tauri/target/release/bundle/dmg/PKT Study Fullstack_0.1.25_aarch64.dmg"
APPLE_ID_VALUE="$(<"$SECRET_DIR/apple_id.txt")"
APP_PASSWORD_VALUE="$(<"$SECRET_DIR/apple_app_specific_password.txt")"

xcrun notarytool submit "$DMG_PATH" \
  --apple-id "$APPLE_ID_VALUE" \
  --password "$APP_PASSWORD_VALUE" \
  --team-id '5PRM3RRTSH' \
  --wait
```

정상 순서는 다음과 같다.

1. `Submission ID received`가 출력되는지 확인한다.
2. `status: Accepted`를 확인한다.
3. `xcrun stapler staple`과 `xcrun stapler validate`를 실행한다.
4. `spctl --assess ...` 결과가 `source=Notarized Developer ID`인지 확인한다.

## 실패 시 점검 순서

### 1. 파일 형식만 확인

값 자체를 출력하지 말고 개행·공백·BOM 여부만 확인한다.

```bash
python3 - "$SECRET_DIR/apple_id.txt" "$SECRET_DIR/apple_app_specific_password.txt" <<'PY'
import sys
from pathlib import Path

for name in sys.argv[1:]:
    raw = Path(name).read_bytes()
    text = raw.decode('utf-8', 'replace')
    print(Path(name).name, {
        'bytes': len(raw),
        'newline_count': text.count('\n'),
        'cr_count': text.count('\r'),
        'leading_whitespace': text[:1].isspace() if text else False,
        'trailing_whitespace': text[-1:].isspace() if text else False,
        'non_ascii': any(ord(char) > 127 for char in text),
    })
PY
```

### 2. 자격증명만 검증

DMG 문제가 아니라 인증 단계에서 실패하면 `Submission ID`가 발급되지 않는다. Apple ID, app-specific password, Team ID를 확인하고, `account.apple.com`의 App-Specific Passwords 목록에서 해당 비밀번호가 폐기되지 않았는지 확인한다.

기본 Apple Account 비밀번호를 변경·재설정했거나 app-specific password를 폐기한 경우에는 새 app-specific password를 발급해야 한다. 정기적인 며칠 단위 교체는 필요하지 않다. 자격증명이 정상인데 401이 한 번만 발생하고 같은 값으로 재시도해 성공했다면, 공증 서비스의 일시적인 인증 검증 실패 가능성도 기록하고 재시도한다.

### 3. 제출 이후 검증

```bash
xcrun stapler staple "$DMG_PATH"
xcrun stapler validate "$DMG_PATH"
spctl --assess --type open --context context:primary-signature --verbose=4 "$DMG_PATH"
```

`source=Unnotarized Developer ID`이면 서명은 되었지만 공증 티켓이 없는 상태다. 이 DMG를 정식 macOS Release로 배포하지 말고 공증부터 완료한다.

## 기록

- 대상 릴리즈: `v0.1.25`
- 첫 실패: 인라인 파일 읽기·환경변수 대입 방식에서 `401 Invalid credentials`
- 수정: 파일 값을 직접 읽어 별도 셸 변수에 대입하고, 비밀값을 가공하지 않도록 실행 방식 통일
- 결과: Submission ID 발급, `Accepted`, staple/validate 성공, `source=Notarized Developer ID`
- 원인 판정: 계정·비밀번호를 교체하지 않고 동일 값 재시도에 성공했으므로 정기 만료는 아님. 셸 명령 형태 차이 또는 Apple 인증 서비스의 일시적 검증 실패 중 하나로 기록하며, 단일 원인으로 단정하지 않음.
- DMG SHA-256: `95e074e5a404d7606c7257cbac5d1d515cdf192e403224b286c794d4f446d37d`

비밀번호, 개인키, Apple ID 원문은 이 문서나 Git에 기록하지 않는다.
