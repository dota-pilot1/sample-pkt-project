import { PackageTestPlaceholder } from "@/features/package-test/ui/PackageTestPlaceholder";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function TestResultsPage() { return <RequireAuth><PackageTestPlaceholder eyebrow="P&T RESULT" title="테스트 결과" description="LOT·Tester·검사항목별 측정값과 PASS/FAIL 결과를 조회합니다." nextHref="/test-runs" nextLabel="테스트 실행으로 이동" /></RequireAuth>; }
