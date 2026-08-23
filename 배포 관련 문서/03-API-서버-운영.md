# API 서버 운영 런북

## 대상과 전제조건

- 대상: `sk-pkt-mes-server`
- 운영: Spring Boot JAR + systemd + Docker PostgreSQL
- GitHub Actions: `.github/workflows/backend-deploy.yml`은 `main` push 시 자동 실행되며 수동 실행도 가능
- 운영 환경변수는 EC2에서만 관리하며 저장소에 커밋하지 않습니다.
- 이 머신에 EC2 SSH 개인키가 없으면 원격 백엔드 배포를 수행할 수 없습니다.
- SSH 키 파일 경로, 권한, 보안그룹의 22번 포트 허용 여부를 먼저 확인합니다.

## 백엔드 배포 전 SSH 확인

```bash
find /Users/terecal/.ssh -maxdepth 1 -type f -print
ssh -i /명시적인/키경로.pem -o IdentitiesOnly=yes ubuntu@54.180.215.129 'hostname && systemctl is-active sample-pkt-mes.service'
```

키가 없거나 접속이 실패하면 JAR 업로드·systemd 재시작을 시도하지 않습니다. 사용자가 EC2 키를 안전한 경로로 제공하고, 키 권한을 `chmod 600`으로 설정한 뒤 진행합니다.

## 로컬 빌드

```bash
cd /Users/terecal/pilot-project/sample-pkt-project/sk-pkt-mes-server
./gradlew compileJava
./gradlew bootJar -x test
```

## EC2 확인

```bash
sudo systemctl status sample-pkt-mes.service --no-pager
sudo journalctl -u sample-pkt-mes.service -n 100 --no-pager
docker ps --filter name=sample-pkt-postgres
curl -sS http://127.0.0.1:4201/api/menus
curl -sS https://api.hibot-docu.com/api/menus
```

## 프론트·백엔드 버전 어긋남 확인

프론트가 새 쿼리 파라미터를 보내도 배포된 백엔드가 예전 버전이면 서버가 알 수 없는 파라미터를 무시할 수 있다. 이 경우 HTTP 오류 없이 화면의 동작만 바뀌지 않을 수 있으므로, 소스 코드와 배포 서버의 API 계약을 각각 확인한다.

### LOT 정렬 파라미터 확인

프론트 요청은 `page`, `size`, `sort`, `direction`을 사용한다.

```bash
curl -sS 'https://api.hibot-docu.com/api/lots?page=0&size=10&sort=updatedAt&direction=desc'
curl -sS 'https://api.hibot-docu.com/api/lots?page=0&size=10&sort=lotId&direction=asc'
```

OpenAPI에 실제로 어떤 파라미터가 노출되는지도 확인한다.

```bash
curl -sS https://api.hibot-docu.com/v3/api-docs \
  | python3 -c "import json,sys; p=json.load(sys.stdin)['paths']['/api/lots']['get']; print(p['summary']); print([q['name'] for q in p['parameters']])"
```

두 요청의 응답 순서가 달라지지 않거나 OpenAPI 파라미터에 `sort`, `direction`이 없으면, 현재 운영 서버는 정렬을 지원하지 않는 백엔드 버전이다. 이 상태에서는 프론트 정렬 UI가 요청을 보내더라도 정렬 테스트가 성공하지 않는다. API 계약 변경은 백엔드를 먼저 배포하고, 위 검증을 통과한 뒤 프론트를 배포한다.

### 소스 구현과 배포 상태를 분리해서 기록하기

다음 세 가지 결과를 함께 기록하면 “구현되지 않음”과 “배포되지 않음”을 구분할 수 있다.

