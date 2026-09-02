import { PackageTestPlaceholder } from "@/features/package-test/ui/PackageTestPlaceholder";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function TestHistoryPage() {
  return <RequireAuth><PackageTestPlaceholder eyebrow="P&T QUALITY" title="불량 / 판정 이력" description="Test Result의 PASS/FAIL 판정과 불량 Bin 이력을 LOT 단위로 추적합니다." nextHref="/test-results" nextLabel="Test Result 보기" /></RequireAuth>;
}
