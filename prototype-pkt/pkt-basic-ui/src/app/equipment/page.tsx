import { PackageTestPlaceholder } from "@/features/package-test/ui/PackageTestPlaceholder";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function EquipmentPage() {
  return <RequireAuth><PackageTestPlaceholder eyebrow="P&T MASTER" title="설비" description="Tester와 테스트 설비의 가동 상태 및 배정 기준을 관리합니다." nextHref="/test-runs" nextLabel="Test 실행 보기" /></RequireAuth>;
}