```bash
rg -n "@RequestParam.*(sort|direction)|RequestMapping\(\"/api/lots\"" \
  /Users/terecal/pilot-project/sample-pkt-project/sk-pkt-mes-server/src/main/java

curl -sS https://api.hibot-docu.com/v3/api-docs \
  | python3 -c "import json,sys; p=json.load(sys.stdin); print(p.get('paths',{}).get('/api/lots',{}).get('get',{}).get('parameters',[]))"

curl -sS -o /dev/null -w '%{http_code}\n' \
  https://api.hibot-docu.com/api/llm/hospital-playbook
```

- 소스에는 파라미터가 있고 OpenAPI에는 없으면: 백엔드가 아직 배포되지 않은 상태
- OpenAPI에는 파라미터가 있고 응답 순서가 바뀌면: 정렬 기능이 운영에 반영된 상태
- 플레이북 API가 연결되지 않으면: 로컬 백엔드 또는 운영 API 접근 상태를 별도로 확인

## EC2 키 경로를 확인하는 방법

개인키 원문이나 비밀번호는 문서에 기록하지 않는다. 로컬에 이미 등록된 키 파일의 경로만 확인한다.

```bash
find /Users/terecal/.ssh -maxdepth 1 -type f -print
find /Users/terecal -type f \( -name '*.pem' -o -name '*.key' \) -print 2>/dev/null
```

후보 키를 찾았으면 권한과 접속을 확인한다.

```bash
chmod 600 /명시적인/키경로.pem
ssh -i /명시적인/키경로.pem -o IdentitiesOnly=yes \
  ubuntu@54.180.215.129 'hostname && systemctl is-active sample-pkt-mes.service'
```

키 파일이 없거나 접속이 실패하면 키를 문서나 채팅에 붙여 넣지 말고, 사용자가 안전한 로컬 경로에 키를 배치한 뒤 그 경로만 전달한다.

## 로컬 플레이북 API 확인 방법

플레이북 문서를 작성하기 전에는 로컬 백엔드를 실행하고 전용 API의 현재 경로와 요청 예시를 확인한다.

```bash
cd /Users/terecal/pilot-project/sample-pkt-project/sk-pkt-mes-server
cp .env.example .env
./gradlew bootRun
```

별도 터미널에서 API 응답을 확인한다.

```bash
curl -sS http://localhost:4201/api/llm/hospital-playbook
```

응답이 없으면 서버 로그, `.env`의 `PLAYBOOK_LLM_API_PUBLIC` 설정, Postgres 실행 여부를 확인한다. 문서 작업은 API가 정상 응답하고 현재 `spaceCode`, `topicId`, 문서 ID와 버전을 조회한 뒤 시작한다.

## 작업 상태 보고를 재현하는 방법

다음 명령을 순서대로 실행하면 배포·빌드·플레이북 작업의 남은 상태를 한 번에 확인할 수 있다. 출력 결과와 확인 시각을 작업 기록에 함께 남긴다.

### 1. 운영 LOT API 계약 확인

```bash
curl -sS https://api.hibot-docu.com/v3/api-docs \
  | python3 -c "import json,sys; p=json.load(sys.stdin)['paths']['/api/lots']['get']; print([q['name'] for q in p['parameters']])"
```

출력이 `['page', 'size']`이면 정렬을 지원하는 백엔드가 아직 운영에 배포되지 않은 것이다. 이때 프론트가 `sort`, `direction`을 보내도 오류 없이 무시될 수 있다.

### 2. 프론트 운영 빌드 재현 확인

```bash
cd /Users/terecal/pilot-project/sample-pkt-project/prac-pkt-react
test -f .env.production && echo '.env.production exists'
npm run build
```

빌드가 성공하면 운영 API URL을 포함한 프론트 빌드를 환경변수 별도 주입 없이 재현할 수 있다.

### 3. 저장소 운영 지침 확인

```bash
cd /Users/terecal/pilot-project/sample-pkt-project
rg -n "온보딩|버전 어긋남|towercrane-deploy|hibot-docu" AGENTS.md
```

