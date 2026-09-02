import { PackageTestPlaceholder } from "@/features/package-test/ui/PackageTestPlaceholder";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function ProcessesPage() {
  return <RequireAuth><PackageTestPlaceholder eyebrow="P&T MASTER" title="공정" description="제품별 테스트 공정 경로와 순서를 관리합니다." nextHref="/products" nextLabel="제품 기준정보 보기" /></RequireAuth>;
}
