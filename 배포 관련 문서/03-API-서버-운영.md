# API 서버 운영 런북

## 대상과 전제조건

- 대상: `sk-pkt-mes-server`
- 운영: Spring Boot JAR + systemd + Docker PostgreSQL
- 운영 환경변수는 EC2에서만 관리하며 저장소에 커밋하지 않습니다.

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

## JAR 교체

1. 기존 `/home/ubuntu/sample-pkt-project/app.jar`를 날짜가 붙은 백업 파일로 복사합니다.
2. 새 JAR를 같은 경로에 업로드합니다.
3. `sudo systemctl restart sample-pkt-mes.service`를 실행합니다.
4. `systemctl is-active`와 외부 API 응답을 확인합니다.

DB 컨테이너, Docker volume, Nginx 기존 설정은 확인 없이 삭제하지 않습니다.