운영 환경의 성격, 버전 확인 명령, 적용하면 안 되는 배포 스킬과 런북 위치가 `AGENTS.md`에 기록되어 있는지 확인한다.

### 4. 로컬 백엔드와 플레이북 API 확인

```bash
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' \
  http://localhost:4201/api/llm/hospital-playbook
lsof -nP -iTCP:4201 -sTCP:LISTEN
```

4201 포트가 LISTEN이면 로컬 서버 프로세스는 올라와 있는 상태다. 다만 플레이북 API가 `2xx`, 또는 인증·권한 확인 목적의 `401`·`403`을 반환해야 문서 작업을 시작할 수 있다. `500`이면 서버는 실행 중이지만 API가 의존하는 설정이나 DB 상태가 정상적이지 않은 것이므로 먼저 원인을 해결한다. 응답이 없으면 다음 순서로 확인한다.

```bash
cd /Users/terecal/pilot-project/sample-pkt-project/sk-pkt-mes-server
docker compose up -d postgres
./gradlew bootRun
```

### 5. EC2 백엔드 배포 가능 여부 확인

```bash
find /Users/terecal/.ssh -maxdepth 1 -type f -print
ssh -i /명시적인/키경로.pem -o IdentitiesOnly=yes \
  ubuntu@54.180.215.129 'hostname && systemctl is-active sample-pkt-mes.service'
```

키 경로와 SSH 접속이 확인되면 백엔드 배포를 진행할 수 있다. 키가 없으면 배포 작업은 보류하고, 로컬 플레이북 문서 작성처럼 독립적으로 가능한 작업을 먼저 진행한다. 개인키 내용은 상태 보고나 문서에 남기지 않는다.

### 상태 보고 예시

```text
[확인 시각] 2026-08-23 23:30 KST
[LOT API] 운영 OpenAPI는 page, size만 노출. sort, direction 배포 전.
[프론트 빌드] .env.production 존재, npm run build 성공.
[운영 지침] AGENTS.md와 배포 런북 확인 완료.
[플레이북] localhost:4201 응답 가능. 문서 작성 진행 가능.
[EC2 배포] SSH 키 경로 미확인 또는 접속 확인 필요.
[다음 작업] 플레이북 본문 및 TODO 1·2 작성 후, EC2 키 확인 시 백엔드 배포.
```

## JAR 교체

### GitHub Actions 배포

`.github/workflows/backend-deploy.yml`은 `main` push 시 자동 실행되며, GitHub 저장소의 **Actions → Deploy backend → Run workflow**에서 수동 실행할 수도 있다. 자동 실행에서는 push된 커밋을 배포하고, 수동 실행에서는 선택한 ref를 배포한다.

`production` Environment에 다음 값을 등록해야 한다.

- `EC2_HOST`: EC2 호스트명 또는 IP
- `EC2_USER`: SSH 사용자명
- `EC2_SSH_PRIVATE_KEY`: EC2 개인키 원문
- `EC2_KNOWN_HOSTS`: `ssh-keyscan`으로 확인한 호스트 키

워크플로는 JAR 빌드, EC2 업로드, 기존 JAR 백업, systemd 재시작, 외부 OpenAPI에서 LOT 정렬 파라미터 확인까지 수행한다. 검증에서 `sort`, `direction`이 없으면 배포 작업은 실패로 표시한다. 개인키와 Secret 값은 저장소 파일이나 로그에 기록하지 않는다.

### 수동 SSH 배포

1. 기존 `/home/ubuntu/sample-pkt-project/app.jar`를 날짜가 붙은 백업 파일로 복사합니다.
2. 새 JAR를 같은 경로에 업로드합니다.
3. `sudo systemctl restart sample-pkt-mes.service`를 실행합니다.
4. `systemctl is-active`와 외부 API 응답을 확인합니다.

DB 컨테이너, Docker volume, Nginx 기존 설정은 확인 없이 삭제하지 않습니다.
