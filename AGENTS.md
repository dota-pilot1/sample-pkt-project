# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js + Spring Boot auth/RBAC boilerplate.

For writing and reviewing MES development notes, read [`렉시컬 에디터 노트 문서 형식 관련/노트-작성법.md`](렉시컬%20에디터%20노트%20문서%20형식%20관련/노트-작성법.md). Use the accompanying body and child-document samples for the exact visual structure, and the LLM API guide for API operations. These documents define the category/topic/document hierarchy, document title conventions, Lexical code-block rules, closed-network constraints, and PKT application guidance.

- `mes-prototype-front/`: Next.js 16 frontend using App Router.
- `mes-prototype-front/src/app/`: routes, layouts, and global providers.
- `mes-prototype-front/src/widgets/`, `features/`, `entities/`, `shared/`: Feature-Sliced Design layers. Keep imports flowing downward: `app -> widgets -> features -> entities -> shared`.
- `mes-prototype-server/`: Spring Boot backend.
- `mes-prototype-server/src/main/java/com/cj/mesprototype/`: backend source, organized by bounded contexts such as `auth`, `user`, `role`, `permission`, `menu`, and `common`.
- `mes-prototype-server/src/test/`: backend tests.
- `scripts/create-project-from-template.sh`: copies this boilerplate into a renamed project.

## Build, Test, and Development Commands

Frontend:

```bash
cd mes-prototype-front
npm install
npm run dev      # Next dev server on http://localhost:4100
npm run lint     # ESLint
npm run build    # Production build and type check
```

Backend:

```bash
cd mes-prototype-server
cp .env.example .env
./gradlew bootRun                  # API on http://localhost:4101
./gradlew compileJava testClasses  # Compile source and tests
./gradlew test                     # Run JUnit tests; requires Postgres
```

Database:

```bash
docker compose up -d postgres
```

## Coding Style & Naming Conventions

Use TypeScript, React function components, and path aliases such as `@/shared/ui/...`. Keep frontend files grouped by feature/domain, not by UI type alone. Backend packages should follow the existing DDD-style context layout: `presentation`, `application`, `domain`, and `infrastructure`.

Use clear names: `RolePermissionManager`, `UserManagementService`, `CreateRoleRequest`. Avoid committing generated files.

## Testing Guidelines

Frontend verification currently relies on `npm run lint` and `npm run build`. Backend tests use JUnit with Spring Boot. Name backend tests after the class or behavior under test, for example `AuthServiceTests` or `RoleControllerTests`.

## Commit & Pull Request Guidelines

Follow the existing concise conventional style:

- `feat(front): add ...`
- `docs: update ...`
- `chore: harden ...`

Pull requests should include a short summary, verification commands run, linked issues if applicable, and screenshots for UI changes.

## Security & Configuration Tips

Never commit real secrets. Backend local secrets belong in `mes-prototype-server/.env`, which is ignored. Commit only `.env.example`. `application.yaml` should reference environment variables, not raw keys.

## PKT LLM Note API

When adding PKT learning notes, use the current Tauri app's `API for LLM` base URL and request examples as the source of truth. First verify the screen-selected 1st/2nd-level location with `tree` or `topic`; never hard-code a topic ID such as `151`, assume the repository's Spring API is the note app, or call `structure` when the location already exists. For web-development practice, make one TODO a body document and split long TODOs into API implementation and Front implementation child documents; do not force an API child for frontend-only work. Verify parent IDs, versions, Lexical code blocks, and rendered location through read endpoints. Prefer the dedicated playbook API over direct database writes. Tokenless access is local-only when supported by the current app configuration; never enable it for production.

## 운영 환경 성격 (온보딩용 테스트 환경)

`https://hibot-docu.com`(프론트)과 `https://api.hibot-docu.com`(API)은 **온보딩·학습을 위한 테스트 환경**입니다. 실제 고객 데이터가 없으므로 다음을 운영에서 그대로 해도 됩니다.

- 샘플 시더가 운영 DB에 데이터를 생성·갱신하는 것 (`LotSampleDataSeeder` 등)
- 검증 목적의 배포와 재배포, 데이터 초기화
- 실습 중인 미완성 기능의 배포

즉 "운영 반영"은 승인 절차가 필요한 릴리스가 아니라 실습의 한 단계로 취급합니다. 다만 배포 후에는 프론트와 백엔드 버전이 어긋나지 않았는지 반드시 확인합니다.

주의: 이 도메인은 원래 `towercrane-for-uiux`(Node·pm2·SQLite)가 쓰던 인프라 슬롯을 인계받았습니다. **`towercrane-deploy` 스킬은 이 프로젝트에 적용되지 않습니다.** 현재 `api.hibot-docu.com`은 `sk-pkt-mes-server`(Spring Boot + Postgres)가 서빙하고 있습니다.

### Tauri 로컬 데이터 배포 필수 지침

`pkt-study-fullstack`은 화면 코드와 학습 데이터가 분리된 Tauri 앱이다. 메뉴 생성 코드만 배포하면 본문이 없는 메뉴가 생기므로, UI 갤러리·샘플 노트 등 배포 대상 로컬 데이터도 반드시 릴리즈에 포함한다.

- 릴리즈 전 `pkt-study-fullstack/.data/pkt-study.db`를 기준 시드로 확정하고 백업한다.
- 기준 시드는 릴리즈 저장소에 추적되는 패키징 경로에 포함되어야 하며, `.gitignore`에 걸린 로컬 DB를 그대로 두고 배포하지 않는다.
- 빌드 후 패키징된 시드에 의도한 `space/category/topic/document`와 본문 수가 들어갔는지 확인한다. 메뉴 개수만 확인하지 않는다.
- 기존 설치 DB는 덮어쓰지 않되, 신규 시스템 갤러리와 문서는 `PKT_STUDY_SEED_DB` 병합 경로로 추가되어야 한다.
- 최종 검증은 새 설치 DB와 기존 사용자 DB 복제본 양쪽에서 UI 갤러리 문서 본문이 보이는지 확인한 뒤 진행한다.
- Tauri 릴리즈 커밋에는 앱 코드, 패키징 시드, 데이터 병합 코드, 버전 파일을 함께 포함한다.

### 버전 어긋남 확인

프론트만 배포하면 서버가 모르는 쿼리 파라미터를 조용히 무시해 기능이 "에러 없이 안 먹는" 상태가 됩니다. 배포 후 다음으로 확인합니다.

```bash
curl -s https://api.hibot-docu.com/v3/api-docs | python3 -c "import json,sys; p=json.load(sys.stdin)['paths']['/api/lots']['get']; print(p['summary'], [q['name'] for q in p['parameters']])"
```

API 계약이 바뀌는 변경은 **백엔드를 먼저 배포**하고 위 응답으로 확인한 뒤 프론트를 배포합니다.
