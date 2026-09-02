import { PackageTestPlaceholder } from "@/features/package-test/ui/PackageTestPlaceholder";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function TestRunsPage() { return <RequireAuth><PackageTestPlaceholder eyebrow="P&T EXECUTION" title="테스트 실행" description="입고 LOT에 승인된 테스트 스펙을 적용하고 Tester 실행을 관리합니다." nextHref="/test-specs" nextLabel="테스트 스펙 확인" /></RequireAuth>; }
