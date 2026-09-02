import { LotQualityStandardManagement } from "@/features/lot-quality-standard/LotQualityStandardManagement";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function QualityStandardsPage() {
  return <RequireAuth><LotQualityStandardManagement /></RequireAuth>;
}
