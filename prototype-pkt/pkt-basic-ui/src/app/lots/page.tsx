import { LotAgGrid } from "@/features/lot-list";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function LotsPage() {
  return <RequireAuth><LotAgGrid /></RequireAuth>;
}
