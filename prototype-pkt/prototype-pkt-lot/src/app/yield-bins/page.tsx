import { PackageTestPlaceholder } from "@/features/package-test/ui/PackageTestPlaceholder";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function YieldBinsPage() { return <RequireAuth><PackageTestPlaceholder eyebrow="P&T ANALYTICS" title="수율·Bin 분석" description="제품·공정·Tester별 수율과 Fail Bin 분포를 분석합니다." nextHref="/test-results" nextLabel="테스트 결과 확인" /></RequireAuth>; }
